const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// const currentDate = dayjs().utc().year(2026).month(0).date(1).startOf('day');
// const today = dayjs().format('YYYY-MM-DD');
// const endDate = dayjs.utc(today).startOf('day');
// // console.log(currentDate.toDate());
// // console.log(endDate.toDate());

// function getRandomTimeOnDate(baseDate, startHour, endHour) {
//   const hour = startHour + Math.floor(Math.random() * (endHour - startHour + 1));
//   const minute = Math.floor(Math.random() * 60);
//   const second = Math.floor(Math.random() * 60);

//   const dateStr = dayjs(baseDate).format('YYYY-MM-DD');
//   return dayjs.tz(`${dateStr} ${hour}:${minute}:${second}`, 'Asia/Jakarta').utc().toDate();
// }

// let loopDate = currentDate;
// while (loopDate.isBefore(endDate) || loopDate.isSame(endDate)) {
//   const dateRecord = loopDate.toDate();
//   const check_in = getRandomTimeOnDate(dateRecord, 8, 9);
//   const check_out = getRandomTimeOnDate(dateRecord, 17, 18);
//   console.log(check_in, check_out);
//   loopDate = loopDate.add(1, 'day');
// }

const today = dayjs().tz('Asia/Jakarta').startOf('day').utc(true);
console.log(today.toDate());
