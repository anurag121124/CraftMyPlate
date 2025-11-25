export function calculatePrice(baseRate: number, startTime: Date, endTime: Date): number {
  const peakStart1 = 10;
  const peakEnd1 = 13;
  const peakStart2 = 16;
  const peakEnd2 = 19;

  let totalPrice = 0;
  const current = new Date(startTime);

  while (current < endTime) {
    const hourStart = new Date(current);
    const hourEnd = new Date(current);
    hourEnd.setHours(hourEnd.getHours() + 1);
    
    if (hourEnd > endTime) {
      hourEnd.setTime(endTime.getTime());
    }

    const hour = hourStart.getHours();
    const dayOfWeek = hourStart.getDay();

    const isPeak = dayOfWeek >= 1 && dayOfWeek <= 5 &&
                   ((hour >= peakStart1 && hour < peakEnd1) || (hour >= peakStart2 && hour < peakEnd2));

    const rate = isPeak ? baseRate * 1.5 : baseRate;
    const hours = (hourEnd.getTime() - hourStart.getTime()) / (1000 * 60 * 60);
    totalPrice += rate * hours;

    current.setHours(current.getHours() + 1);
  }

  return Math.round(totalPrice * 100) / 100;
}

