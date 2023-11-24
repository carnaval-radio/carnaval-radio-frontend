import React from 'react';
import CountdownTimer from '@/components/constants/CountDownTimer';

const TimerPage = () => {
  return (
    <div>
      <h1>Wanneer begint de carnaval?</h1>
      <CarnavalCountdown />
    </div>
  );
};
 
const CarnavalCountdown: React.FC = () => {
    const carnivalDates = calculateCarnavalDates();

    return (
        <div>
            {carnivalDates.map((carnivalDate, index) => (
                <div key={index}>
                <h2>{`Carnaval ${carnivalDate.year}`}</h2>
                <p>Datum: {carnivalDate.date.toDateString()}</p>
                <CountdownTimer targetDate={carnivalDate.date} />
                </div>
            ))}
        </div>
    );
};

function calculateEasterDate(year: number) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(year, month - 1, day); // Month is 0-indexed
};

function calculateCarnavalDates(howManyYears: number = 10): { year: number; date: Date }[] {
    const currentYear = new Date().getFullYear();
    const carnavalDatesArray: { year: number; date: Date }[] = [];
  
    for (let i = 0; i < howManyYears; i++) {
      const year = currentYear + i;
      const easterDate = calculateEasterDate(year);
      const carnavalStartDate = new Date(easterDate);
      carnavalStartDate.setDate(easterDate.getDate() - 49); // 7 weeks before Easter
  
      carnavalDatesArray.push({ year, date: carnavalStartDate });
    }
  
    return carnavalDatesArray;
  };

export default TimerPage;
