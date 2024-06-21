import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axiosInstance from './axiosInstance';
import { isSameDay, format, startOfMonth, endOfMonth } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useRequireAuth } from './useRequireAuth';
import moment from 'moment-timezone';
import { toast } from 'react-toastify';
import axios from 'axios';

const EmployeeBreaksCalendar = ({ employeeId }) => {
  const [breaks, setBreaks] = useState([]);
  const [date, setDate] = useState(new Date());
  const [month, setMonth] = useState(new Date().getMonth() + 1); // JavaScript months are 0-indexed
  const [year, setYear] = useState(new Date().getFullYear());
  const [workingHours, setWorkingHours] = useState(null);
const [holidays, setHolidays] = useState([]);
  
  const [selectedBreaks, setSelectedBreaks] = useState([]);
  const [currentMonthBreaks, setCurrentMonthBreaks] = useState([]);
  const [breakForm, setBreakForm] = useState({
    break_type: 'brak',
    break_start_date: '',
    break_end_date: '',
    break_days: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editBreakId, setEditBreakId] = useState(null);
  const [showForm, setShowForm] = useState(false); // State to control form visibility
  const user = useRequireAuth(); // Get the authenticated user


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

  useEffect(() => {
    if (employeeId) {
      fetchBreaks();
    }
  }, [employeeId, user]);

  const fetchAllData = async () => {
    if (!year || !month) {
      console.error('Year and month must be defined.');
      return;
    }
    console.log(`Fetching data for year: ${year}, month: ${month}`); // Debugging line
    
    try {
      const workingHoursResponse = await axios.get(`http://localhost:3001/api/getWorkingHours?year=${year}&month=${month}`);
      setWorkingHours(workingHoursResponse.data.work_hours);
    
      const holidaysResponse = await axios.get(`http://localhost:3001/api/getHolidays?year=${year}&month=${month}`);
      // Make sure the holidaysResponse.data is an array
      const holidaysData = Array.isArray(holidaysResponse.data) ? holidaysResponse.data : [];
      const filteredHolidays = holidaysData.filter(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate.getFullYear() === parseInt(year, 10) && holidayDate.getMonth() === parseInt(month, 10) - 1;
      });
    
      setHolidays(filteredHolidays);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle errors appropriately
    }
    };
    
    useEffect(() => {
    fetchAllData();
    }, [year, month]);

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

    return breaksOnDate.map((breakEvent) => {
      const breakClass = breakEvent.break_type === 'urlop'
        ? breakEvent.status === 'approved' ? 'approved-break' : breakEvent.status === 'denied' ? 'denied-break' : 'pending-break'
        : '';

      return (
        <div key={breakEvent.id} className={`${breakClass}`}>
          <strong>{breakEvent.break_type}</strong>
          <p>{breakEvent.description || 'Break details'}</p>
        </div>
      );
    });
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
            className = breakEvent.status === 'approved' ? 'break-urlop-approved' : breakEvent.status === 'denied' ? 'break-urlop-denied' : 'break-urlop-pending';
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

  const isOverlapping = (newStartDate, newEndDate, editBreakId = null) => {
    return breaks.some(breakEvent => {
      // Ignore the break being edited by checking its ID
      if (editBreakId && breakEvent.id === editBreakId) return false;
  
      const existingStartDate = new Date(breakEvent.break_start_date);
      const existingEndDate = new Date(breakEvent.break_end_date);
  
      return (
        (newStartDate >= existingStartDate && newStartDate <= existingEndDate) ||
        (newEndDate >= existingStartDate && newEndDate <= existingEndDate) ||
        (newStartDate <= existingStartDate && newEndDate >= existingEndDate)
      );
    });
  };
  

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = {
      ...breakForm,
      [name]: value,
    };
  
    setBreakForm(updatedForm);
  
    if (name === 'break_type' && updatedForm.break_start_date && updatedForm.break_end_date) {
      calculateDays(updatedForm);
    }
  };
  
  const handleHealthBreakStartDateChange = (e) => {
    const date = e.target.value;
    const updatedForm = {
      ...breakForm,
      break_start_date: date,
    };
  
    if (updatedForm.break_end_date) {
      calculateDays(updatedForm);
    } else {
      setBreakForm(updatedForm);
    }
  };
  
  const handleHealthBreakEndDateChange = (e) => {
    const date = e.target.value;
    const updatedForm = {
      ...breakForm,
      break_end_date: date,
    };
  
    if (updatedForm.break_start_date) {
      calculateDays(updatedForm);
    } else {
      setBreakForm(updatedForm);
    }
  };
  
  const isStartDateValid = (startDate, endDate) => {
    if (!startDate) return true; // No validation if start date is not set
    return !endDate || new Date(startDate) <= new Date(endDate);
  };
  
  const isEndDateValid = (endDate, startDate) => {
    if (!endDate) return true; // No validation if end date is not set
    return !startDate || new Date(endDate) >= new Date(startDate);
  };
  
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 6 || day === 0;
  };
  
  const isHolidayOnDate = (holidays, date) => {
    return holidays.some((holiday) => isSameDay(new Date(holiday), date));
  };
  
  const calculateDays = (breakForm) => {
    const { break_start_date, break_end_date, break_type } = breakForm;
    const startDate = new Date(break_start_date);
    const endDate = new Date(break_end_date);
  
    if (!isStartDateValid(startDate, endDate)) {
      toast.error('Start date cannot be after end date.');
      return;
    }
  
    if (!isEndDateValid(endDate, startDate)) {
      toast.error('End date cannot be before start date.');
      return;
    }
  
    if (['bezpłatny', 'nieobecność', 'urlop'].includes(break_type)) {
      breakForm.break_days = calculateBreakDuration(startDate, endDate, holidays);
    } else {
      const timeDifference = endDate.getTime() - startDate.getTime();
      breakForm.break_days = Math.round(timeDifference / (1000 * 60 * 60 * 24)) + 1;
    }
  
    setBreakForm(breakForm);
  };
  
  const calculateBreakDuration = (startDate, endDate, holidays) => {
    let workingDayCount = 0;
    let currentDay = new Date(startDate);
  
    while (currentDay <= endDate) {
      const isWeekday = !isWeekend(currentDay);
      const isNotHoliday = !isHolidayOnDate(holidays, currentDay);
  
      if (isWeekday && isNotHoliday) {
        workingDayCount++;
      }
  
      currentDay.setDate(currentDay.getDate() + 1);
    }
  
    return workingDayCount;
  };
  
  

  const handleSaveBreaksData = async (e) => {
    e.preventDefault();

    const { break_start_date, break_end_date } = breakForm;
  const newStartDate = new Date(break_start_date);
  const newEndDate = new Date(break_end_date);

  // Pass the editBreakId to the isOverlapping function
  if (isOverlapping(newStartDate, newEndDate, isEditing ? editBreakId : null)) {
    toast.error('The selected dates overlap with an existing break. Please choose different dates.');
    return;
  }

  const breaksData = {
    employee_id: employeeId,
    ...breakForm,
    approved: breakForm.break_type === 'urlop' ? false : breakForm.approved, // Reset approval for 'urlop'
    status: breakForm.break_type === 'urlop' ? 'pending' : breakForm.status, // Set status to 'pending' for 'urlop'
  }
    try {
      if (isEditing) {
        // Update the existing break
        await axiosInstance.put('/api/update-health-breaks', { breaksData: [breaksData] }, {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'X-Schema-Name': user.schemaName,
          }
        });
        toast.success('Break updated successfully. Please update the salary list.');
      } else {
        // Save the new break
        await axiosInstance.post('/api/save-health-breaks', { breaksData: [breaksData] }, {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'X-Schema-Name': user.schemaName,
          }
        });
        toast.success('Break added successfully. Please update the salary list.');
      }

      setBreaks((prevBreaks) => {
        if (isEditing) {
          return prevBreaks.map((b) => (b.id === editBreakId ? breaksData : b));
        } else {
          return [...prevBreaks, breaksData];
        }
      });

      setBreakForm({
        break_type: 'brak',
        break_start_date: '',
        break_end_date: '',
        break_days: '',
      });
      setIsEditing(false);
      setEditBreakId(null);
      setShowForm(false); // Hide the form after saving
      // Fetch the updated breaks data
      fetchBreaks();
    } catch (error) {
      console.error('Error saving break:', error);
      toast.error('Error saving break.');
    }
  };

  const handleEditBreak = (breakEvent) => {
    setBreakForm(breakEvent);
    setIsEditing(true);
    setEditBreakId(breakEvent.id);
    setShowForm(true); // Show the form when editing
  };

  const handleDeleteBreak = async (breakId) => {
    try {
      await axiosInstance.delete('/api/delete-health-breaks', {
        data: { breakIds: [breakId] },
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName,
        }
      });
      toast.success('Break deleted successfully. Please update the salary list.');
      setBreaks((prevBreaks) => prevBreaks.filter((b) => b.id !== breakId));
    } catch (error) {
      console.error('Error deleting break:', error);
      toast.error('Error deleting break.');
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

  // Add this function inside EmployeeBreaksCalendar component
  const handleSendForApproval = async (breakId) => {
    const employee_message = prompt('Please provide a message for the admin:');
    if (!employee_message) return;
  
    try {
      await axiosInstance.put('/api/send-for-approval', { breakId, status: 'pending', employee_message }, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName,
        }
      });
      toast.success('Request sent for approval.');
      setBreaks((prevBreaks) =>
        prevBreaks.map((b) =>
          b.id === breakId ? { ...b, approved: false, status: 'pending', employee_message } : b
        )
      );
    } catch (error) {
      console.error('Error sending request for approval:', error);
      toast.error('Error sending request for approval.');
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
      case 'pending':
      default:
        return 'pending-status';
    }
  };

  return (
    <div>
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
          <h3 className="text-l font-semibold">Przerwy w {format(date, 'MMMM yyyy', { locale: pl })}:</h3>
          <table className="min-w-full bg-white table-auto text-xs">
            <thead>
              <tr>
                <th className="py-1 px-2 border-b">Data od</th>
                <th className="py-1 px-2 border-b">Data do</th>
                <th className="py-1 px-2 border-b">Typ przerwy</th>
                <th className="py-1 px-2 border-b">Liczba dni</th>
                <th className="py-1 px-2 border-b">Status</th>
                <th className="py-1 px-2 border-b">Info</th>
                <th className="py-1 px-2 border-b">Akcje</th>
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
      <td className={`py-1 px-2 border-b ${getClassForBreakType(breakEvent.break_type)}`}>{breakEvent.break_type}</td>
      <td className="py-1 px-2 border-b">{breakEvent.break_days}</td>
      <td className={`py-1 px-2 border-b ${getStatusClassName(breakEvent.break_type, breakEvent.status)}`}>
        {breakEvent.break_type === 'urlop' ? (breakEvent.status ? (breakEvent.status.charAt(0).toUpperCase() + breakEvent.status.slice(1)) : 'Pending') : 'N/A'}

      </td>
      <td className="py-1 px-2 border-b"> {breakEvent.employee_message} </td>
      <td className="py-1 px-2 border-b">
        <>
          <button onClick={() => handleEditBreak(breakEvent)} className="text-blue-500">Edit</button>
          <button onClick={() => handleDeleteBreak(breakEvent.id)} className="text-red-500 ml-2">Delete</button>
          {breakEvent.break_type === 'urlop' && (
            <button onClick={() => handleSendForApproval(breakEvent.id)} className="text-green-500 ml-2">Send for Approval</button>
          )}
        </>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
      )}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 text-white text-xs p-1 rounded mt-4"
        >
          Dodaj przerwę
        </button>
      )}
      {showForm && (
  <form onSubmit={handleSaveBreaksData} className="mt-4">
    <h3 className="text-l font-semibold">{isEditing ? 'Edytuj przerwę' : 'Dodaj przerwę'}</h3>
    <table className="min-w-full bg-white table-auto text-xs">
      <thead>
        <tr>
          <th className="py-1 px-2 border-b">Typ przerwy</th>
          <th className="py-1 px-2 border-b">Data od</th>
          <th className="py-1 px-2 border-b">Data do</th>
          <th className="py-1 px-2 border-b">Liczba dni</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="py-1 px-2 border-b">
            <select
              name="break_type"
              value={breakForm.break_type}
              onChange={handleFormChange}
              className="text-xs p-1 rounded border-gray-300 w-full"
            >
              <option value="brak">wybierz</option>
              <option value="urlop">urlop wypoczynkowy</option>
              <option value="zwolnienie">Zwolnienie</option>
              <option value="ciąża">Zwol. 100% ciąża</option>
              <option value="bezpłatny">Bezpłatny</option>
              <option value="nieobecność">Nieobecność</option>
              <option value="wychowawczy">wychowawczy</option>
              <option value="rodzicielski">rodzicielski</option>
              <option value="zasiłek">zasiłek ZUS</option>
            </select>
          </td>
          <td className="py-1 px-2 border-b">
            <input
              type="date"
              name="break_start_date"
              value={breakForm.break_start_date}
              onChange={handleHealthBreakStartDateChange}
              className="text-xs p-1 rounded border-gray-300 w-full"
            />
          </td>
          <td className="py-1 px-2 border-b">
            <input
              type="date"
              name="break_end_date"
              value={breakForm.break_end_date}
              onChange={handleHealthBreakEndDateChange}
              className="text-xs p-1 rounded border-gray-300 w-full"
            />
          </td>
          <td className="py-1 px-2 border-b">
            <input
              type="number"
              name="break_days"
              value={breakForm.break_days}
              readOnly
              className="text-xs p-1 rounded border-gray-300 w-full"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <div className="flex space-x-2 mt-2">
      <button
        type="submit"
        className="bg-blue-500 text-white text-xs p-2 rounded"
      >
        {isEditing ? 'Update Break' : 'Add Break'}
      </button>
      <button
        type="button"
        onClick={() => {
          setShowForm(false);
          setIsEditing(false);
          setBreakForm({
            break_type: 'brak',
            break_start_date: '',
            break_end_date: '',
            break_days: '',
          });
        }}
        className="bg-gray-500 text-white text-xs p-2 rounded"
      >
        Cancel
      </button>
    </div>
  </form>
)}

  </div>
);
};

export default EmployeeBreaksCalendar;
