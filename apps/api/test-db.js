const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const attendances = await prisma.attendance.findMany();
  console.log('All attendances:', attendances);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  console.log('Querying for today:', today);
  
  const todayAttendances = await prisma.attendance.findMany({
    where: { date: today }
  });
  console.log('Today attendances:', todayAttendances);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
