import {
  add,
  eachQuarterOfInterval,
  endOfYear,
  getQuarter,
  startOfYear,
} from 'date-fns';

export const currentDate = new Date();
const currentQuarter = getQuarter(currentDate);

export const quarters = eachQuarterOfInterval({
  start: startOfYear(currentDate),
  end: endOfYear(currentDate),
});
export const targetQuarterDate = add(quarters[currentQuarter - 1], {
  months: 3,
});

export const upperQuarterDate = add(quarters[currentQuarter - 1], {
  months: 6,
});

export function getQuarterInfo() {
  const date = new Date();
  const month = date.getMonth();
  const currentQuarter = Math.floor(month / 3) + 1;
  const nextQuarterMonth = currentQuarter * 3;
  const nextYear =
    nextQuarterMonth < 12 ? date.getFullYear() : date.getFullYear() + 1;
  // Determine the start of the next quarter
  const nextQuarterStart = new Date(nextYear, nextQuarterMonth % 12, 1);
  // const nextQuarterMonth = (Math.floor(month / 3) + 1) * 3;

  // Calculate the next quarter number
  const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1;
  const nextQuarterShort = `Q${nextQuarter} ${nextYear}`;

  // Calculate the next 2 quarters ahead
  const next2Quarter =
    currentQuarter === 3 ? 1 : currentQuarter === 4 ? 2 : currentQuarter + 2;
  // For next2Quarter, we need to check if we're going into a new year
  const next2QuarterYear =
    next2Quarter < currentQuarter ? nextYear + 1 : nextYear;
  const next2QuarterShort = `Q${next2Quarter} ${next2QuarterYear}`;

  // Calculate days remaining for the next quarter
  const today = new Date();
  const normalizedNextQuarterMonth = nextQuarterMonth % 12;
  const firstDayOfNextQuarter = new Date(
    nextYear,
    normalizedNextQuarterMonth,
    1,
  );
  const remainsDaysToNextQuater = getDifferenceInDays(
    firstDayOfNextQuarter.toISOString(),
    today.toISOString(),
  );

  // Previous quarter calculations
  const prevQuarterMonth = (Math.floor(month / 3) - 1) * 3;
  const prevYear =
    prevQuarterMonth >= 0 ? date.getFullYear() : date.getFullYear() - 1;
  const prevQuarterStart = new Date(prevYear, (prevQuarterMonth + 12) % 12, 1);

  // Previous month calculations
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear =
    month === 0 ? date.getFullYear() - 1 : date.getFullYear();
  const prevMonthStart = new Date(prevMonthYear, prevMonth, 1);

  // Get quarter dates
  const { startDate, endDate } = getQuarterDates(
    date.getFullYear(),
    currentQuarter,
  );
  const { startDate: prevStartDate, endDate: prevEndDate } = getQuarterDates(
    prevYear,
    Math.floor(prevQuarterMonth / 3) + 1,
  );

  const nextDeliveryText = `${nextQuarterStart.toLocaleString('en', {
    month: 'long',
  })} 1st ${nextYear}`;
  const nextDeliveryTextShort = `${nextQuarterStart.toLocaleString('en', {
    month: 'short',
  })} 1st ${nextYear}`;

  return {
    currentQuarter,
    nextQuarter,
    nextQuarterShort,
    next2Quarter,
    next2QuarterShort,
    daysToNextQuarter: remainsDaysToNextQuater,
    year: date.getFullYear(),
    nextQuarterMonth,
    startDate,
    endDate,
    remainsDaysToNextQuater,
    prevQuarterMonth,
    prevQuarterYear: prevYear,
    prevQuarterStart,
    prevMonth,
    quarterly: getDifferenceInDays(endDate.toString(), startDate.toString()),
    prevMonthYear,
    prevMonthStart,
    prevStartDate,
    prevEndDate,
    nextDeliveryText,
    nextDeliveryTextShort,
  };
}

export function getQuarterDates(year: number, quarterNumber: number) {
  // Define the start month for each quarter (0-based for JavaScript Date)
  const startMonth = (quarterNumber - 1) * 3;

  // Create the start date of the quarter
  const startDate = new Date(year, startMonth, 1);

  // Create the end date of the quarter (last day of the last month in the quarter)
  const endDate = new Date(year, startMonth + 3, 0);

  return { startDate, endDate };
}

export function getDifferenceInDays(date1: string, date2: string) {
  // Ensure the input is converted to Date objects
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Calculate the difference in time (milliseconds)
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());

  // Convert milliseconds to days
  const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return diffInDays;
}

export function getCardImage(brand: string) {
  const value = brand.toLowerCase();

  if (value === 'mastercard') {
    return '/images/payment-cards/mastercard.svg';
  }

  if (value === 'jbc') {
    return '/images/payment-cards/jbc.svg';
  }

  if (value === 'american express' || value === 'american-express') {
    return '/images/payment-cards/american-express.svg';
  }

  if (value === 'unionpay') {
    return '/images/payment-cards/unionpay.svg';
  }

  if (value === 'diners_club') {
    return '/images/payment-cards/diners_club.svg';
  }

  if (value === 'discover') {
    return '/images/payment-cards/discover.svg';
  }
  return '/images/payment-cards/visa.svg';
}

export function formatDate(value: string) {
  const date = new Date(value);
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    year: 'numeric',
  };
  const monthYear = date.toLocaleDateString('en-US', options);
  const day = date.getDate();

  // Determine the correct ordinal suffix
  let suffix: string;

  if (day % 10 === 1 && day !== 11) {
    suffix = 'st';
  } else if (day % 10 === 2 && day !== 12) {
    suffix = 'nd';
  } else if (day % 10 === 3 && day !== 13) {
    suffix = 'rd';
  } else {
    suffix = 'th';
  }

  return `${monthYear.split(' ')[0]} ${day}${suffix} ${
    monthYear.split(' ')[1]
  }`;
}
