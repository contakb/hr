import React, { useEffect, useState, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { generateRecurringEvents } from './eventsHelper';
import { isSameDay, getYear, format } from 'date-fns';
import { pl } from 'date-fns/locale';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState(new Date());

  const generateEventsForYear = useCallback((year) => {
    const generatedEvents = generateRecurringEvents(year);
    console.log(`Generated Events for ${year}:`, generatedEvents); // Debug log
    setEvents(generatedEvents);
  }, []);

  useEffect(() => {
    generateEventsForYear(getYear(date));
  }, [generateEventsForYear, date]);

  const onDateChange = (date) => {
    setDate(date);
  };

  const renderEvents = (date) => {
    const eventsOnDate = events.filter((event) =>
      isSameDay(new Date(event.date), date)
    );
    console.log('Events on Date:', eventsOnDate); // Debug log

    return eventsOnDate.map((event) => (
      <div key={event.id}>
        <strong>{event.title}</strong>
        <p>{event.description}</p>
      </div>
    ));
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const hasEvent = events.some(event =>
        isSameDay(new Date(event.date), date)
      );
      if (hasEvent) {
        return 'highlight-tile';
      }
    }
    return null;
  };

  return (
    <div>
      <Calendar
        onChange={onDateChange}
        value={date}
        tileClassName={tileClassName}
        onActiveStartDateChange={({ activeStartDate }) => {
          const year = getYear(activeStartDate);
          generateEventsForYear(year);
        }}
      />
      <div>
        <h2 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">Wydarzenia na {format(date, 'EEEE, do MMMM yyyy', { locale: pl })}:</h2>
        <p  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">{renderEvents(date)}</p>
      </div>
    </div>
  );
};

export default CalendarPage;
