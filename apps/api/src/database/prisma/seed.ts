import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create roles
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: 'SUPER_ADMIN' }, update: {}, create: { name: 'SUPER_ADMIN', description: 'Super administrator with full access', isSystem: true } }),
    prisma.role.upsert({ where: { name: 'ADMIN' }, update: {}, create: { name: 'ADMIN', description: 'Administrator', isSystem: true } }),
    prisma.role.upsert({ where: { name: 'MANAGER' }, update: {}, create: { name: 'MANAGER', description: 'Team/Project manager', isSystem: true } }),
    prisma.role.upsert({ where: { name: 'EMPLOYEE' }, update: {}, create: { name: 'EMPLOYEE', description: 'Regular employee', isSystem: true } }),
  ]);

  // Create default permissions
  const modules = ['user', 'employee', 'project', 'task', 'team', 'attendance', 'leave', 'notification'];
  const actions = ['create', 'read', 'update', 'delete'];

  for (const mod of modules) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: { module_action: { module: mod, action } },
        update: {},
        create: { name: `${mod}:${action}`, module: mod, action, description: `${action} ${mod}` },
      });
    }
  }

  // Assign all permissions to SUPER_ADMIN
  const allPermissions = await prisma.permission.findMany();
  const superAdminRole = roles[0];
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: perm.id },
    });
  }

  // Create default admin user
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ems.com' },
    update: {},
    create: {
      email: 'admin@ems.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Admin',
      emailVerified: true,
    },
  });

  // Assign SUPER_ADMIN role to admin user
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: superAdminRole.id },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📧 Admin login: admin@ems.com / Admin@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
