import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { LoggerService } from '../../logger/logger.service';
import { SecurityService } from '../security/security.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { APP_CONSTANTS } from '../../common/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly logger: LoggerService,
    private readonly securityService: SecurityService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, department, designation, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, APP_CONSTANTS.BCRYPT_SALT_ROUNDS);

    // Generate Employee Code (e.g., EMP-123456)
    const employeeCode = `EMP-${Date.now().toString().slice(-6)}`;

    // Create user with default EMPLOYEE role and nested Employee profile
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        employee: {
          create: {
            employeeCode,
            departmentId: department || null,
            designationId: designation || null,
            phone: phone || null,
            dateOfJoining: new Date(),
          },
        },
        roles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: 'EMPLOYEE' },
                create: { name: 'EMPLOYEE', description: 'Default employee role' },
              },
            },
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, ['EMPLOYEE']);

    this.logger.log(`User registered: ${user.email}`, 'AuthService');

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string) {
    const { email, password } = loginDto;

    // Brute force check
    const failedAttempts = await this.securityService.getRecentFailedAttempts(email, 15);
    if (failedAttempts >= 5) {
      throw new UnauthorizedException('Too many failed login attempts. Please try again later.');
    }

    // Find user with roles
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      await this.securityService.logLoginAttempt(email, ipAddress, userAgent, false);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      await this.securityService.logLoginAttempt(email, ipAddress, userAgent, false);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.securityService.logLoginAttempt(email, ipAddress, userAgent, true);
    
    if (user.forcePasswordReset) {
      // Generate a temporary token specifically for resetting the password
      const tempToken = await this.jwtService.signAsync(
        { sub: user.id, email: user.email, isResetToken: true },
        { expiresIn: '15m' }
      );
      return {
        requiresPasswordReset: true,
        tempToken,
        user: {
          email: user.email,
        }
      };
    }

    // Create/Update Device History
    // We can use a device ID from request headers or default to UserAgent + IP hash for simplicity
    const deviceId = bcrypt.hashSync(userAgent + ipAddress, 2).substring(0, 16);
    await this.securityService.recordDevice(user.id, deviceId, ipAddress, userAgent);


    // Extract role names
    const roleNames = user.roles.map((ur) => ur.role.name);

    // Extract permission names and cache them
    const permissions = user.roles.flatMap((ur) =>
      ur.role.permissions.map((rp) => rp.permission.name),
    );

    // Cache permissions in Redis
    await this.redisService.setJson(
      `user:${user.id}:permissions`,
      [...new Set(permissions)],
      APP_CONSTANTS.REDIS_TTL.PERMISSIONS,
    );

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, roleNames);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`User logged in: ${user.email}`, 'AuthService');

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        roles: roleNames,
      },
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    // Find the refresh token in DB
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { roles: { include: { role: true } } } } },
    });

    if (
      !storedToken ||
      storedToken.userId !== userId ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old refresh token (token rotation)
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const roleNames = storedToken.user.roles.map((ur) => ur.role.name);
    const tokens = await this.generateTokens(userId, storedToken.user.email, roleNames);

    this.logger.log(`Token refreshed for user: ${storedToken.user.email}`, 'AuthService');

    return tokens;
  }

  async logout(userId: string) {
    // Revoke all refresh tokens for the user
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // Clear cached permissions
    await this.redisService.del(`user:${userId}:permissions`);

    this.logger.log(`User logged out: ${userId}`, 'AuthService');

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (user) {
      // Invalidate existing active tokens
      await this.prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      const token = uuidv4();
      const expiresAt = new Date(Date.now() + APP_CONSTANTS.PASSWORD_RESET_TOKEN_EXPIRY);

      await this.prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });

      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;
      
      this.logger.log(`[DEV ONLY] Password reset link for ${user.email}: ${resetLink}`);
      // TODO: Replace with actual email sending service
    }

    // Always return a success message (prevents email enumeration)
    return { message: 'If that email address is in our database, we will send you an email to reset your password.' };
  }

  async firstLoginReset(dto: ResetPasswordDto): Promise<{ message: string }> {
    let payload;
    try {
      payload = await this.jwtService.verifyAsync(dto.token);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired temporary token');
    }

    if (!payload.isResetToken) {
      throw new UnauthorizedException('Invalid token type');
    }

    const userId = payload.sub;
    const passwordHash = await bcrypt.hash(dto.newPassword, APP_CONSTANTS.BCRYPT_SALT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { 
          passwordHash,
          forcePasswordReset: false 
        },
      }),
      this.prisma.refreshToken.deleteMany({
        where: { userId },
      }),
    ]);

    this.logger.log(`First login password reset completed for user: ${userId}`);

    return { message: 'Password has been successfully updated. Please login with your new password.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, APP_CONSTANTS.BCRYPT_SALT_ROUNDS);

    await this.prisma.$transaction([
      // Update password
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      // Mark token as used
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all refresh tokens
      this.prisma.refreshToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    this.logger.log(`Password reset completed for user: ${resetToken.userId}`);

    return { message: 'Password has been successfully reset' };
  }

  private async generateTokens(userId: string, email: string, roles: string[]) {
    const payload = { sub: userId, email, roles };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.generateRefreshToken(userId),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }
}
