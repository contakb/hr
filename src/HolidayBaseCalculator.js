import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { useRequireAuth } from './useRequireAuth';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import minMax from 'dayjs/plugin/minMax';
import axiosInstance from './axiosInstance'; // Ensure this is the correct import for your axios instance

dayjs.extend(duration);
dayjs.extend(minMax);

function HolidayBaseCalculator() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const user = useRequireAuth();

  const [education, setEducation] = useState('');
  const [educationEndDate, setEducationEndDate] = useState('');
  const [workHistories, setWorkHistories] = useState([{ companyName: '', startDate: '', endDate: '' }]);
  const [staz, setStaz] = useState({ years: 0, months: 0, days: 0, validWorkPeriods: [] });
  const [holidayBase, setHolidayBase] = useState(0);
  const [summary, setSummary] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false); // New state to track if data was fetched

  useEffect(() => {
    const fetchHolidayBaseData = async () => {
      try {
        const response = await axiosInstance.get(`http://localhost:3001/employees/${employeeId}/holiday-base`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            'x-schema-name': user.schemaName,
          }
        });

        console.log('Fetched data:', response.data); // Debug logging

        if (response.data && response.data.data.length > 0) {
          const holidayBaseData = response.data.data[0];
          console.log('Holiday Base Data:', holidayBaseData); // Debug logging

          setEducation(holidayBaseData.education_level || '');
          setEducationEndDate(holidayBaseData.education_end_date || '');
          setWorkHistories(holidayBaseData.work_histories.length > 0 ? holidayBaseData.work_histories : [{ companyName: '', startDate: '', endDate: '' }]);
          setStaz({
            years: holidayBaseData.total_staz_years || 0,
            months: holidayBaseData.total_staz_months || 0,
            days: holidayBaseData.total_staz_days || 0,
            validWorkPeriods: holidayBaseData.work_histories.map(work => ({
              companyName: work.companyName,
              start: dayjs(work.startDate),
              end: dayjs(work.endDate)
            })) || []
          });
          setHolidayBase(holidayBaseData.holiday_base || 0);
          setSummary(true);
          setIsEditMode(true);
        } else {
          setIsDataFetched(true); // Set flag to true when data is fetched but empty
        }
      } catch (error) {
        console.error('Error fetching holiday base data:', error);
        // toast.error('Failed to fetch holiday base data.'); // Remove toast error message
        setIsDataFetched(true); // Set flag to true in case of error as well
      }
    };

    fetchHolidayBaseData();
  }, [employeeId, user.access_token, user.schemaName]);

  const educationDurations = {
    'podstawowa': 4,
    'zasadnicza zawodowa': 3,
    'średnia szkoła zawodowa (3 letnia)': 3,
    'średnia szkoła zawodowa (4 letnia)': 4,
    'średnia szkoła zawodowa (5 i więcej letnia)': 5,
    'średnia szkoła zawodowa po zawodówce': 5,
    'średnia szkoła ogólna': 4,
    'szkoła policealna': 6,
    'szkoła wyższa': 8,
  };

  const calculateStaz = (educationLevel, educationEndDate, workHistories) => {
    const educationYears = educationLevel ? (educationDurations[educationLevel] || 0) : 0;
    const educationEnd = educationEndDate ? dayjs(educationEndDate) : dayjs(0); // If no date is provided, set to epoch

    let totalWorkDuration = 0;
    let validWorkPeriods = [];

    workHistories.forEach(work => {
      const workStart = dayjs(work.startDate);
      const workEnd = dayjs(work.endDate);

      if (workStart.isAfter(educationEnd)) {
        validWorkPeriods.push({ companyName: work.companyName, start: workStart, end: workEnd });
        totalWorkDuration += workEnd.diff(workStart, 'days') + 1; // Including end date
      } else if (workEnd.isAfter(educationEnd)) {
        const overlapStart = educationEnd.add(1, 'day');
        validWorkPeriods.push({ companyName: work.companyName, start: overlapStart, end: workEnd });
        totalWorkDuration += workEnd.diff(overlapStart, 'days') + 1; // Including end date
      }
    });

    const totalEducationDuration = educationYears * 365;
    const totalDuration = totalEducationDuration + totalWorkDuration;

    const years = Math.floor(totalDuration / 365);
    const remainingDaysAfterYears = totalDuration % 365;
    const months = Math.floor(remainingDaysAfterYears / 30);
    const days = remainingDaysAfterYears % 30;

    return { years, months, days, totalDuration, validWorkPeriods };
  };

  const calculateAndSetStaz = () => {
    const staz = calculateStaz(education, educationEndDate, workHistories);
    setStaz(staz);
    setHolidayBase(staz.totalDuration / 365 >= 10 ? 26 : 20);
    setSummary(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const staz = calculateStaz(education, educationEndDate, workHistories);
    const totalYears = staz.totalDuration / 365;
    const holidayBaseDays = totalYears >= 10 ? 26 : 20;

    try {
      const url = `http://localhost:3001/employees/${employeeId}/holiday-base`;
      const method = isEditMode ? 'put' : 'post';

      await axiosInstance[method](url, {
        education_level: education || null, // Set to null if not provided
        education_end_date: educationEndDate || null, // Set to null if not provided
        work_histories: workHistories.filter(work => work.companyName && work.startDate && work.endDate), // Filter out empty work history entries
        total_staz_years: staz.years,
        total_staz_months: staz.months,
        total_staz_days: staz.days,
        holiday_base: holidayBaseDays
      }, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          'x-schema-name': user.schemaName,
        }
      });

      toast.success('Holiday base calculated and saved successfully!');
      navigate(-1); // Navigate back to the previous page or another relevant page
    } catch (error) {
      console.error('Error saving holiday base:', error);
      toast.error('Failed to save holiday base.');
    }
  };

  const handleEducationChange = (event) => {
    setEducation(event.target.value);
    setSummary(null); // Reset summary when education changes
  };

  const handleEducationEndDateChange = (event) => {
    setEducationEndDate(event.target.value);
    setSummary(null); // Reset summary when education end date changes
  };

  const handleWorkHistoryChange = (index, field, value) => {
    const updatedWorkHistories = workHistories.map((work, i) => (
      i === index ? { ...work, [field]: value } : work
    ));
    setWorkHistories(updatedWorkHistories);
    setSummary(null); // Reset summary when work history changes
  };

  const addWorkHistory = () => {
    setWorkHistories([...workHistories, { companyName: '', startDate: '', endDate: '' }]);
  };

  const removeWorkHistory = (index) => {
    const updatedWorkHistories = workHistories.filter((_, i) => i !== index);
    setWorkHistories(updatedWorkHistories);
  };

  const formatDuration = (startDate, endDate) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const duration = end.diff(start, 'days') + 1; // Including end date

    const years = Math.floor(duration / 365);
    const remainingDaysAfterYears = duration % 365;
    const months = Math.floor(remainingDaysAfterYears / 30);
    const days = remainingDaysAfterYears % 30;

    return { years, months, days };
  };

  const displayFormattedDuration = (startDate, endDate) => {
    const { years, months, days } = formatDuration(startDate, endDate);
    return `${years ? years + ' years, ' : ''}${months ? months + ' months, ' : ''}${days} days`;
  };
  const handleBackToEmployeeList = () => {
    navigate('/employeeList'); // Replace with the actual route to the employee list page
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-6">Calculate Holiday Base for Employee</h2>
        {isDataFetched && !isEditMode && (
          <div className="mb-4 p-4 text-red-500 bg-red-100 rounded">
            No data found. Please enter details to calculate the holiday base.
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700">Ukończona szkoła:</label>
          <select value={education} onChange={handleEducationChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            <option value="" disabled>Select education</option>
            <option value="podstawowa">podstawowa (albo żadna)</option>
            <option value="zasadnicza zawodowa">zasadnicza zawodowa (lub równorzędna)</option>
            <option value="średnia szkoła zawodowa (3 letnia)">średnia szkoła zawodowa (3 letnia)</option>
            <option value="średnia szkoła zawodowa (4 letnia)">średnia szkoła zawodowa (4 letnia)</option>
            <option value="średnia szkoła zawodowa (5 i więcej letnia)">średnia szkoła zawodowa (5 i więcej letnia)</option>
            <option value="średnia szkoła zawodowa po zawodówce">średnia szkoła zawodowa po zawodówce</option>
            <option value="średnia szkoła ogólna">średnia szkoła ogólna</option>
            <option value="szkoła policealna">szkoła policealna</option>
            <option value="szkoła wyższa">szkoła wyższa</option>
          </select>

          <label className="block text-sm font-medium text-gray-700">Data ukończenia szkoły:</label>
          <input type="date" value={educationEndDate} onChange={handleEducationEndDateChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />

          {workHistories.map((work, index) => (
            <div key={index} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Work History {index + 1}</label>
              <input
                type="text"
                placeholder="Company Name"
                value={work.companyName}
                onChange={(e) => handleWorkHistoryChange(index, 'companyName', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                type="date"
                value={work.startDate}
                onChange={(e) => handleWorkHistoryChange(index, 'startDate', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                type="date"
                value={work.endDate}
                onChange={(e) => handleWorkHistoryChange(index, 'endDate', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              {workHistories.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWorkHistory(index)}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addWorkHistory}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Another Work History
          </button>

          <button
            type="button"
            onClick={calculateAndSetStaz}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Calculate
          </button>

          {summary && (
            <div className="mt-4 p-4 bg-gray-200 rounded">
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              {education && <p><strong>Education:</strong> {education} - {educationDurations[education]} years, finished on {educationEndDate}</p>}
              <p><strong>Note:</strong> Staż calculation considers dates after the finished school date.</p>
              <p><strong>Work Histories:</strong></p>
              <ul className="list-disc pl-5">
                {staz.validWorkPeriods && staz.validWorkPeriods.map((work, index) => (
                  <li key={index}>
                    {work.companyName}: From {work.start.format('YYYY-MM-DD')} to {work.end.format('YYYY-MM-DD')} ({displayFormattedDuration(work.start.format('YYYY-MM-DD'), work.end.format('YYYY-MM-DD'))})
                  </li>
                ))}
              </ul>
              <p><strong>Total Staż:</strong> {staz.years} years, {staz.months} months, {staz.days} days</p>
              <p><strong>Holiday Base:</strong> {holidayBase} days</p>
            </div>
          )}

          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {isEditMode ? 'Update and Save' : 'Calculate and Save'}
          </button>
        </form>
        <button
          type="button"
          onClick={handleBackToEmployeeList}
          className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Back to Employee List
        </button>
      </div>
    </div>
  );
}


export default HolidayBaseCalculator;
