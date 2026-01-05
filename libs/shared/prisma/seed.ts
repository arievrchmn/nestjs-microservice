import { PrismaClient } from '../src/lib/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  }),
});

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Generate random time offset in milliseconds
function randomTimeOffset(startHour: number, endHour: number) {
  const hour = startHour + Math.floor(Math.random() * (endHour - startHour + 1));
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  const date = new Date();
  date.setHours(hour, minute, second, 0);
  return date;
}

async function main() {
  const userIds = [1]; // example users
  const startDate = new Date(2026, 0, 1); // Jan 1, 2026
  const endDate = new Date(); // today

  for (const user_id of userIds) {
    let currentDate = startDate;
    while (currentDate <= endDate) {
      const date = startOfDay(currentDate);
      const check_in = randomTimeOffset(8, 9); // 08:00 - 10:00
      const check_out = randomTimeOffset(17, 18); // 16:00 - 18:00

      await prisma.attendance.create({
        data: {
          user_id,
          date,
          check_in,
          check_out,
        },
      });

      // next day
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  console.log('Seeding completed!');
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
