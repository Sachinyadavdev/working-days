import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '@ems/shared-types';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'secret',
    } as any);
  }

  async validate(payload: JwtPayload & { isResetToken?: boolean }) {
    if (!payload.sub || payload.isResetToken) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        isActive: true,
        roles: { where: { role: { deletedAt: null, status: 'ACTIVE' } }, include: { role: true } },
      },
    });
    if (!user?.isActive) throw new UnauthorizedException('Account is inactive or no longer exists');

    return {
      sub: payload.sub,
      email: payload.email,
      roles: user.roles.map(({ role }) => role.name),
    };
  }
}
