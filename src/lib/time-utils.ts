import { format, parse } from "date-fns";

/**
 * Converts "14:30" (24h) to "02:30 PM" (12h)
 */
export const formatTo12Hour = (time24: string): string => {
  if (!time24) return "";
  try {
    const parsed = parse(time24, "HH:mm", new Date());
    return format(parsed, "hh:mm a").toUpperCase();
  } catch (e) {
    return time24;
  }
};

/**
 * Ensures any time string is displayed in uppercase AM/PM format
 */
export const displayAsAMPM = (timeStr: string): string => {
  if (!timeStr) return "";
  const clean = timeStr.trim().toUpperCase();
  if (clean.includes("AM") || clean.includes("PM")) return clean;
  
  try {
    let [hours, minutes] = clean.split(':');
    let hrs = parseInt(hours, 10);
    const suffix = hrs >= 12 ? 'PM' : 'AM';
    if (hrs === 0) hrs = 12;
    if (hrs > 12) hrs -= 12;
    return `${hrs.toString().padStart(2, '0')}:${minutes} ${suffix}`;
  } catch (e) {
    return timeStr;
  }
};

/**
 * Calculates difference between time strings (supports both 12h and 24h formats)
 */
export const calculateTimeDifference = (outTimeStr: string, inTimeStr: string): string => {
  if (!outTimeStr || !inTimeStr) return "--";
  
  const getMinutes = (timeStr: string) => {
    const cleanTimeStr = timeStr.trim().toUpperCase();
    const hasModifier = cleanTimeStr.includes('AM') || cleanTimeStr.includes('PM');
    
    if (!hasModifier) {
      // 24 hour format
      let [hours, minutes] = cleanTimeStr.split(':');
      return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    }
    
    // 12 hour format
    let [time, modifier] = cleanTimeStr.split(' ');
    let [hours, minutes] = time.split(':');
    let hrs = parseInt(hours, 10);
    if (hrs === 12) hrs = 0;
    if (modifier === 'PM') hrs += 12;
    return hrs * 60 + parseInt(minutes, 10);
  };

  try {
    const outMins = getMinutes(outTimeStr);
    const inMins = getMinutes(inTimeStr);
    
    if (isNaN(outMins) || isNaN(inMins)) return "--";

    let diffMinutes = inMins - outMins;
    if (diffMinutes < 0) diffMinutes += 1440; // Next day

    const hrs = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;

    if (hrs === 0 && mins === 0) return "0 mins";
    if (hrs === 0) return `${mins} mins`;
    if (mins === 0) return `${hrs} hrs`;
    return `${hrs} hrs ${mins} mins`;
  } catch (e) {
    return "--";
  }
};
