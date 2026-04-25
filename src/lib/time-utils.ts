import { format, parse, differenceInMinutes } from "date-fns";

/**
 * Converts "14:30" (24h) to "02:30 PM" (12h)
 */
export const formatTo12Hour = (time24: string): string => {
  if (!time24) return "";
  try {
    const parsed = parse(time24, "HH:mm", new Date());
    return format(parsed, "hh:mm A");
  } catch (e) {
    return time24;
  }
};

/**
 * Calculates difference between "hh:mm A" strings
 */
export const calculateTimeDifference = (outTimeStr: string, inTimeStr: string): string => {
  if (!outTimeStr || !inTimeStr) return "--";
  try {
    const today = new Date();
    const outTime = parse(outTimeStr, "hh:mm A", today);
    const inTime = parse(inTimeStr, "hh:mm A", today);

    let diffMinutes = differenceInMinutes(inTime, outTime);
    
    // Handle overnight logic if needed (e.g., if inTime is earlier than outTime)
    if (diffMinutes < 0) diffMinutes += 1440;

    const hrs = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;

    if (hrs === 0) return `${mins} mins`;
    if (mins === 0) return `${hrs} hrs`;
    return `${hrs} hrs ${mins} mins`;
  } catch (e) {
    return "--";
  }
};
