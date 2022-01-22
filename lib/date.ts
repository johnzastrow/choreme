import {IRecurrence} from "../models/recurrence.model";
import moment from "moment";

/**
 * Convert date to formated string.
 *
 * @param {Date} date
 */
export function formatDate(date: Date) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", dateOptions);
}

export function calculateNextStartDate(recurrence: IRecurrence) {
  switch (recurrence.type) {
    case "Weekly":
      // if we haven't yet passed the day of the week that I need:
      let today = moment().isoWeekday();
      const nextDay = nextGreaterNumber(today, recurrence.repeat);
      if(nextDay){
        return moment().isoWeekday(nextDay).toDate();
      }else {
        return moment().add(1, 'weeks').isoWeekday(recurrence.repeat[0]).toDate();
      }
    case "Monthly":
      const currentDate = moment().date()
      const nextDate = nextGreaterNumber(currentDate, recurrence.repeat);
      if(nextDate){
        return moment().date(nextDate).toDate();
      }else {
        return moment().add(1, 'months').date(recurrence.repeat[0]).toDate();
      }
    default:
      let _today = moment().isoWeekday();
      const _nextDay = nextGreaterNumber(_today, [1,2,3,4,5,6,7]);
      if(_nextDay){
        return moment().isoWeekday(_nextDay).toDate();
      }else {
        return moment().add(1, 'weeks').isoWeekday(recurrence.repeat[0]).toDate();
      }
  }
}

function nextGreaterNumber(currentDay: number, days: number[]) {
  let _nextGreaterDay: number | undefined;
  for (let i = 0; i < days.length; i++) {
    if (days[i] > currentDay) {
      _nextGreaterDay = days[i];
      break;
    }
  }
  return _nextGreaterDay;
}
