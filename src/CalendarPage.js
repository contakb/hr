import React, { useEffect, useState, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { generateRecurringEvents } from './eventsHelper';
import { isSameDay, getYear, format } from 'date-fns';
import { pl } from 'date-fns/locale';
import axiosInstance from './axiosInstance'; // Ensure you import your axios instance
import { useRequireAuth } from './useRequireAuth';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState(new Date());
  const [badaniaData, setBadaniaData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const user = useRequireAuth();

  const fetchBadaniaData = async () => {
    try {
      const response = await axiosInstance.get('http://localhost:3001/api/badania', {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          'x-schema-name': user.schemaName,
        }
      });
      setBadaniaData(response.data.badania);
    } catch (error) {
      console.error('Error fetching badania data:', error);
    }
  };

  const fetchEmployeeData = async () => {
    try {
      const response = await axiosInstance.get('http://localhost:3001/employees', {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          'x-schema-name': user.schemaName,
        }
      });
      setEmployeeData(response.data.employees);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchBadaniaData();
      await fetchEmployeeData();
    };

    fetchData();
  }, []); // Fetch data only once on component mount

  const generateEventsForYear = useCallback((year) => {
    // Ensure data is available before generating events
    if (badaniaData.length > 0 && employeeData.length > 0) {
      const generatedEvents = generateRecurringEvents(year, badaniaData, employeeData);
      console.log(`Generated Events for ${year}:`, generatedEvents); // Debug log
      setEvents(generatedEvents);
    }
  }, [badaniaData, employeeData]);

  useEffect(() => {
    generateEventsForYear(getYear(date));
  }, [generateEventsForYear, date]); // Generate events when date changes

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
        <h2 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          Wydarzenia na {format(date, 'EEEE, do MMMM yyyy', { locale: pl })}:
        </h2>
        <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          {renderEvents(date)}
        </p>
      </div>
    </div>
  );
};

export default CalendarPage;
