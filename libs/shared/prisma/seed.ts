import { PrismaClient } from '../src/lib/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  }),
});

function getRandomTimeOnDate(baseDate: Date, startHour: number, endHour: number) {
  const hour = startHour + Math.floor(Math.random() * (endHour - startHour + 1));
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);

  const dateStr = dayjs(baseDate).format('YYYY-MM-DD');
  return dayjs.tz(`${dateStr} ${hour}:${minute}:${second}`, 'Asia/Jakarta').utc().toDate();
}

async function main() {
  const userIds = [1];
  const currentDate = dayjs().utc().year(2026).month(0).date(1).startOf('day');
  const today = dayjs().format('YYYY-MM-DD');
  const endDate = dayjs.utc(today).startOf('day');

  const password = 'jhondoe123';
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email: 'jhondoe@mail.com',
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Jhon Doe',
      phone: '+6212345678',
      photo_url: '',
      position: 'HRD',
    },
  });

  for (const user_id of userIds) {
    let loopDate = currentDate;

    while (loopDate.isBefore(endDate) || loopDate.isSame(endDate)) {
      const dateRecord = loopDate.toDate();

      const check_in = getRandomTimeOnDate(dateRecord, 8, 9);
      const check_out = getRandomTimeOnDate(dateRecord, 17, 18);

      try {
        await prisma.attendance.create({
          data: {
            user_id,
            date: dateRecord,
            check_in,
            check_out,
          },
        });
        console.log(`Success: User ${user_id} on ${loopDate.format('YYYY-MM-DD')}`);
      } catch {
        console.error(`Skip: Data already exists for ${loopDate.format('YYYY-MM-DD')}`);
      }

      loopDate = loopDate.add(1, 'day');
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
