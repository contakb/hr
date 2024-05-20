import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axiosInstance from './axiosInstance';
import { isSameDay, format, startOfMonth, endOfMonth } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useRequireAuth } from './useRequireAuth';

const EmployeeBreaksCalendar = ({ employeeId }) => {
  const [breaks, setBreaks] = useState([]);
  const [date, setDate] = useState(new Date());
  const [selectedBreaks, setSelectedBreaks] = useState([]);
  const [currentMonthBreaks, setCurrentMonthBreaks] = useState([]);
  const user = useRequireAuth(); // Get the authenticated user

  useEffect(() => {
    const fetchBreaks = async () => {
      if (!user) return;

      try {
        const response = await axiosInstance.get('/api/get-health-breaks', {
          params: { employee_id: employeeId },
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'X-Schema-Name': user.schemaName,
          }
        });
        setBreaks(response.data);
      } catch (error) {
        console.error('Error fetching breaks:', error);
      }
    };

    if (employeeId) {
      fetchBreaks();
    }
  }, [employeeId, user]);

  useEffect(() => {
    const visibleMonthBreaks = breaks.filter((breakEvent) => {
      const breakStart = new Date(breakEvent.break_start_date);
      const breakEnd = new Date(breakEvent.break_end_date);
      const startOfVisibleMonth = startOfMonth(date);
      const endOfVisibleMonth = endOfMonth(date);

      return (
        (breakStart >= startOfVisibleMonth && breakStart <= endOfVisibleMonth) ||
        (breakEnd >= startOfVisibleMonth && breakEnd <= endOfVisibleMonth) ||
        (breakStart < startOfVisibleMonth && breakEnd > endOfVisibleMonth)
      );
    });

    setCurrentMonthBreaks(visibleMonthBreaks);
  }, [date, breaks]);

  const onDateChange = (date) => {
    setDate(date);
    const breaksOnDate = breaks.filter((breakEvent) =>
      isSameDay(new Date(breakEvent.break_start_date), date) ||
      isSameDay(new Date(breakEvent.break_end_date), date) ||
      (new Date(breakEvent.break_start_date) < date && new Date(breakEvent.break_end_date) > date)
    );
    setSelectedBreaks(breaksOnDate);
  };

  const renderEvents = (date) => {
    const breaksOnDate = breaks.filter((breakEvent) =>
      isSameDay(new Date(breakEvent.break_start_date), date) ||
      isSameDay(new Date(breakEvent.break_end_date), date) ||
      (new Date(breakEvent.break_start_date) < date && new Date(breakEvent.break_end_date) > date)
    );

    return breaksOnDate.map((breakEvent) => (
      <div key={breakEvent.id}>
        <strong>{breakEvent.break_type}</strong>
        <p>{breakEvent.description || 'Break details'}</p>
      </div>
    ));
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const hasBreak = breaks.some(breakEvent =>
        isSameDay(new Date(breakEvent.break_start_date), date) ||
        isSameDay(new Date(breakEvent.break_end_date), date) ||
        (new Date(breakEvent.break_start_date) < date && new Date(breakEvent.break_end_date) > date)
      );

      const isCurrentDate = isSameDay(new Date(), date);

      if (hasBreak) {
        return 'highlight-tile'; // Use the Tailwind CSS class for highlighted dates
      }

      if (isCurrentDate) {
        return 'current-date-tile'; // Use the Tailwind CSS class for the current date
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
        onActiveStartDateChange={({ activeStartDate }) => setDate(activeStartDate)}
      />
      <div>
        
        {renderEvents(date)}
      </div>
      {currentMonthBreaks.length > 0 && (
        <div className="mt-4">
          <h3 className="text-l font-semibold">Przerwy w {format(date, 'MMMM yyyy', { locale: pl })}:</h3>
          <table className="min-w-full bg-white table-auto text-xs">
            <thead>
              <tr>
                <th className="py-1 px-2 border-b">Data od</th>
                <th className="py-1 px-2 border-b">Data do</th>
                <th className="py-1 px-2 border-b">Typ przerwy</th>
                <th className="py-1 px-2 border-b">Liczba dni</th>
              </tr>
            </thead>
            <tbody>
              {currentMonthBreaks.map((breakEvent) => (
                <tr key={breakEvent.id}>
                  <td className="py-1 px-2 border-b">
                    {new Date(breakEvent.break_start_date).toLocaleDateString()}
                  </td>
                  <td className="py-1 px-2 border-b">
                    {new Date(breakEvent.break_end_date).toLocaleDateString()}
                  </td>
                  <td className="py-1 px-2 border-b">{breakEvent.break_type}</td>
                  <td className="py-1 px-2 border-b">{breakEvent.break_days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeBreaksCalendar;
