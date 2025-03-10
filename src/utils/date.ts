import { add, eachQuarterOfInterval, endOfYear, getQuarter, startOfYear } from "date-fns";

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

