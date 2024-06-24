import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axiosInstance from './axiosInstance';
import { isSameDay, format, startOfMonth, endOfMonth } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useRequireAuth } from './useRequireAuth';
import { toast } from 'react-toastify';
import { useUser } from './UserContext';

const AdminBreaksCalendar = () => {
  const [breaks, setBreaks] = useState([]);
  const [date, setDate] = useState(new Date());
  const [selectedBreaks, setSelectedBreaks] = useState([]);
  const [currentMonthBreaks, setCurrentMonthBreaks] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchBreaks = async () => {
      if (!user) return;

      try {
        const response = await axiosInstance.get('/api/get-all-health-breaks', {
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

    fetchBreaks();
  }, [user]);

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
      <div key={breakEvent.id} className={breakEvent.break_type === 'urlop' && !breakEvent.approved ? 'pending-break' : 'approved-break'}>
        <strong>{breakEvent.break_type}</strong>
        <p>{breakEvent.description || 'Break details'}</p>
      </div>
    ));
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const breakEvent = breaks.find(breakEvent =>
        isSameDay(new Date(breakEvent.break_start_date), date) ||
        isSameDay(new Date(breakEvent.break_end_date), date) ||
        (new Date(breakEvent.break_start_date) < date && new Date(breakEvent.break_end_date) > date)
      );

      if (breakEvent) {
        let className = '';
        switch (breakEvent.break_type) {
          case 'zwolnienie':
            className = 'break-zwolnienie';
            break;
          case 'ciąża':
            className = 'break-ciąża';
            break;
          case 'zasiłek':
            className = 'break-zasilek';
            break;
          case 'bezpłatny':
            className = 'break-bezplatny';
            break;
          case 'nieobecność':
            className = 'break-nieobecnosc';
            break;
          case 'urlop':
            className = breakEvent.approved ? 'break-urlop-approved' : breakEvent.status === 'denied' ? 'break-urlop-denied' : 'break-urlop-pending';
            break;
          default:
            className = 'break-default';
            break;
        }
        return className;
      }
    }
    return null;
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const breakEvent = breaks.find(breakEvent =>
        isSameDay(new Date(breakEvent.break_start_date), date) ||
        isSameDay(new Date(breakEvent.break_end_date), date) ||
        (new Date(breakEvent.break_start_date) < date && new Date(breakEvent.break_end_date) > date)
      );

      if (breakEvent) {
        switch (breakEvent.break_type) {
          case 'zwolnienie':
            return <div data-letter="ZW"></div>;
          case 'ciąża':
            return <div data-letter="CI"></div>;
          case 'zasiłek':
            return <div data-letter="ZS"></div>;
          case 'bezpłatny':
            return <div data-letter="BP"></div>;
          case 'nieobecność':
            return <div data-letter="NB"></div>;
          case 'urlop':
            return <div data-letter="UR"></div>;
          default:
            return <div data-letter="DF"></div>;
        }
      }
    }
    return null;
  };

  const handleApproveBreak = async (breakId) => {
    try {
      await axiosInstance.post('/api/approve-break', { breakId }, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName,
        }
      });
      toast.success('Break approved successfully.');
      setBreaks((prevBreaks) =>
        prevBreaks.map((b) =>
          b.id === breakId ? { ...b, approved: true, status: 'approved' } : b
        )
      );
    } catch (error) {
      console.error('Error approving break:', error);
      toast.error('Error approving break.');
    }
  };

  const handleDenyBreak = async (breakId) => {
    const employee_message = prompt('Please provide a reason for denial:');  // Prompt for denial reason
    if (!employee_message) return;

    try {
      await axiosInstance.put('/api/deny-break', { breakId, employee_message }, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName,
        }
      });
      toast.success('Break denied successfully.');
      setBreaks((prevBreaks) =>
        prevBreaks.map((b) =>
          b.id === breakId ? { ...b, approved: false, employee_message } : b
        )
      );
    } catch (error) {
      console.error('Error denying break:', error);
      toast.error('Error denying break.');
    }
  };

  const handleChangeDecision = async (breakId, currentStatus) => {
    const employee_message = prompt('Please provide a reason for changing the decision:');
    if (!employee_message) return;
  
    const updatedStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    const approved = updatedStatus === 'approved';
  
    try {
      await axiosInstance.put('/api/change-decision', { breakId, status: updatedStatus, approved,employee_message }, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName,
        }
      });
      toast.success('Decision changed successfully.');
      setBreaks((prevBreaks) =>
        prevBreaks.map((b) =>
          b.id === breakId ? { ...b, approved, status: updatedStatus,  employee_message } : b
        )
      );
    } catch (error) {
      console.error('Error changing decision:', error);
      toast.error('Error changing decision.');
    }
  };
  

  const getClassForBreakType = (breakType) => {
    switch (breakType) {
      case 'zwolnienie':
        return 'table-zwolnienie';
      case 'ciąża':
        return 'table-ciąża';
      case 'zasiłek':
        return 'table-zasilek';
      case 'bezpłatny':
        return 'table-bezplatny';
      case 'nieobecność':
        return 'table-nieobecnosc';
      case 'urlop':
        return 'table-urlop';
      default:
        return 'table-default';
    }
  };

  const getStatusClassName = (breakType, status) => {
    if (breakType !== 'urlop') {
      return '';
    }
    switch (status) {
      case 'approved':
        return 'approved-status';
      case 'denied':
        return 'denied-status';
      default:
        return 'pending-status';
    }
  };

  return (
    <div >
      <Calendar
        onChange={onDateChange}
        value={date}
        tileClassName={tileClassName}
        tileContent={tileContent}
        onActiveStartDateChange={({ activeStartDate }) => setDate(activeStartDate)}
      />

      <div>
        {renderEvents(date)}
      </div>
      {currentMonthBreaks.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <h3 className="text-lg font-semibold">Przerwy w {format(date, 'MMMM yyyy', { locale: pl })}:</h3>
          <table className="min-w-full bg-white table-auto text-xs">
            <thead>
              <tr>
                <th className="py-1 px-2 border-b">Employee ID</th>
                <th className="py-1 px-2 border-b">Surname</th>
                <th className="py-1 px-2 border-b">Data od</th>
                <th className="py-1 px-2 border-b">Data do</th>
                <th className="py-1 px-2 border-b">Typ przerwy</th>
                <th className="py-1 px-2 border-b">Liczba dni</th>
                <th className="py-1 px-2 border-b">Status</th>
                <th className="py-1 px-2 border-b">Komunikat</th>
                <th className="py-1 px-2 border-b">Akcje</th>
              </tr>
            </thead>
            <tbody>
  {currentMonthBreaks.map((breakEvent) => (
    <tr key={breakEvent.id}>
      <td className="py-1 px-2 border-b">{breakEvent.employee_id}</td>
      <td className="py-1 px-2 border-b">{breakEvent.surname}</td>
      <td className="py-1 px-2 border-b">
        {new Date(breakEvent.break_start_date).toLocaleDateString()}
      </td>
      <td className="py-1 px-2 border-b">
        {new Date(breakEvent.break_end_date).toLocaleDateString()}
      </td>
      <td className={`py-1 px-2 border-b ${getClassForBreakType(breakEvent.break_type)}`}>{breakEvent.break_type}</td>
      <td className="py-1 px-2 border-b">{breakEvent.break_days}</td>
      <td className={`py-1 px-2 border-b ${getStatusClassName(breakEvent.break_type, breakEvent.status)}`}>
        {breakEvent.break_type === 'urlop' ? breakEvent.status : 'N/A'}
       
      </td>
      <td className="py-1 px-2 border-b">{breakEvent.employee_message}</td>
      <td className="py-1 px-2 border-b">
        {breakEvent.break_type === 'urlop' && (
          <>
            {breakEvent.status === 'pending' ? (
              <>
                <button onClick={() => handleApproveBreak(breakEvent.id)} className="text-green-500">Approve</button>
                <button onClick={() => handleDenyBreak(breakEvent.id)} className="text-red-500 ml-2">Deny</button>
              </>
            ) : (
              <button onClick={() => handleChangeDecision(breakEvent.id, breakEvent.status)} className="text-yellow-500 ml-2">Change Decision</button>
            )}
          </>
        )}
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBreaksCalendar;
