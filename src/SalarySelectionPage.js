import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker'; // Import DatePicker
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary
import { toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css'; // Import styles
import { set } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { parseISO } from 'date-fns';
import moment from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faTrashAlt, faUndoAlt } from '@fortawesome/free-solid-svg-icons';
import { useRequireAuth } from './useRequireAuth';
import { useSetup } from './SetupContext'; // Adjust the import path as necessary
import { useUser } from './UserContext'; // Ensure correct pat
// Set the default timezone to Warsaw, Poland
moment.tz.setDefault("Europe/Warsaw");


function calculateDaysNotWorked(workingDayCount, totalWorkingDaysInMonth) {
  return Math.max(0, totalWorkingDaysInMonth - workingDayCount);
}
const defaultHealthBreak = {
  startDate: null,
  endDate: null,
  days: 0,
  type: ''
  };
  

function SalarySelectionPage() {
  const [employees, setEmployees] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1); // JavaScript months are 0-indexed
const [year, setYear] = useState(new Date().getFullYear());

  const location = useLocation();
const { isEditMode, editableData } = location.state || {};
   // Initialize state based on whether you are in edit mode or not
const [validContracts, setValidContracts] = useState(isEditMode ? editableData : []);
  const [salaryDate, setSalaryDate] = useState('');
  const [healthBreaks, setHealthBreaks] = useState([]); // Initialize healthBreaks as an empty array
  const [additionalBreaks, setAdditionalBreaks] = useState([]);
  const [additionalBreakDays, setAdditionalBreakDays] = useState([]);
  const [additionalDays, setAdditionalDays] = useState(0);
const [additionalBreakType, setAdditionalBreakType] = useState('');
const [calculatedContracts, setCalculatedContracts] = useState([]);
const [healthBreaksByEmployee, setHealthBreaksByEmployee] = useState({});
const [additionalBreaksByEmployee, setAdditionalBreaksByEmployee] = useState({});
const [workingHours, setWorkingHours] = useState(null);
const [holidays, setHolidays] = useState([]);
const [daysNotWorkedSummary, setDaysNotWorkedSummary] = useState({});
const [daysNotWorked, setDaysNotWorked] = useState([]);
const [employeeDaysNotWorked, setemployeeDaysNotWorked] = useState({});
const [proRatedEmployees, setProRatedEmployees] = useState([]);
const [proRatedGrossSummary, setProRatedGrossSummary] = useState({});
const [GrossAmounts, setGrossAmounts] = useState({});
const [employeeBonuses, setEmployeeBonuses] = useState({});
const [companyData, setCompanyData] = useState(null);
const [isLoading, setIsLoading] = useState(true);
const [wypadkoweRate, setWypadkoweRate] = useState(0); // Initialize with a default value
const [parameters, setParameters] = useState(null);
const [koszty, setKoszty] = useState(null);
const [ulga, setUlga] = useState(null);
const [transformedBreakData, setTransformedBreakData] = useState([]);
const [breaksToDelete, setBreaksToDelete] = useState([]);
const [isAllSalaryCalculated, setIsAllSalaryCalculated] = useState(false);
const [toastShown, setToastShown] = useState(false);
const [historicalSalaries, setHistoricalSalaries] = useState([]);
const [averageSalary, setAverageSalary] = useState(0);
const [showHistoricalSalaries, setShowHistoricalSalaries] = useState(false);
const MINIMUM_SALARY = 4242; // Define minimum salary
const [isUsingMinimumSalary, setIsUsingMinimumSalary] = useState(false);
const [showRecalculateButton, setShowRecalculateButton] = useState(false);
const [isAverageManuallySet, setIsAverageManuallySet] = useState(false);







const [notification, setNotification] = useState({ show: false, employeeId: null });
const [isSalarySaved, setIsSalarySaved] = useState(false);
const [areBreaksSaved, setAreBreaksSaved] = useState(false);
  const { editYear, editMonth, editSalary_date } = location.state || {};
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1); // Months from 1 to 12
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 51 }, (_, i) => currentYear - 25 + i); // Last 25 years to next 25 years
const user = useRequireAuth();

  


  const handleInitialBreaks = (editableData) => {
    const updatedBreaksByEmployee = { ...additionalBreaksByEmployee };
  
    editableData.forEach(employee => {
      if (employee.allBreaks && employee.allBreaks.length > 1) {
        // Process only additional breaks
        const additionalBreaks = employee.allBreaks.slice(1).map(breakData => ({
          startDate: breakData.startDate ? new Date(breakData.startDate) : null,
          endDate: breakData.endDate ? new Date(breakData.endDate) : null,
          type: breakData.type || '',
          additionalDays: breakData.additionalDays || 0,
          id: breakData.id,
          isEdited: false
        }));
  
        updatedBreaksByEmployee[employee.employee_id] = additionalBreaks;
      }
    });
  
    setAdditionalBreaksByEmployee(updatedBreaksByEmployee);
  };
  


  

  useEffect(() => {
    console.log("Received Data for Edit:", location.state);
  
    if (isEditMode && editableData) {
      setYear(editYear);
      setMonth(editMonth);
      setSalaryDate(editSalary_date);
  
      const mappedData = editableData.map(ed => {
        // Map contract details as before
        const contracts = ed.contract_details.map(cd => {
          // Keep your existing logic here if needed
          return {
            ...cd, // Spread existing contract details
          };
        });
  
        return {
          employee_id: ed.employee_id, 
          salary_id: ed.salary_id,
          name: ed.name,
          surname: ed.surname,
          pesel: ed.pesel,
          gross_amount: ed.gross_amount,
         
          contracts: contracts,
          healthBreaks: ed.allBreaks // Assign all breaks directly to healthBreaks
        };
      });
  
      setCalculatedContracts(mappedData);
  
      // Update healthBreaks to contain the first break of each employee
      const updatedHealthBreaks = mappedData.map(employee => 
        employee.healthBreaks && employee.healthBreaks.length > 0 
          ? employee.healthBreaks[0] 
          : defaultHealthBreak
      );
  
      setHealthBreaks(updatedHealthBreaks);
  
      // Call handleInitialBreaks to process additional breaks
      handleInitialBreaks(editableData);
    } else {
      fetchValidContracts();
    }
  }, [isEditMode, editableData, editYear, editMonth, defaultHealthBreak]);
  

  const navigate = useNavigate();

const handleBack = () => {
  navigate('/salary-list'); // Replace '/salary-list' with the actual path to your salary list page
};
  

  
  
  
  
  
  
  
  
  
  

  
  









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
setLoading(false);
const initialHealthBreaks = calculatedContracts.map(() => ({ ...defaultHealthBreak }));
}, [calculatedContracts]);




const fetchEmployees = async () => {
  try {
    const response = await axiosInstance.get('http://localhost:3001/employees', {
      headers: {
        'Authorization': `Bearer ${user.access_token}`, // Use the access token
        'X-Schema-Name': user.schemaName, // Send the schema name as a header
      }
    });
    console.log("Fetching employees...");
    setEmployees(response.data.employees);
    // Initialize healthBreaks for each employee
    const initialHealthBreaks = response.data.employees.map(() => ({ startDate: null, endDate: null, days: 0, type: '' }));
    setHealthBreaks(initialHealthBreaks);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching employees:', error);
    setError('Error fetching employees. Please try again later.');
    setLoading(false);
  }
};


const handleMonthChange = (event) => {
  setMonth(event.target.value);
};

const handleYearChange = (event) => {
  setYear(event.target.value);
};




const fetchValidContracts = async () => {
  console.log("Checking for existing salary list...");

  const selectedPeriodMonth = String(month).padStart(2, '0');
  const selectedPeriodYear = year.toString();


  try {
      // Check for existing salary list only if the selected date is different from the current date
    // Check if a salary list for this month and year already exists
    const savedsalaryresponse = await axiosInstance.get(`http://localhost:3001/salary-list?month=${selectedPeriodMonth}&year=${selectedPeriodYear}`, {
      headers: {
        'Authorization': `Bearer ${user.access_token}`, // Use the access token
        'X-Schema-Name': user.schemaName, // Send the schema name as a header
      }
    });
    if (savedsalaryresponse.data && savedsalaryresponse.data.length > 0) {
      toast.warn(`A salary list for ${selectedPeriodMonth}/${selectedPeriodYear} already exists.`);
            setToastShown(true); // Set the flag to true
            return;
    }
      // If no existing list, proceed to fetch valid contracts
  console.log("Fetching valid contracts...");

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  
  // Create a date object pointing to the first day of the following month, then subtract one day to get the last day of the selected month
  const endOfMonth = new Date(year, month, 0); // Month is 0-indexed in JS Date, so month 2 is March, hence month 0 is January

  const endDate = `${year}-${String(month).padStart(2, '0')}-${endOfMonth.getDate()}`;

  console.log("Dates:", startDate, endDate);

      console.log("About to make axios request...");

      const response = await axiosInstance.post('http://localhost:3001/api/valid-employees', {
          startDate,
          endDate,
      }, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`, // Use the access token
          'X-Schema-Name': user.schemaName, // Send the schema name as a header
        }
      });

      console.log("Response received for valid employees:", response.data);
      const employeesData = response.data.employees;
      console.log("Valid contracts fetched:", employeesData);

     // Add default health breaks to each employee and create a new array
    const employeesWithDefaults = employeesData.map(employee => ({
      ...employee,
      healthBreaks: employee.healthBreaks && employee.healthBreaks.length > 0 
                     ? employee.healthBreaks 
                     : [{ startDate: null, endDate: null, days: 0, type: '' }] // default health breaks
    }));
      console.log('Fetching and updating parameters for each employee...');
      const updatedValidContracts = await Promise.all(employeesWithDefaults.map(fetchAllParameters));
      console.log('Updated valid contracts with parameters:', updatedValidContracts);

      setValidContracts(updatedValidContracts);
      setCalculatedContracts(updatedValidContracts);

  } catch (error) {
      console.error('Error fetching valid contracts:', error);
      setValidContracts([]);
      setCalculatedContracts([]); // Resetting calculatedContracts too
      setLoading(false);
  }

};


// Place these functions outside of your component
function isWeekend(date) {
return date.getDay() === 0 || date.getDay() === 6;
}

function isHolidayOnDate(holidays, date) {
return holidays.some(holiday => {
  const holidayDate = new Date(holiday.date);
  return holidayDate.toDateString() === date.toDateString();
});
}

function countWorkingDays(employee, workingHours, holidays, year, month) {
// Map over employee.contract_details
const employeeDaysNotWorked = employee.contract_details.map(contract => {
  const startDate = new Date(contract.contract_from_date);
  const endDate = contract.contract_to_date ? new Date(contract.contract_to_date) : new Date();
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  // Identify holidays that fall on Saturdays
  const saturdayHolidays = holidays.filter(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate.getDay() === 6 && holidayDate.getMonth() === month - 1 && holidayDate.getFullYear() === year;
  });

  // Calculate the total expected working days in the month
  let totalWorkingDaysInMonth = Math.floor(workingHours / 8); 

  // Adjust for the extra day off if there's a holiday on a Saturday
  if (saturdayHolidays.length > 0) {
    totalWorkingDaysInMonth -= 1;
  }

  const adjustedStartDate = startDate < monthStart ? monthStart : startDate;
  const adjustedEndDate = new Date(endDate > monthEnd ? monthEnd : endDate);
  adjustedEndDate.setDate(adjustedEndDate.getDate() + 1); 

  let workingDayCount = 0;
  let currentDay = new Date(adjustedStartDate);

  while (currentDay < adjustedEndDate) {
    const isWeekday = !isWeekend(currentDay);
    const isNotHoliday = !isHolidayOnDate(holidays, currentDay);

    if (isWeekday && isNotHoliday) {
      workingDayCount++;
    }

    currentDay.setDate(currentDay.getDate() + 1);
  }
  
  // Use the utility function to calculate days not worked
  const daysNotWorked = calculateDaysNotWorked(workingDayCount, totalWorkingDaysInMonth);
  console.log(`Employee ID: ${employee.employee_id} - Actual Working Days: ${workingDayCount}, Adjusted Working Days: ${totalWorkingDaysInMonth}, Days Not Worked: ${daysNotWorked}`);

  return {
    contract_from_date: contract.contract_from_date,
    contract_to_date: contract.contract_to_date,
    daysNotWorked,
    workingDayCount
  };
});

// Calculate total actual working days for all contracts
const totalActualWorkingDays = employeeDaysNotWorked.reduce((total, detail) => total + detail.workingDayCount, 0);

// Adjust daysNotWorked for each contract based on total actual working days
const updatedEmployeeDetails = employeeDaysNotWorked.map(contract => {
  let adjustedDaysNotWorked = contract.daysNotWorked;

  if (totalActualWorkingDays === Math.floor(workingHours / 8)) {
    // All days in the month are covered by contracts, so no days not worked
    adjustedDaysNotWorked = 0;
  }

  return {
    ...contract,
    daysNotWorked: adjustedDaysNotWorked
  };
});

return {
  employeeId: employee.employee_id,
  details: updatedEmployeeDetails
};
}




function getWorkingDayCountForContract(employeeId, fromDate, toDate, workingDaysSummaryObj) {
const employeeDetails = workingDaysSummaryObj[employeeId] || [];
const contractDetail = employeeDetails.find(detail => 
  detail.contract_from_date === fromDate && detail.contract_to_date === toDate
);
return contractDetail ? contractDetail.workingDayCount : 0;
}



useEffect(() => {
if (validContracts.length > 0 && workingHours && holidays.length >= 0 && year && month) {
  const summary = validContracts.map(employee => countWorkingDays(employee, workingHours, holidays, year, month));
  console.log("Processed Contracts:", summary); // Add this line to log the processed contracts


  const summaryObj = summary.reduce((acc, curr) => {
    acc[curr.employeeId] = curr.details;
    return acc;
  }, {});

  setDaysNotWorkedSummary(summaryObj);
  console.log("Days Not Worked Summary:", summaryObj);

}
}, [validContracts, workingHours, holidays, year, month]);

useEffect(() => {
console.log("Days Not Worked Summary:", daysNotWorkedSummary);
}, [daysNotWorkedSummary]);



console.log("Details before calculating Pro-Rated Gross:", calculatedContracts);
// then call calculateProRatedGross


function calculateProRatedGross(employee, workingHours, year, month) {
console.log(`Calculating Pro-Rated Gross for Employee ID: ${employee.employee_id}`);
let totalProRatedGross = 0;
const monthlyRate = workingHours / 8; // Assuming an 8-hour workday

employee.details.forEach(contract => {
  const workingDayCount = contract.workingDayCount || getWorkingDayCountForContract(employee.employee_id, contract.contract_from_date, contract.contract_to_date);
  console.log(`Contract: ${contract.contract_from_date} to ${contract.contract_to_date}, Working Days: ${workingDayCount}`);

  if (!workingDayCount) {
    console.warn(`No actual working days data for contract starting ${contract.contract_from_date}`);
    return;
  }

  const dailyRate = parseFloat(contract.gross_amount) / monthlyRate;
  const proRatedGrossForContract = dailyRate * workingDayCount;
  console.log(`Daily Rate = ${dailyRate}, Actual Working Days = ${workingDayCount}, Pro-rated Gross = ${proRatedGrossForContract}`);
  totalProRatedGross += proRatedGrossForContract;
});

console.log(`Total Pro-rated Gross for Employee ID ${employee.employee_id}: ${totalProRatedGross}`);
return totalProRatedGross;
}



useEffect(() => {
if (validContracts.length > 0 && workingHours && holidays.length >= 0 && year && month) {
  // First, calculate working days for each contract
  const workingDaysSummary = validContracts.map(employee => countWorkingDays(employee, workingHours, holidays, year, month));
  console.log("Processed Contracts:", workingDaysSummary);

  const workingDaysSummaryObj = workingDaysSummary.reduce((acc, curr) => {
    acc[curr.employeeId] = curr.details;
    return acc;
  }, {});
  setDaysNotWorkedSummary(workingDaysSummaryObj);

  // Then, calculate pro-rated gross based on the working days
  const newProRatedGrossSummary = validContracts.reduce((acc, employee) => {
    if (employee.contract_details && employee.contract_details.length > 1) {
      const transformedEmployee = {
        ...employee,
        details: employee.contract_details.map(contract => ({
          ...contract,
          workingDayCount: getWorkingDayCountForContract(employee.employee_id, contract.contract_from_date, contract.contract_to_date, workingDaysSummaryObj)
        }))
      };
      acc[employee.employee_id] = calculateProRatedGross(transformedEmployee, workingHours, year, month);
    } else {
      acc[employee.employee_id] = parseFloat(employee.gross_amount);
    }
    return acc;
  }, {});
  setProRatedGrossSummary(newProRatedGrossSummary);
}
}, [validContracts, workingHours, holidays, year, month]);



const fetchCompanyData = async () => {
  try {
    const response = await axiosInstance.get('http://localhost:3001/api/created_company', {
      headers: {
        'Authorization': `Bearer ${user.access_token}`, // Use the access token
        'X-Schema-Name': user.schemaName, // Send the schema name as a header
      }
    });
    const company = response.data.length > 0 ? response.data[0] : null;

    if (company && company.company_id) {
      setCompanyData(company);

      // Ensure that company.wypadkowe is a string before attempting to replace
      if (typeof company.wypadkowe === 'string') {
        const parsedWypadkoweRate = parseFloat(company.wypadkowe.replace('%', ''));
        setWypadkoweRate(parsedWypadkoweRate); // Update the state with the parsed value
        console.log('wypadkoweRate in fetchCompanyData:', parsedWypadkoweRate);
      }

      setError(''); // Clear any previous error messages
    } else {
      setCompanyData(null); // Set to null if no data is returned
      setError('No existing company data found. Please fill out the form to create a new company.');
    }
  } catch (error) {
    console.error('Error fetching company data:', error);
    setError(error.response && error.response.status === 404
      ? 'No existing company data found. Please fill out the form to create a new company.'
      : 'Failed to fetch company data.'
    );
    setCompanyData(null);
  }
};

useEffect(() => {
  fetchCompanyData();
}, []);



// Define the employeeParameters array at the top-level scope
// Assuming employeeParameters is now an object
const employeeParameters = {};

const fetchAllParameters = async (employee) => {
try {
    console.log(`Fetching parameters for employee ${employee.employee_id}`);
    const response = await axiosInstance.get(`http://localhost:3001/api/employee-params/${employee.employee_id}`, {
      headers: {
        'Authorization': `Bearer ${user.access_token}`, // Use the access token
        'X-Schema-Name': user.schemaName, // Send the schema name as a header
      }
    });
    const params = response.data.parameters[0] || {}; 
    const { koszty = 250, ulga = 300 } = params; // Default values if not present

    console.log(`Parameters fetched for employee ${employee.employee_id}: koszty=${koszty}, ulga=${ulga}`);

    return { ...employee, koszty, ulga };
} catch (error) {
    console.error(`Error fetching parameters for employee ${employee.employee_id}:`, error);
    return employee; // Keep original employee object in case of error
}
};


const fetchHistoricalSalaries = async (employee, selectedYear, selectedMonth) => {
  try {
      console.log(`Fetching historical salaries for employee ${employee.employee_id}`);
      const response = await axiosInstance.get(`http://localhost:3001/api/salary/historical/${employee.employee_id}/${selectedYear}/${selectedMonth}`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`, // Use the access token
          'X-Schema-Name': user.schemaName, // Send the schema name as a header
        }
      });
      const historicalSalaries = response.data || [];

      // Calculate actualWorkedDays for each salary record
      historicalSalaries.forEach((salary) => {
        if (salary.workingdays !== null) {
            salary.actualWorkedDays = salary.workingdays - (salary.break_bezplatny + salary.break_nieobecnosc + salary.break_zwolnienie_wd +salary.break_ciaza_wd );
        } else {
            salary.actualWorkedDays = "N/A";
        }
        salary.accumulatedTaxBase = salary.accumulatedTaxBase !== null && salary.accumulatedTaxBase !== undefined
                                ? parseFloat(salary.accumulatedTaxBase)
                                : 0; // Default to 0 if not present
        
    // Calculate combined breaks for zwolnienie and ciąża
    salary.combinedBreaks = (salary.break_zwolnienie || 0) + (salary.break_ciaza || 0);
    salary.combinedBreaks_wd = (salary.break_zwolnienie_wd || 0) + (salary.break_ciaza_wd || 0);
    const daysInMonth = getDaysInMonth(salary.salary_year, salary.salary_month);

  // Calculate total breaks
  const totalBreaks = (salary.break_bezplatny || 0) + (salary.break_nieobecnosc || 0) + (salary.combinedBreaks || 0);

  // Calculate calendar worked days
  salary.calendarWorkedDays = daysInMonth - totalBreaks;
    

  });

      console.log(`Historical salaries fetched for employee ${employee.employee_id}:`, historicalSalaries);

      return { ...employee, historicalSalaries };
  } catch (error) {
      console.error(`Error fetching historical salaries for employee ${employee.employee_id}:`, error);
      return { ...employee, historicalSalaries: [] }; // Return employee with empty historical salaries in case of error
  }
};

const getDaysInMonth = (year, month) => {
  if (month === 2) { // Check for February
    const isLeapYear = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
    return isLeapYear ? 29 : 28;
  }
  return new Date(year, month, 0).getDate();
};

const shouldHideColumn = (columnName) => {
  return historicalSalaries.every(salary => 
    salary[columnName] === null || salary[columnName] === 0
  );
};

const hideBreakBezplatny = shouldHideColumn('break_bezplatny');
const hideBreakNieobecnosc = shouldHideColumn('break_nieobecnosc');
const hideBreakZwolnienie = shouldHideColumn('break_zwolnienie');
const hideCombinedBreaks = shouldHideColumn('combinedBreaks');



const calculateAverageForChorobowe = (historicalSalaries) => {
  let totalAmount = 0;
  let count = 0;

  const lastThreeMonths = historicalSalaries.slice(-3);
  const hasBreaks = lastThreeMonths.some(salary => salary.chorobowe_base != null);

  if (hasBreaks) {
    console.log('Calculating average based on chorobowe_base or social_base for the last three months');
    totalAmount = lastThreeMonths.reduce((sum, record) => {
      console.log(`Month: ${record.salary_month}/${record.salary_year}, Amount Used: ${record.chorobowe_base || record.social_base}`);
      return sum + parseFloat(record.chorobowe_base || record.social_base);
    }, 0);
    count = lastThreeMonths.length;
  } else {
    console.log('Calculating average based on gross_total or social_base for all historical salaries');
    historicalSalaries.forEach(salary => {
      const daysInMonth = getDaysInMonth(salary.salary_year, salary.salary_month);
      const hasNieobecnosc = salary.break_nieobecnosc > 0; // Check for 'nieobecność' break
      const totalBreakDays = salary.break_zwolnienie_wd + salary.break_ciaza_wd + salary.break_bezplatny;
      const totalWorkedDays = salary.workingdays - totalBreakDays;
      const isFullMonthWorked = totalWorkedDays === salary.workingdays;
      const isMoreThanHalfMonthWorked = totalWorkedDays > (salary.workingdays / 2);

      console.log(`Month: ${salary.salary_month}/${salary.salary_year}, Total Worked Days: ${totalWorkedDays}, Days in Month: ${salary.workingdays}, Full Month: ${isFullMonthWorked}, More Than Half Month: ${isMoreThanHalfMonthWorked}`);

      if (hasNieobecnosc || isFullMonthWorked) {
            // Always use social_base if there is 'nieobecność' or the full month is worked
            totalAmount += parseFloat(salary.social_base);
        console.log(`Including full month worked using social_base: ${salary.social_base}`);
      } else if (isMoreThanHalfMonthWorked) {
        totalAmount += parseFloat(salary.gross_total);
        console.log(`Including more than half month worked using gross_total: ${salary.gross_total}`);
      }
     // Increment the count if there's 'nieobecność', the month is fully worked, or more than half the month is worked
     if (hasNieobecnosc || isFullMonthWorked || isMoreThanHalfMonthWorked) {
      count++;
  }
    });
  }

  const average = count > 0 ? totalAmount / count : 0;
  console.log(`Total Amount for Average Calculation: ${totalAmount}, Count of Months Considered: ${count}, Calculated Average: ${average}`);

  if (average < MINIMUM_SALARY) {
    setIsUsingMinimumSalary(true);
    console.warn(`Average salary (${average.toFixed(2)} zł) is below the minimum (${MINIMUM_SALARY} zł). Using the minimum salary.`);
    return MINIMUM_SALARY;
  } else {
    setIsUsingMinimumSalary(false);
    return average;
  }
};






const handleSalaryChange = (event, index, field) => {
  const updatedValue = parseFloat(event.target.value) || 0; // Convert to number and handle non-numeric inputs
  const updatedSalaries = [...historicalSalaries];
  updatedSalaries[index] = {
      ...updatedSalaries[index],
      [field]: updatedValue // Update the specified field
  };

  setHistoricalSalaries(updatedSalaries);

  // Recalculate the average salary
  const calculatedAverage = calculateAverageForChorobowe(updatedSalaries);
  const finalAverage = calculatedAverage < MINIMUM_SALARY ? MINIMUM_SALARY : calculatedAverage;
  setAverageSalary(finalAverage);
};

// Handle manual changes to the average salary
const handleAverageSalaryChange = (event) => {
  setIsAverageManuallySet(true);
  setAverageSalary(parseFloat(event.target.value) || 0);
};



const renderHistoricalSalariesTable = () => {
  if (!showHistoricalSalaries || historicalSalaries.length === 0) return null;

  const employeeId = historicalSalaries[0]?.employee_id || 'N/A';

  return (
      <div className="mt-4">
          <h3 className="text-lg font-semibold mb-3">Wynagrodzenie dla pracownika: {employeeId} za okresy:</h3>
          <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white rounded-md shadow overflow-hidden">
              <thead className="bg-gray-200">
                  <tr>
                  <th className="px-3 py-2 text-xs font-medium text-gray-700"></th>
                  <th className="px-3 py-2 text-xs font-medium text-gray-700">Okres</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-700">Data wyplaty</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-700">Podstawa brutto</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-700">Uzupełnione Wynagrodzenie</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-700">Amount Used for Average</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-700">Dni miesiąca</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-700">Dni miesiąca przepracowane</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-700">Dni pracy</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-700">Dni przepracowane</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-700">Dni zwolnienia/ciąży robocze</th> 
                      {!hideBreakBezplatny && <th className="px-3 py-2 text-xs font-medium text-gray-700">Dni bezpłatny</th>}
                      {!hideBreakNieobecnosc && <th className="px-3 py-2 text-xs font-medium text-gray-700">Dni nieobecność</th>}
    {!hideBreakZwolnienie && <th className="px-3 py-2 text-xs font-medium text-gray-700">Dni zwolnienia</th>}
    {!hideCombinedBreaks && <th className="px-3 py-2 text-xs font-medium text-gray-700">Dni zwolnienia</th>}
                  </tr>
              </thead>
              <tbody className="text-xs divide-y divide-gray-200">
                  {historicalSalaries.map((salary, index) => {
                    const daysInMonth = getDaysInMonth(salary.salary_year, salary.salary_month);
                    const hasNieobecnosc = salary.break_nieobecnosc > 0; // Check for 'nieobecność' break
                    const halfMonthDays = salary.workingdays / 2;
                    const totalBreakDays = salary.break_zwolnienie_wd + salary.break_ciaza_wd + salary.break_bezplatny;
                    const totalWorkedDays = salary.actualWorkedDays - totalBreakDays;
                    const isFullMonthWorked = totalWorkedDays === salary.workingdays;
                    const isMoreThanHalfMonthWorked = totalWorkedDays > halfMonthDays;

                    // Define the amount used for average calculation
                    let amountUsedForAverage = '---';
                    if (hasNieobecnosc || isFullMonthWorked) {
                        amountUsedForAverage = parseFloat(salary.social_base).toFixed(2);
                    } else if (isMoreThanHalfMonthWorked) {
                        amountUsedForAverage = parseFloat(salary.gross_total).toFixed(2);
                    }

                    return (
                      <tr key={index}>
                          <td className="px-3 py-1">{isMoreThanHalfMonthWorked ? "Przepracowana ponad połowa mca - ujęte do średniej" : "Mniej niż połowa mca przepracowana - pominięte"}</td>
                       <td className="px-3 py-1">{salary.salary_month}/{salary.salary_year} ({daysInMonth} dni)</td>
                          <td className="px-3 py-1">{salary.salary_date}</td>
                          <td className="px-3 py-1">
                                <input 
                                    type="number"
                                    value={salary.social_base}
                                    onChange={(e) => handleSalaryChange(e, index, 'social_base')}
                                   
                                />
                            </td>
                            <td className="px-3 py-1">
                                    <input 
                                        type="number"
                                        value={salary.gross_total}
                                        onChange={(e) => handleSalaryChange(e, index, 'gross_total')}
                                    />
                                </td>
                                <td className="px-3 py-1">{amountUsedForAverage}</td>
                          <td className="px-3 py-1"> {daysInMonth}</td>
                          <td className="px-3 py-1">{salary.calendarWorkedDays}</td>
                          <td className="px-3 py-1">{salary.workingdays}</td>
                          <td className="px-3 py-1">{salary.actualWorkedDays}</td>
                          <td className="px-3 py-1">{salary.combinedBreaks_wd}</td>
                          {!hideBreakBezplatny && <td className="px-3 py-1">{salary.break_bezplatny}</td>}
                          {!hideBreakNieobecnosc && <td className="px-3 py-1">{salary.break_nieobecnosc}</td>}
      {!hideBreakZwolnienie && <td className="px-3 py-1">{salary.break_zwolnienie}</td>}
      {!hideCombinedBreaks && <td className="px-3 py-1">{salary.combinedBreaks}</td>}
                      </tr>
                    );
                    })}
              </tbody>
          </table>
          </div>
          <div className="mt-4">
          <label htmlFor="manualAverage" className="block text-sm font-medium text-gray-700">
                Manualna korekta średniej wynagrodzenia:
            </label>
            <input 
                id="manualAverage"
                type="number"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={averageSalary}
                onChange={handleAverageSalaryChange}
            />
        </div>
          <p className="mt-2">Ujętę do podstawy chorobowego średnie wynagrodzenie: {averageSalary.toFixed(2)} </p>
          {isUsingMinimumSalary && (
              <p className="text-sm text-red-500">
                  Note: The calculated average was below the minimum salary. The minimum salary of {MINIMUM_SALARY} zł is being used.
              </p>
          )}
          
</div>
      
      
  );
};

const adjustBreakDaysAndCategorizeExcess = (historicalSalaries, currentContract, currentYear, showToast) => {
  let totalBreakDays = currentContract.break_zwolnienie || 0;
  totalBreakDays += currentContract.break_ciaza || 0; // Include current month's break_ciaza if applicable

  // Now proceed with the historical data
  historicalSalaries.forEach(salary => {
      if (salary.salary_year === currentYear) {
          totalBreakDays += (salary.break_zwolnienie || 0) + (salary.break_ciaza || 0);

          if (totalBreakDays > 33) {
              const excessDays = totalBreakDays - 33;
              showToast(`Przekroczone 33 dni choroowego ${salary.salary_month}/${salary.salary_year}. Ostanie ${excessDays} dni należy wybrać jako 'zasiłek ZUS'.`);
              console.log(`Month: ${salary.salary_month}/${salary.salary_year}, Excess Days: ${excessDays}`);
              totalBreakDays = 33; // Reset total break days to 33
          }
      }
  });

  return historicalSalaries; // No modification needed in the array itself
};

const getAgeFromPesel = (pesel) => {
  if (pesel.length !== 11) return null;  // Basic validation for PESEL length

  let year = parseInt(pesel.substring(0, 2), 10);
  let month = parseInt(pesel.substring(2, 4), 10);
  let day = parseInt(pesel.substring(4, 6), 10);

  // Adjust year and month based on PESEL month codes
  if (month > 80) {
      year += 1800;
      month -= 80;
  } else if (month > 60) {
      year += 2200;
      month -= 60;
  } else if (month > 40) {
      year += 2100;
      month -= 40;
  } else if (month > 20) {
      year += 2000;
      month -= 20;
  } else {
      year += 1900;
  }

  const birthDate = new Date(year, month - 1, day); // Month is zero-based in JavaScript
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }

  return age;
};








































// Define the handleHealthBreakStartDateChange function
// Define the handleHealthBreakStartDateChange function
const handleHealthBreakStartDateChange = (date, index) => {
  const updatedBreaks = [...healthBreaks];

  if (updatedBreaks[index] && updatedBreaks[index].type) {
    const breakType = updatedBreaks[index].type;
    const isWeekendDisabled = breakType === 'bezpłatny' || breakType === 'nieobecność';

    if (isWeekendDisabled && (isWeekend(date) || isHolidayOnDate(holidays, date))) {
      toast.error('Weekends and holidays are not allowed for this break type.');
      return;
    }

    const formattedDate = date ? moment(date).tz("Europe/Warsaw").format() : null;

    if (isDateInSelectedMonth(date, month, year) && isStartDateValid(date, updatedBreaks[index].endDate)) {
      updatedBreaks[index].startDate = formattedDate;
      setHealthBreaks(updatedBreaks);
      calculateDays(index, updatedBreaks);
    } else {
      toast.error("Please pick start dates within the selected month and before the end date.");
    }
  } else {
    toast.error("Please select a break type first.");
  }
};

// Define the handleHealthBreakEndDateChange function
const handleHealthBreakEndDateChange = (date, index) => {
  const updatedBreaks = [...healthBreaks];

  if (updatedBreaks[index] && updatedBreaks[index].type) {
    const breakType = updatedBreaks[index].type;
    const isWeekendDisabled = breakType === 'bezpłatny' || breakType === 'nieobecność';

    if (isWeekendDisabled && (isWeekend(date) || isHolidayOnDate(holidays, date))) {
      toast.error('Weekends and holidays are not allowed for this break type.');
      return;
    }

    const formattedDate = date ? moment(date).tz("Europe/Warsaw").format() : null;

    if (isDateInSelectedMonth(date, month, year) && isEndDateValid(date, updatedBreaks[index].startDate)) {
      updatedBreaks[index].endDate = formattedDate;
      setHealthBreaks(updatedBreaks);
      calculateDays(index, updatedBreaks);
    } else {
      toast.error("Please pick end dates within the selected month and after the start date.");
    }
  } else {
    toast.error("Please select a break type first.");
  }
};



const isDateInSelectedMonth = (date, month, year) => {
  return date && date.getMonth() + 1 === parseInt(month) && date.getFullYear() === parseInt(year);
};

const isStartDateValid = (startDate, endDate) => {
  if (!startDate) return false;
  return !endDate || startDate <= new Date(endDate);
};

const isEndDateValid = (endDate, startDate) => {
  if (!endDate) return false;
  return !startDate || endDate >= new Date(startDate);
};

function calculateBreakDuration(startDate, endDate, holidays) {
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
}



// Function to calculate the number of days between start and end dates and update the state
const calculateDays = (index, updatedBreaks) => {
  const breakItem = updatedBreaks[index];
  if (breakItem && breakItem.startDate && breakItem.endDate) {
      const startDate = new Date(breakItem.startDate);
      const endDate = new Date(breakItem.endDate);
      const breakType = breakItem.type;

      if (breakType === 'bezpłatny' || breakType === 'nieobecność') {
          // Only count working days
          breakItem.days = calculateBreakDuration(startDate, endDate, holidays);
      } else {
          // Count all days
          const timeDifference = endDate.getTime() - startDate.getTime();
          breakItem.days = Math.round(timeDifference / (1000 * 60 * 60 * 24)) + 1;
      }
  } else {
      breakItem.days = 0;
  }

  setHealthBreaks(updatedBreaks);
};

const calculateBreaks = (breakItem) => {
  console.log(`Calculating breaks for: ${breakItem.type}`);

  const startDate = new Date(breakItem.startDate);
  const endDate = new Date(breakItem.endDate);

  // Calculate calendar days
  const timeDifference = endDate.getTime() - startDate.getTime();
  breakItem.calendarDays = Math.round(timeDifference / (1000 * 60 * 60 * 24)) + 1;
  console.log(`Calendar Days: ${breakItem.calendarDays}`);

  // Calculate working days for 'zwolnienie' and 'ciąża'
  if (['zwolnienie', 'ciąża'].includes(breakItem.type)) {
      breakItem.workingDays = calculateBreakDuration(startDate, endDate, holidays);
      console.log(`Working Days: ${breakItem.workingDays}`);
  } else {
      breakItem.workingDays = breakItem.calendarDays;
  }
};





// Define the handleHealthBreakTypeChange function
const handleHealthBreakTypeChange = (e, index) => {
const updatedBreaks = [...healthBreaks];
updatedBreaks[index] = {
  ...updatedBreaks[index],
  type: e.target.value,
};
setHealthBreaks(updatedBreaks);
// Display a notification
toast.info(`Break type changed. Please recalculate the salary.`, {
  position: "top-center",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
});
// Update the display of historical salaries
checkAndSetZwolnienieDisplay(updatedBreaks, additionalBreaksByEmployee);

};

// Define the handleAdditionalBreakStartDateChange function
// Define the handleAdditionalBreakStartDateChange function
const handleAdditionalBreakStartDateChange = (date, employeeId, breakIndex) => {
  const breaksForEmployee = [...(additionalBreaksByEmployee[employeeId] || [])];

  if (breaksForEmployee[breakIndex] && breaksForEmployee[breakIndex].type) {
    const breakType = breaksForEmployee[breakIndex].type;
    const isWeekendDisabled = breakType === 'bezpłatny' || breakType === 'nieobecność';

    if (isWeekendDisabled && (isWeekend(date) || isHolidayOnDate(holidays, date))) {
      toast.error('Weekends and holidays are not allowed for this break type.');
      return;
    }

    const formattedDate = date ? moment(date).tz("Europe/Warsaw").format() : null;

    if (isDateInSelectedMonth(date, month, year) && isStartDateValid(date, breaksForEmployee[breakIndex].endDate)) {
      breaksForEmployee[breakIndex].startDate = formattedDate;
      setAdditionalBreaksByEmployee({ ...additionalBreaksByEmployee, [employeeId]: breaksForEmployee });
      calculateAdditionalDays(employeeId, breakIndex, breaksForEmployee);
    } else {
      toast.error("Please pick start dates within the selected month and before the end date.");
    }
  } else {
    toast.error("Please select a break type first.");
  }
};

// Define the handleAdditionalBreakEndDateChange function
const handleAdditionalBreakEndDateChange = (date, employeeId, breakIndex) => {
  const breaksForEmployee = [...(additionalBreaksByEmployee[employeeId] || [])];

  if (breaksForEmployee[breakIndex] && breaksForEmployee[breakIndex].type) {
    const breakType = breaksForEmployee[breakIndex].type;
    const isWeekendDisabled = breakType === 'bezpłatny' || breakType === 'nieobecność';

    if (isWeekendDisabled && (isWeekend(date) || isHolidayOnDate(holidays, date))) {
      toast.error('Weekends and holidays are not allowed for this break type.');
      return;
    }

    const formattedDate = date ? moment(date).tz("Europe/Warsaw").format() : null;

    if (isDateInSelectedMonth(date, month, year) && isEndDateValid(date, breaksForEmployee[breakIndex].startDate)) {
      breaksForEmployee[breakIndex].endDate = formattedDate;
      setAdditionalBreaksByEmployee({ ...additionalBreaksByEmployee, [employeeId]: breaksForEmployee });
      calculateAdditionalDays(employeeId, breakIndex, breaksForEmployee);
    } else {
      toast.error("Please pick end dates within the selected month and after the start date.");
    }
  } else {
    toast.error("Please select a break type first.");
  }
};





// Function to calculate the number of days between start and end dates for additional breaks and update the state
// Function to calculate the number of days between start and end dates for additional breaks and update the state
const calculateAdditionalDays = (employeeId, breakIndex, breaksForEmployee) => {
  const breakItem = breaksForEmployee[breakIndex];
  if (breakItem && breakItem.startDate && breakItem.endDate) {
    const startDate = new Date(breakItem.startDate);
    const endDate = new Date(breakItem.endDate);
    const breakType = breakItem.type;

    if (breakType === 'bezpłatny' || breakType === 'nieobecność') {
      // Only count working days for bezpłatny or nieobecność
      breakItem.additionalDays = calculateBreakDuration(startDate, endDate, holidays);
    } else {
      // Count all days for other types of breaks
      const timeDifference = endDate.getTime() - startDate.getTime();
      breakItem.additionalDays = Math.round(timeDifference / (1000 * 60 * 60 * 24)) + 1;
    }
  } else {
    breakItem.additionalDays = 0;
  }

    setAdditionalBreaksByEmployee({ ...additionalBreaksByEmployee, [employeeId]: breaksForEmployee });
  };

// Function to calculate working days for 'zwolnienie' and 'ciąża' for the default break
const calculateWorkingDaysForDefaultBreak = (breakItem, holidays) => {
  if (!breakItem || !breakItem.startDate || !breakItem.endDate) return 0;
  if (['zwolnienie', 'ciąża'].includes(breakItem.type)) {
    return calculateBreakDuration(new Date(breakItem.startDate), new Date(breakItem.endDate), holidays);
  }
  return 0;
};

// Function to calculate working days for 'zwolnienie' and 'ciąża' for the additional break
const calculateWorkingDaysForAdditionalBreak = (breakItem, holidays) => {
  if (!breakItem || !breakItem.startDate || !breakItem.endDate) return 0;
  if (['zwolnienie', 'ciąża'].includes(breakItem.type)) {
    return calculateBreakDuration(new Date(breakItem.startDate), new Date(breakItem.endDate), holidays);
  }
  return 0;
};




// Define the handleAdditionalBreakTypeChange function
const handleAdditionalBreakTypeChange = (e, employeeId, breakIndex) => {
const breaksForEmployee = [...(additionalBreaksByEmployee[employeeId] || [])];
breaksForEmployee[breakIndex].type = e.target.value;
setAdditionalBreaksByEmployee({ ...additionalBreaksByEmployee, [employeeId]: breaksForEmployee });
// Display a notification
toast.info(`Break type changed for employee ID ${employeeId}. Please recalculate the salary.`, {
  position: "top-center",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
});
// Update the display of historical salaries
checkAndSetZwolnienieDisplay(healthBreaks, { ...additionalBreaksByEmployee, [employeeId]: breaksForEmployee });


};



const addAdditionalBreak = (employeeId) => {
  const newBreak = { startDate: null, endDate: null, type: '', additionalDays: 0 };
  const updatedBreaksForEmployee = [...(additionalBreaksByEmployee[employeeId] || []), newBreak];
  setAdditionalBreaksByEmployee({ ...additionalBreaksByEmployee, [employeeId]: updatedBreaksForEmployee });
  };
  
  
  const deleteAdditionalBreak = (employeeId, breakIndex, isEditMode) => {
    const breaksForEmployee = additionalBreaksByEmployee[employeeId] || [];
    const breakToDelete = breaksForEmployee[breakIndex];
  
    if (breakToDelete) {
      // Direct removal in non-edit mode
      if (!isEditMode) {
        breaksForEmployee.splice(breakIndex, 1);
        toast.info(`Break at index ${breakIndex} for employee ID: ${employeeId} removed in non-edit mode.`);
      } else {
        // Existing functionality: Mark the break for deletion or remove it
        if (breakToDelete.id) {
          breaksForEmployee[breakIndex] = { ...breakToDelete, isDeleted: true };
          toast.info(`Additional break for employee ID: ${employeeId} marked for deletion.`);
        } else {
          toast.info(`Additional break for employee ID: ${employeeId} removed.`);
          breaksForEmployee.splice(breakIndex, 1);
        }
      }
  
      // Safely update the breaks in calculatedContracts (healthBreaks)
      if (calculatedContracts && calculatedContracts.map) {
        const updatedEmployees = calculatedContracts.map(employee => {
          if (employee.employee_id === employeeId && employee.healthBreaks && employee.healthBreaks.map) {
            const updatedHealthBreaks = employee.healthBreaks.map((healthBreak) => {
              if (healthBreak.id === breakToDelete.id) {
                return { ...healthBreak, isDeleted: true };
              }
              return healthBreak;
            });
  
            return { ...employee, healthBreaks: updatedHealthBreaks };
          }
          return employee;
        });
  
        setCalculatedContracts(updatedEmployees);
      }
  
      setAdditionalBreaksByEmployee({ ...additionalBreaksByEmployee, [employeeId]: breaksForEmployee });
    } else {
      toast.error(`No additional break found for employee ID: ${employeeId}.`);
    }
  };
  
  
  const checkAndSetZwolnienieDisplay = (healthBreaks, additionalBreaks) => {
    const isBreakSelected = healthBreaks.some(breakItem => breakItem.type === 'zwolnienie' || breakItem.type === 'ciąża') ||
        Object.values(additionalBreaks).flat().some(breakItem => breakItem.type === 'zwolnienie' || breakItem.type === 'ciąża');

    setShowHistoricalSalaries(isBreakSelected);
    // Additionally, set the visibility of the recalculate button
    setShowRecalculateButton(isBreakSelected);
};


  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  const deletePrimaryBreak = (employeeId) => {
    // Iterate over calculatedContracts to update the specific employee's breaks
    const updatedContracts = calculatedContracts.map(employee => {
      if (employee.employee_id === employeeId) {
        // Mark the primary health break for deletion and reset its data to default
        // but keep the break's id
        const updatedHealthBreaks = employee.healthBreaks.map(breakItem => {
          if (breakItem.id === employee.healthBreaks[0]?.id) {
            return { ...defaultHealthBreak, id: breakItem.id, isDeleted: true };
          }
          return breakItem;
        });
  
        return {
          ...employee,
          contracts: [{ ...employee.contracts[0] }],
          healthBreaks: updatedHealthBreaks,
        };
      }
      return employee;
    });
  
    setCalculatedContracts(updatedContracts);
  
    // Update healthBreaks in the state
    const updatedHealthBreaks = healthBreaks.map((breakItem, index) => {
      if (calculatedContracts[index]?.employee_id === employeeId && breakItem?.id) {
        // Reset the break data to default and mark for deletion, but keep the id
        return { ...defaultHealthBreak, id: breakItem.id, isDeleted: true };
      }
      return breakItem;
    });
  
    setHealthBreaks(updatedHealthBreaks);
  
    toast.info(`Primary break for employee ID: ${employeeId} marked for deletion and reset to default.`);
  };
  
  
  
  
  
  

  
  
  
  
  

















const handleAdditionalBreakDaysChange = (e, employeeId, breakIndex) => {
const { name, value } = e.target;
const breaksForEmployee = [...(additionalBreaksByEmployee[employeeId] || [])];
breaksForEmployee[breakIndex][name] = value;
setAdditionalBreaksByEmployee({ ...additionalBreaksByEmployee, [employeeId]: breaksForEmployee });
};

const calculateDaysForBreakType = (breakType) => {
return additionalBreaks
  .filter(breakItem => breakItem.type === breakType)
  .reduce((totalDays, breakItem) => totalDays + breakItem.additionalDays, 0);
};

const zwolnienieDays = calculateDaysForBreakType("zwolnienie");
const bezplatnyDays = calculateDaysForBreakType("bezpłatny");
const nieobecnoscDays = calculateDaysForBreakType("nieobecność");

// Reset function for health breaks
const resetBreakFields = () => {
// Resetting the healthBreaks for each employee to a default state
const resetHealthBreaks = calculatedContracts.map(() => defaultHealthBreak);
setHealthBreaks(resetHealthBreaks);

// Resetting additional breaks for each employee
const resetAdditionalBreaks = Object.keys(additionalBreaksByEmployee).reduce((acc, key) => {
  acc[key] = []; // Assuming an empty array represents no additional breaks
  return acc;
}, {});
setAdditionalBreaksByEmployee(resetAdditionalBreaks);

// Any other break related states can be reset here
};

function roundUpToCent(value) {
return Math.ceil(value * 100) / 100;
}
// Define a function to calculate salary
// Define a function to calculate salary
console.log("Current employee object:", employees);

const handleBonusChange = (value, employeeId) => {
console.log(`Bonus input change for employee ${employeeId}:`, value); // Log the value being inputted

const updatedBonuses = {...employeeBonuses, [employeeId]: value};
setEmployeeBonuses(updatedBonuses);

console.log("Updated Bonuses after change:", updatedBonuses); // Log the updated bonuses state
};



const calculateSalary = (grossAmountValue, daysOfBreak, breakType, additionalDaysArray, additionalBreakTypesArray, workingHours, totalDaysNotWorked, proRatedGross, totalProRatedGross, bonus, wypadkoweRate, koszty, ulga, allBreaks, averageSalary, workingDaysZwolnienie, workingDaysCiaza, historicalSalaries, employee, employeeId) => {

console.log(`Calculating salary for employee ID ${employeeId}`);
console.log(`Calculating salary for employee ID ${employeeId} with koszty=${koszty}, ulga=${ulga}`);


console.log('Koszty:', koszty, 'Ulga:', ulga);
// Set default values if koszty or ulga are not provided
const employeeKoszty = koszty !== undefined ? koszty : 250;
const employeeUlga = ulga !== undefined ? ulga : 300;

// Optionally, log a message if default values are being used
if (koszty === undefined || ulga === undefined) {
  console.log(`Default values used for employee ${employeeId} - Koszty: ${employeeKoszty}, Ulga: ${employeeUlga}`);
}
console.log('All Breaks:', allBreaks);
// Check if defaults are being used
// Check if defaults are being used
if (koszty === undefined || ulga === undefined) {
  toast.warn(`Proszę uzupełnij parametry podatkowe dla for pracownika ID: ${employeeId}.Aktualnie do wyliczenia są przyjęte wartości domyślne.Koszty: ${employeeKoszty}, Ulga: ${employeeUlga}`, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
  });
}
// Log to check the received value of daysNotWorked
console.log("Days Not Worked Received:", totalDaysNotWorked);
console.log(`Days Not Worked Received for Employee:`, totalDaysNotWorked);
console.log(`proRatedGross:`, proRatedGross);
console.log(`proRatedGross:`, totalProRatedGross);
console.log("Received bonus in calculateSalary:", bonus);  // This log should show the bonus value
console.log('wypadkoweRatee:', wypadkoweRate);
// Calling calculateSalary for an individual employee
console.log("State before individual calculation:", employeeBonuses);
console.log("Average Salary inside calculateSalary:", averageSalary);
console.log("Average Salary inside calculateSalary:", averageSalary);
console.log("workingDaysZwolnienie:", workingDaysZwolnienie);

// Find the last salary record to get the most recent accumulatedTaxBase
const lastSalary = historicalSalaries[historicalSalaries.length - 1];
const lastAccumulatedTaxBase = lastSalary ? lastSalary.accumulatedTaxBase : 0;


// Check if the additionalDaysArray is an array, if not, log an error and return
if (!Array.isArray(additionalDaysArray)) {
    console.error("additionalDaysArray must be an array.");
    return;  // You might want to handle this more gracefully or return default values.
}

// Check if the additionalBreakTypesArray is an array, if not, log an error and return
if (!Array.isArray(additionalBreakTypesArray)) {
    console.error("additionalBreakTypesArray must be an array.");
    return;  // You might want to handle this more gracefully or return default values.
}

// Use proRatedGross if available, otherwise use grossAmountValue
let customGrossAmount = proRatedGross ? parseFloat(proRatedGross) : parseFloat(grossAmountValue);

// Use averageSalary if the condition is met, otherwise use grossAmountValue
const salaryForCalculation =  averageSalary ? averageSalary : customGrossAmount;
// Debug log

let totalDaysZwolnienie = breakType === 'zwolnienie' ? daysOfBreak : 0;
let totalDaysBezplatny = breakType === 'bezpłatny' ? daysOfBreak : 0;
let totalDaysNieobecnosc = breakType === 'nieobecność' ? daysOfBreak : 0;
let totalDaysRodzicielski = breakType === 'rodzicielski' ? daysOfBreak : 0;
let totalDaysCiaza = breakType === 'ciąża' ? daysOfBreak : 0;
let totalDaysWychowawczy = 0;
let wynChorobowe = 0;
const totalWorkingDaysZwolnienie = workingDaysZwolnienie; // Working days for zwolnienie
    const totalWorkingDaysCiaza = workingDaysCiaza; // Working days for ciąża


// Summing up additional days for each break type
for (let i = 0; i < additionalDaysArray.length; i++) {
    switch (additionalBreakTypesArray[i]) {
        case 'zwolnienie':
            totalDaysZwolnienie += additionalDaysArray[i];
            break;
        case 'bezpłatny':
            totalDaysBezplatny += additionalDaysArray[i];
            break;
        case 'nieobecność':
            totalDaysNieobecnosc += additionalDaysArray[i];
            break;
        case 'rodzicielski':
            totalDaysRodzicielski += additionalDaysArray[i];
            break;
        case 'ciąża':
            totalDaysCiaza += additionalDaysArray[i];
            break;
        case 'wychowawczy':
            totalDaysWychowawczy += additionalDaysArray[i];
            break;
    }
}

// Logging the total number of days for different break types
console.log('Total Days Bezplatny:', totalDaysBezplatny);
console.log('Total Days Zwolnienie:', totalDaysZwolnienie);
console.log('Total Days Ciąża:', totalDaysCiaza);
console.log('Total Days Rodzicielsk:', totalDaysRodzicielski);
// ... log for other break types ...

// Continue with the rest of your calculation logic


const allBreakTypes = [breakType, ...additionalBreakTypesArray];
const allBreakDays = [daysOfBreak, ...additionalDaysArray];

const hasZwolnienie = allBreakTypes.includes('zwolnienie');
const hasBezplatny = allBreakTypes.includes('bezpłatny');

// Logging the presence of the break types
console.log('Has Bezplatny:', hasBezplatny);
console.log('Has Zwolnienie:', hasZwolnienie);


// Special handling for combined 'bezpłatny' and 'zwolnienie':
// Logging the gross amount before reduction
console.log('Custom Gross Amount before reduction:', customGrossAmount);

// Determine the daily rate based on working hours
const dailyRate = grossAmountValue / workingHours;
console.log("Daily Rate:", dailyRate);
console.log("Working hours:", workingHours);

// Calculate deduction for not worked days
const notWorkedDaysDeduction = totalDaysNotWorked > 0 ? dailyRate * totalDaysNotWorked * 8 : 0;
console.log("Not Worked Days Deduction:", notWorkedDaysDeduction);
console.log("total days not worked:", totalDaysNotWorked);
console.log("total days bezpłatny:", totalDaysBezplatny);


// Special handling for combined 'bezpłatny' and 'zwolnienie':
if (hasBezplatny && !hasZwolnienie) {
    const reductionBezplatny = (dailyRate * totalDaysBezplatny * 8);
    customGrossAmount -= reductionBezplatny;
}

// Process other breaks in order
for (let i = 0; i < allBreakTypes.length; i++) {
    const currentBreakType = allBreakTypes[i];
    const currentBreakDays = allBreakDays[i];
    console.log("Current break days and type:", currentBreakDays, currentBreakType);

    if (currentBreakType === 'zwolnienie') {
        customGrossAmount -= (grossAmountValue / 30 * currentBreakDays);
        wynChorobowe += ((salaryForCalculation - 0.1371 * salaryForCalculation) / 30) * (currentBreakDays * 0.8);
    } else if ((currentBreakType === 'bezpłatny' || currentBreakType === 'nieobecność' || currentBreakType === 'wychowawczy') && hasZwolnienie) {
      // Your code here
        customGrossAmount -= (dailyRate * currentBreakDays * 8);
    } else if (currentBreakType === 'ciąża') {
      customGrossAmount -= (grossAmountValue / 30 * currentBreakDays);
        wynChorobowe += ((averageSalary - 0.1371 * averageSalary) / 30) * (currentBreakDays);
    } else if (currentBreakType === 'rodzicielski') {
      // For 'rodzicielski', apply the same deduction as 'zwolnienie' but set wyn_chorobowe to 0
      customGrossAmount -= (grossAmountValue / 30 * currentBreakDays);
      wynChorobowe = 0; // This leave is covered by ZUS, not included in the salary calculation
  }else if (currentBreakType === 'nieobecność') {
    customGrossAmount -= (dailyRate * currentBreakDays * 8);
  }
}


// Apply the not worked days deduction
customGrossAmount -= notWorkedDaysDeduction;

// Ensure customGrossAmount has two decimal places
customGrossAmount = parseFloat(customGrossAmount.toFixed(2));
console.log("customGrossAmount before adding bonus:", customGrossAmount);

 // Add the bonus after all other adjustments to customGrossAmount
customGrossAmount += parseFloat(bonus || 0);

customGrossAmount = customGrossAmount > 0 ? customGrossAmount: "0";

console.log("customGrossAmount after adding bonus:", customGrossAmount);

// Calculate the employee's age using their PESEL number
const age = getAgeFromPesel(employee.pesel);
console.log(`Employee Age for ${employee.name} ${employee.surname} (ID: ${employee.employee_id}): ${age}`);



// The rest of your logic remains unchanged
let podstawa_zdrow = (roundUpToCent(customGrossAmount) - roundUpToCent(customGrossAmount * 0.0976) - roundUpToCent(customGrossAmount * 0.015) - roundUpToCent(customGrossAmount * 0.0245) + parseFloat(wynChorobowe)).toFixed(2);
let pod_zal = ((customGrossAmount - (0.1371 * customGrossAmount)) + parseFloat(wynChorobowe) - employeeKoszty);
let currentMonthTaxBase = parseFloat(pod_zal); // Assuming pod_zal is calculated
// Calculate the new accumulatedTaxBase
let newAccumulatedTaxBase = lastAccumulatedTaxBase + currentMonthTaxBase;

console.log(`Current Month Tax Base: ${currentMonthTaxBase}`);
console.log(`New Accumulated Tax Base: ${newAccumulatedTaxBase}`);

// New tax calculation based on the accumulated tax base
const taxThreshold = 120000;
const youngEmployeeTaxThreshold = 85528;
let tax;

if (employee.pesel && age <= 26) {
    console.log(`Employee ${employee.name} ${employee.surname} (ID: ${employee.employee_id}) is under 26 years old.`);
    if (newAccumulatedTaxBase <= youngEmployeeTaxThreshold) {
        console.log('Tax set to zero for young employee under the threshold.');
        toast.success(`Tax set to zero for young employee under the threshold: ${employee.name} ${employee.surname} (ID: ${employee.employee_id})`);
        tax = 0;
    } else {
        if (newAccumulatedTaxBase <= taxThreshold) {
            tax = (newAccumulatedTaxBase - youngEmployeeTaxThreshold) * 0.12;
            console.log(`Tax calculated at 12% rate for amount over young employee threshold: ${tax}`);
        } else {
            const lowerBracketTax = (taxThreshold - youngEmployeeTaxThreshold) * 0.12;
            const higherBracketTax = (newAccumulatedTaxBase - taxThreshold) * 0.32;
            tax = lowerBracketTax + higherBracketTax;
            console.log(`Tax calculated with mixed rates for young employee: ${tax}`);
            toast.info(`Tax calculated with mixed rates for young employee: ${tax}`);
        }
    }
} else {
    if (newAccumulatedTaxBase <= taxThreshold) {
        tax = currentMonthTaxBase * 0.12;
        console.log(`Tax calculated at 12% rate: ${tax}`);
    } else if (lastAccumulatedTaxBase < taxThreshold) {
        const lowerBracketPortion = taxThreshold - lastAccumulatedTaxBase;
        const higherBracketPortion = newAccumulatedTaxBase - taxThreshold;
        tax = lowerBracketPortion * 0.12 + higherBracketPortion * 0.32;
        console.log(`Tax calculated with mixed rates: ${tax}`);
        toast.info(`Tax calculated with mixed rates: ${tax}`);
    } else {
        tax = currentMonthTaxBase * 0.32;
        console.log(`Tax calculated at 32% rate: ${tax}`);
        toast.warn(`Tax calculated at 32% rate: ${tax}`);
    }
}

// Calculate zaliczka using the new tax amount
let zaliczka = tax - employeeUlga;
zaliczka = zaliczka < 0 ? 0 : zaliczka.toFixed(0);

pod_zal = pod_zal > 0 ? pod_zal.toFixed(0) : '0';

let zal_2021 = (parseFloat(pod_zal) * 0.17 - 43.76).toFixed(2);
zal_2021 = zal_2021 > 0 ? zal_2021 : '0';
let zdrowotne = parseFloat(zal_2021) < parseFloat(podstawa_zdrow) * 0.09 ? parseFloat(zal_2021) : (parseFloat(podstawa_zdrow) * 0.09).toFixed(2);

let netAmount = (parseFloat(podstawa_zdrow) - parseFloat(zdrowotne) - parseFloat(zaliczka)).toFixed(2);
let wypadkoweValue = customGrossAmount * (wypadkoweRate/100);




const calculatedValues = {
    grossAmount: grossAmountValue,
    netAmount,
    emeryt_pr: (customGrossAmount * 0.0976).toFixed(2),
    emeryt_ub: (customGrossAmount * 0.0976).toFixed(2),
    rent_pr: (customGrossAmount * 0.065).toFixed(2),
    rent_ub: roundUpToCent(customGrossAmount * 0.015).toFixed(2),
    chorobowe: (customGrossAmount * 0.0245).toFixed(2),
    wypadkowe: wypadkoweValue.toFixed(2), // Use the calculated wypadkowe value
    FP: roundUpToCent(customGrossAmount * 0.0245).toFixed(2),
    FGSP: roundUpToCent(customGrossAmount * 0.001).toFixed(2),
    wyn_chorobowe: wynChorobowe.toFixed(2),
    podstawa_zdrow: podstawa_zdrow,
    podstawa_zaliczki: pod_zal,
    accumulatedTaxBase: newAccumulatedTaxBase,
    zaliczka,
    zal_2021,
    zdrowotne,
    allBreaks,
    ulga: employeeUlga,
    koszty:employeeKoszty,// Use employeeKoszty
    bonus,
    social_base: customGrossAmount,  // This now includes the bonus
    averageSalary: averageSalary.toFixed(2),
    workingdays: workingHours/8,
    break_zwolnienie: totalDaysZwolnienie,
    break_bezplatny: totalDaysBezplatny,
    break_nieobecnosc: totalDaysNieobecnosc,
    break_rodzicielski: totalDaysRodzicielski,
    break_ciaza: totalDaysCiaza,
    break_wychowawczy: totalDaysWychowawczy,
    working_days_zwolnienie: totalWorkingDaysZwolnienie, // Working days for zwolnienie
        working_days_ciaza: totalWorkingDaysCiaza, // Working days for ciąża
    additionalDays: additionalDaysArray.reduce((acc, val) => acc + val, 0)  // Sum of all additional days
};

return calculatedValues;
};

const Notification = ({ employeeId, onClose }) => {
return (
  <div className="notification">
    Proszę uzupełnij parametry podatkowe dla for pracownika ID: {employeeId}.Aktualnie do wyliczenia są przyjęte wartości domyślne.
    <button onClick={onClose}>Close</button>
  </div>
);
}

const calculateSalaryForAll = () => {

  

const salaryCalculationPromises = calculatedContracts.map((employee, index) => {
  
  return fetchHistoricalSalaries(employee, year, month).then(employeeWithHistoricalSalaries => {
  const healthBreak = healthBreaks?.[index] || defaultHealthBreak;
  const breaksForEmployee = additionalBreaksByEmployee[employee.employee_id] || [];
  const additionalDaysArray = breaksForEmployee.map(breakItem => breakItem.additionalDays || 0);
  const additionalBreakTypesArray = breaksForEmployee.map(breakItem => breakItem.type || '');

  const employeeProRatedGross = proRatedGrossSummary[employee.employee_id]; 
  const grossAmountValue = employeeProRatedGross ? employeeProRatedGross : employee.gross_amount;
  const employeeNotWorkedDetails = daysNotWorkedSummary[employee.employee_id] || [];
  const totalDaysNotWorked = employeeNotWorkedDetails.reduce((total, detail) => total + detail.daysNotWorked, 0);
  const bonus = employeeBonuses[employee.employee_id] || 0;
  const bonusValue = employeeBonuses[employee.employee_id] || 0;

  const allBreaks = [
    { 
        startDate: healthBreak.startDate,
        endDate: healthBreak.endDate,
        days: healthBreak.days, 
        type: healthBreak.type,
        id: healthBreak.id
    },
    ...breaksForEmployee
];
// Example: Calculate working days for all breaks of 'zwolnienie' and 'ciąża'
let workingDaysZwolnienie = 0;
let workingDaysCiaza = 0;

allBreaks.forEach(breakItem => {
  if (breakItem.type === 'zwolnienie') {
    workingDaysZwolnienie += calculateWorkingDaysForDefaultBreak(breakItem, holidays);
  } else if (breakItem.type === 'ciąża') {
    workingDaysCiaza += calculateWorkingDaysForDefaultBreak(breakItem, holidays);
  }
});

// Log dates before formatting
console.log('Dates before formatting:', allBreaks.map(breakItem => ({ startDate: breakItem.startDate, endDate: breakItem.endDate })));
// Format the dates for all breaks using formatDateForServer
allBreaks.forEach(breakItem => {
  breakItem.startDate = formatDateForServer(breakItem.startDate);
  breakItem.endDate = formatDateForServer(breakItem.endDate);
});


  console.log("Current state of employeeBonuses:", employeeBonuses);
  console.log(`Bulk calculation - Bonus for employee ${employee.employee_id}:`, bonus);
  console.log(`Bulk calculation - BonusValue for employee ${employee.employee_id}:`, bonusValue);
  console.log("Current state of employeeBonuses:", employeeBonuses);
  console.log(`Preparing to calculate salary for employee ${employee.employee_id}`);
  console.log('Koszty:', employee.koszty, 'Ulga:', employee.ulga);

  


  // Call calculateSalary function with the appropriate arguments
  console.log(`Preparing to calculate salary for employee ${employee.employee_id}`);
  const calculatedValues = calculateSalary(
    grossAmountValue, 
    healthBreak.days, 
    healthBreak.type, 
    additionalDaysArray, 
    additionalBreakTypesArray,
    workingHours,  // This needs to be defined or retrieved similarly
    totalDaysNotWorked,
    employeeProRatedGross,
    bonus, 
    bonusValue,
    wypadkoweRate,
    employee.koszty, // Pass koszty from the employee object
employee.ulga,  
allBreaks,
averageSalary,
workingDaysZwolnienie, // Now defined
    workingDaysCiaza, // Now defined
    employeeWithHistoricalSalaries.historicalSalaries, // Include historical salaries
    employee,
    employee.employee_id // Pass the employee's ID here
     // Ensure this is correctly positioned in the parameter list
  );

  console.log(`Calculated values for employee ${employee.employee_id}:`, calculatedValues);
  return { ...employee, contracts: [calculatedValues] };
});
});
// Use Promise.all to wait for all salary calculations to complete
Promise.all(salaryCalculationPromises).then(updatedContracts => {
    setCalculatedContracts(updatedContracts); // Update the state with new values
    setIsAllSalaryCalculated(true);
    console.log('Updated Contracts:', updatedContracts);
}).catch(error => {
    console.error('Error in calculating salaries for all:', error);
});
};

const recalculateSalaryWithNewAverage = (employee, grossAmountValue, daysOfBreak, breakType, additionalDaysArray, additionalBreakTypesArray, workingHours, totalDaysNotWorked, employeeProRatedGross, bonus, wypadkoweRate, koszty, ulga, allBreaks, averageSalary) => {
  // Assuming you have access to all necessary data from state or context
  const calculatedValues = calculateSalary(
    grossAmountValue, // from state or context
    daysOfBreak, // from state or context
    breakType, // from state or context
    additionalDaysArray, // from state or context
    additionalBreakTypesArray, // from state or context
    workingHours, // from state or context
    totalDaysNotWorked, // from state or context
    employeeProRatedGross, // from state or context
    bonus, // from state or context
    wypadkoweRate, // from state or context
    koszty, // from state or context
    ulga, // from state or context
    allBreaks, // from state or context
    averageSalary, // already updated from the table
    employee.employee_id, // from state or context
    employeeBonuses[employee.employee_id] || 0 // from state or context
  );

  // Update the employee's calculated contract data
  const updatedEmployees = [...calculatedContracts];
  const employeeIndex = calculatedContracts.findIndex(emp => emp.employee_id === employee.employee_id);
  if (employeeIndex !== -1) {
    updatedEmployees[employeeIndex] = { ...updatedEmployees[employeeIndex], contracts: [calculatedValues] };
    setCalculatedContracts(updatedEmployees);
  }
};

const handleCalculateSalary_1 = async (employee, index) => {
  const updatedEmployee = await fetchAllParameters(employee);
  console.log(`Updated parameters: koszty=${updatedEmployee.koszty}, ulga=${updatedEmployee.ulga}`);

  // Fetch historical salaries for the selected month and year
const employeeWithHistoricalSalaries = await fetchHistoricalSalaries(updatedEmployee, year, month);
setHistoricalSalaries(employeeWithHistoricalSalaries.historicalSalaries);

if (employeeWithHistoricalSalaries.historicalSalaries.length > 0) {
// Calculate and update the average salary
const newAverageSalary = calculateAverageForChorobowe(employeeWithHistoricalSalaries.historicalSalaries);
setAverageSalary(newAverageSalary);
setIsAverageManuallySet(false); // Reset manual adjustment flag
}

const healthBreak = healthBreaks?.[index] || defaultHealthBreak;
const daysOfBreak = healthBreak.days;
const breakType = healthBreak.type;
const employeeProRatedGross = proRatedGrossSummary[employee.employee_id]; // Retrieve pro-rated gross for the employee
const grossAmountValue = employeeProRatedGross ? employeeProRatedGross : employee.gross_amount; // Use pro-rated gross if available, otherwise use standard gross amount

// Construct the arrays here, based on the additionalBreaks structure.
// Extract the arrays for the specific employee from the additionalBreaksByEmployee structure.
const breaksForEmployee = additionalBreaksByEmployee[employee.employee_id] || [];
// Filter out breaks that are marked for deletion
const validBreaksForEmployee = breaksForEmployee.filter(breakItem => !breakItem.isDeleted);

const additionalDaysArray = breaksForEmployee.map(breakItem => breakItem.additionalDays || 0);
const additionalBreakTypesArray = breaksForEmployee.map(breakItem => breakItem.type || '');
// Extract total days not worked for this employee
const employeeNotWorkedDetails = daysNotWorkedSummary[employee.employee_id] || [];
const totalDaysNotWorked = employeeNotWorkedDetails.reduce((total, detail) => total + detail.daysNotWorked, 0);
const bonus = employeeBonuses[employee.employee_id] || 0;

const bonusValue = employeeBonuses[employee.employee_id] || 0;



const allBreaks = [
{ 
  startDate: healthBreak.startDate,
  endDate: healthBreak.endDate,
  days: healthBreak.days, 
  type: healthBreak.type,
  id:healthBreak.id
},
...breaksForEmployee
];

// Example: Calculate working days for all breaks of 'zwolnienie' and 'ciąża'
let workingDaysZwolnienie = 0;
let workingDaysCiaza = 0;

allBreaks.forEach(breakItem => {
  if (breakItem.type === 'zwolnienie') {
    workingDaysZwolnienie += calculateWorkingDaysForDefaultBreak(breakItem, holidays);
  } else if (breakItem.type === 'ciąża') {
    workingDaysCiaza += calculateWorkingDaysForDefaultBreak(breakItem, holidays);
  }
});

// Log dates before formatting
console.log('Dates before formatting:', allBreaks.map(breakItem => ({ startDate: breakItem.startDate, endDate: breakItem.endDate })));
// Format the dates for all breaks using formatDateForServer
allBreaks.forEach(breakItem => {
breakItem.startDate = formatDateForServer(breakItem.startDate);
breakItem.endDate = formatDateForServer(breakItem.endDate);
});

// Log dates after formatting
console.log('Dates after formatting:', allBreaks.map(breakItem => ({ startDate: breakItem.startDate, endDate: breakItem.endDate })));

// Add a log to check the value of wypadkoweRate before calling calculateSalary
console.log('wypadkoweRate before calling calculateSalary:', wypadkoweRate);

console.log("Individual Current state of employeeBonuses:", employeeBonuses);
console.log(`Individual calculation - Bonus for employee ${employee.employee_id}:`, bonusValue);
console.log(`Bonus for individual calculation for employee ${employee.employee_id}:`, bonus);


console.log(`Days Not Worked for Employee (from button click) ${employee.employee_id}:`, totalDaysNotWorked);
console.log(`proRatedGross (from button click) ${employee.employee_id}:`,employeeProRatedGross);
console.log(`proRatedGross for Employee ID (click) ${employee.employee_id}:`, employeeProRatedGross);
console.log(`Button clicked for employee ${employee.employee_id}`);

// Add logs to check the values before calling the function
console.log('Employee Data:', employee);
console.log('Koszty:', employee.koszty, 'Ulga:', employee.ulga);

const calculatedValues = calculateSalary(
grossAmountValue, 
daysOfBreak, 
breakType, 
additionalDaysArray,  // pass the entire array
additionalBreakTypesArray,
workingHours,  // pass the entire array
totalDaysNotWorked,
employeeProRatedGross,
bonus,
bonusValue,
wypadkoweRate,
updatedEmployee.koszty, // Use updated koszty
updatedEmployee.ulga,
allBreaks,
averageSalary, // pass the historical salaries array
workingDaysZwolnienie, // Now defined
workingDaysCiaza, // Now defined
employeeWithHistoricalSalaries.historicalSalaries, // Pass historical salaries for accumulatedTaxBase calculation
employee,
employee.employee_id,
employeeBonuses[employee.employee_id] || 0
 // Passing proRatedGross here// Pass the proRatedGross value here // Pass the proRatedGross value here // pass the total days not worked for this specific employee
);

// Update this specific employee's data in the state:
const updatedEmployees = [...calculatedContracts];
updatedEmployees[index] = { ...updatedEmployee, contracts: [calculatedValues] };
setCalculatedContracts(updatedEmployees);


console.log(`Updated employee data for ID ${employee.employee_id}:`, updatedEmployees[index]);
};  

const formatDateForServer = (dateInput) => {
  // If dateInput is a Date object, convert it to an ISO string
  if (dateInput instanceof Date) {
    dateInput = dateInput.toISOString();
  }

  // Check if dateInput is a string and not empty
  if (typeof dateInput !== 'string' || !dateInput) return null;

  // Convert dateString to a Date object using moment-timezone
  const date = moment(dateInput).tz("Europe/Warsaw").toDate();

  // Format the Date object using moment-timezone
  return moment(date).tz("Europe/Warsaw").format('YYYY-MM-DD');
};




// Prepare the data to send to the server
const employeeDataToSend = calculatedContracts.map(employee => {
// Check if contracts array exists and has at least one element
if (employee.contracts && employee.contracts.length > 0) {
  // Extract the first contract
  const firstContract = employee.contracts[0];

  // Check if allBreaks array exists in the first contract
  if (firstContract.allBreaks && firstContract.allBreaks.length > 0) {
    const transformedBreaks = firstContract.allBreaks.map(breakItem => {
      return {
          employee_id: employee.employee_id,
          break_type: breakItem.type,
          break_start_date: breakItem.startDate,
          break_end_date: breakItem.endDate,
          break_days: breakItem.days
      };
    });

    // Return the employee object with the transformed breaks data
    return { ...employee, transformedBreaks };
  }
}

// If the contracts array or allBreaks array does not exist, return the employee object as it is
return employee;
});

// Function to check if a break has been changed
// Function to check if a break has been changed
const hasBreakChanged = (originalBreak, updatedBreak) => {
  const formattedOriginalStartDate = formatDateForServer(originalBreak.startDate);
  const formattedOriginalEndDate = formatDateForServer(originalBreak.endDate);
  const formattedUpdatedStartDate = formatDateForServer(updatedBreak.startDate);
  const formattedUpdatedEndDate = formatDateForServer(updatedBreak.endDate);

  return formattedOriginalStartDate !== formattedUpdatedStartDate ||
         formattedOriginalEndDate !== formattedUpdatedEndDate ||
         originalBreak.type !== updatedBreak.type;
         // Add other comparisons if necessary
};


const prepareBreaksData = () => {
  let newBreaks = [];
  let updatedBreaks = [];
  let deletedBreakIds = [];

  calculatedContracts.forEach(employee => {
    // Process healthBreaks at the employee level for deletion
    if (employee.healthBreaks && Array.isArray(employee.healthBreaks)) {
      employee.healthBreaks.forEach(breakItem => {
        if (breakItem.isDeleted && typeof breakItem.id === 'number') {
          deletedBreakIds.push(breakItem.id);
        }
      });
    }

    // Retrieve original breaks for comparison
    const originalBreaks = employee.healthBreaks || [];

    // Process allBreaks within each contract
    if (employee.contracts && Array.isArray(employee.contracts)) {
      employee.contracts.forEach(contract => {
        if (contract.allBreaks && Array.isArray(contract.allBreaks)) {
          contract.allBreaks.forEach(breakItem => {
            const totalBreakDays = (breakItem.days || 0) + (breakItem.additionalDays || 0);
            if (!breakItem.startDate || !breakItem.endDate || breakItem.type === 'brak') return;

            if (typeof breakItem.id === 'number' && !breakItem.isDeleted) {
              // Find the corresponding original break
              const originalBreak = originalBreaks.find(ob => ob.id === breakItem.id);

              // Add to updatedBreaks only if there's a change
              if (originalBreak && hasBreakChanged(originalBreak, breakItem)) {
                updatedBreaks.push({
                  id: breakItem.id,
                  employee_id: employee.employee_id,
                  break_type: breakItem.type,
                  break_start_date: formatDateForServer(breakItem.startDate),
                  break_end_date: formatDateForServer(breakItem.endDate),
                  break_days: totalBreakDays
                });
              }
            } else if (typeof breakItem.id !== 'number') {
              // Handling new breaks
              newBreaks.push({
                employee_id: employee.employee_id,
                break_type: breakItem.type,
                break_start_date: formatDateForServer(breakItem.startDate),
                break_end_date: formatDateForServer(breakItem.endDate),
                break_days: totalBreakDays
              });
            }
          });
        }
      });
    }
  });

  return { newBreaks, updatedBreaks, deletedBreakIds };
};





const handleSaveBreaksData = async () => {
  const { newBreaks, updatedBreaks, deletedBreakIds } = prepareBreaksData();
  console.log("New Breaks to Save:", newBreaks);
  console.log("Breaks to Update:", updatedBreaks);
  console.log("Break IDs to Delete:", deletedBreakIds);

  let employeesWithIncompleteBreaks = [];
  let isAnyOperationPerformed = false;

  calculatedContracts.forEach(employee => {
    // Check if the employee has contracts and the first contract has allBreaks
    if (employee.contracts && employee.contracts.length > 0 && employee.contracts[0].allBreaks && Array.isArray(employee.contracts[0].allBreaks)) {
      const hasIncompleteBreaks = employee.contracts[0].allBreaks.some(breakItem => 
        (breakItem.startDate || breakItem.endDate) && (!breakItem.type || breakItem.type === 'brak'));

      if (hasIncompleteBreaks) {
        employeesWithIncompleteBreaks.push(`${employee.name} ${employee.surname} (ID: ${employee.employee_id})`);
      }
    }
  });

if (employeesWithIncompleteBreaks.length > 0) {
  // Convert the array to a comma-separated string
  const employeeDetails = employeesWithIncompleteBreaks.join(', ');
  toast.warn(`Please select a valid break type for all breaks of the following employees: ${employeeDetails}`);
  return;
}
// Set areBreaksSaved to true here, after the check for incomplete breaks
setAreBreaksSaved(true);


// Proceed with sending data only if there's something to send
// Saving New Breaks
if (newBreaks.length > 0) { 
  isAnyOperationPerformed = true;
  try {
    const response = await axiosInstance.post('http://localhost:3001/api/save-health-breaks', {
       breaksData: newBreaks }, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`, // Use the access token
          'X-Schema-Name': user.schemaName, // Send the schema name as a header
        }
      });

      

    if (response.status === 200) {
      console.log("Breaks data saved successfully.", response.data);
      toast.success("Breaks data saved successfully.");
    } else {
      console.error("Failed to save breaks data. Response status:", response.status);
      toast.error("Failed to save breaks data.");
    }
  } catch (error) {
    console.error("Error saving breaks data:", error);
    toast.error("Error occurred while saving breaks data.");
  }
} else {
  console.log("No any new valid breaks data to save.");
  toast.info("No any new valid breaks data to save.");
}
if (updatedBreaks.length > 0) {
  isAnyOperationPerformed = true;
  try {
    const responseUpdate = await axiosInstance.put('http://localhost:3001/api/update-health-breaks', { breaksData: updatedBreaks }, {
      headers: {
        'Authorization': `Bearer ${user.access_token}`, // Use the access token
        'X-Schema-Name': user.schemaName, // Send the schema name as a header
      }
    });
    if (responseUpdate.status === 200 && responseUpdate.data.updatedBreaksData.length > 0) {
      console.log("Breaks updated successfully.");
      toast.success("Breaks updated successfully.");
    } else {
      console.log("No new updates were made to breaks.");
      toast.info("No new updates were made to breaks.");
    }
  } catch (error) {
    console.error("Error during breaks update:", error);
    toast.error("Error occurred during breaks update.");
  }
} else {
  console.log("No breaks to update.");
  toast.info("No breaks to update.");
}



if (deletedBreakIds.length > 0) {
  isAnyOperationPerformed = true;
  try {
    const responseDelete = await axiosInstance.delete('http://localhost:3001/api/delete-health-breaks', { data: { breakIds: deletedBreakIds } }, {
      headers: {
        'Authorization': `Bearer ${user.access_token}`, // Use the access token
        'X-Schema-Name': user.schemaName, // Send the schema name as a header
      }
    });
    if (responseDelete.status === 200) {
      console.log("Breaks deleted successfully.");
      toast.success("Breaks deleted successfully.");
      // Additional logic if needed post-deletion
    } else {
      console.error("Failed to delete breaks. Response status:", responseDelete.status);
      toast.error("Failed to delete breaks.");
    }
  } catch (error) {
    console.error("Error during break deletion:", error);
    toast.error("Error occurred during break deletion.");
  }
} else {
  console.log("No any breaks to delete.");
  toast.info("No any breaks to delete.");
}
if (isAnyOperationPerformed) {
  setAreBreaksSaved(true);
} else {
  console.log("No break operations to perform.");
  toast.info("No break operations to perform.");
}
};

const handleSaveSalaryData = async () => {
  console.log("Attempting to save salary data. Are breaks saved:", areBreaksSaved);
  if (!isAllSalaryCalculated) {
    toast.warn("Please calculate salary for all employees before saving.");
    return;
  }
  // If breaks are not saved, prevent proceeding
  if (!areBreaksSaved) {
    toast.warn("Please save or discard changes to health breaks before saving salary data.");
    return;
  }
// Check if the salary date is not set
if (!salaryDate) {
  toast.warn("Please pick a salary date before saving.");
  return; // Stop the function execution
}
const newSalaryData = [];
  const salaryDataToUpdate = [];

calculatedContracts.forEach(employee => {
  // Use the first contract for the employee, assuming it's the most relevant
  const contract = employee.contracts && employee.contracts[0];

  if (contract) {
    const salary = {
      employee_id: employee.employee_id,
      gross_total: parseFloat(contract.grossAmount),
      social_base: parseFloat(contract.social_base), // Use the calculated social_base
      emeryt_ub: parseFloat(contract.emeryt_ub),
      emeryt_pr: parseFloat(contract.emeryt_pr),
      rent_ub: parseFloat(contract.rent_ub),
      rent_pr: parseFloat(contract.rent_pr),
      chorobowe: parseFloat(contract.chorobowe),
      wypadkowe: parseFloat(contract.wypadkowe),
      fp: parseFloat(contract.FP),
      fgsp: parseFloat(contract.FGSP),
      health_base: parseFloat(contract.podstawa_zdrow),
      heath_amount: parseFloat(contract.zdrowotne),
      tax_base: parseFloat(contract.podstawa_zaliczki),
      accumulatedTaxBase: parseFloat(contract.accumulatedTaxBase),
      tax: parseFloat(contract.zaliczka),
      ulga: parseFloat(contract.ulga),
      koszty: parseFloat(contract.koszty),
      zal_2021: parseFloat(contract.zal_2021),
      net_amount: parseFloat(contract.netAmount),
      bonus: parseFloat(contract.bonus),
      wyn_chorobowe: parseFloat(contract.wyn_chorobowe),
      chorobowe_base: parseFloat(contract.wyn_chorobowe) > 0 ? parseFloat(contract.averageSalary) : null, // Conditionally assign chorobowe_base
      salary_month: month, // From state
      salary_year: year, // From state
      salary_date: salaryDate, // From state
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      workingdays: contract.workingdays,
      break_zwolnienie: contract.break_zwolnienie,
      break_bezplatny: contract.break_bezplatny,
      break_nieobecnosc: contract.break_nieobecnosc,
      break_rodzicielski: contract.break_rodzicielski,
      break_ciaza: contract.break_ciaza,
      break_wychowawczy: contract.break_wychowawczy,
      break_zwolnienie_wd: contract.working_days_zwolnienie,
      break_ciaza_wd: contract.working_days_ciaza,
    };

    // Check if this is a new entry or an update
    if (employee.salary_id) { // Assuming salary_id exists for updates
      salaryDataToUpdate.push({ ...salary, salary_id: employee.salary_id });
    } else {
      newSalaryData.push(salary);
    }
  }
});

 // Update existing salary records
 if (salaryDataToUpdate.length > 0) {
  try {
    await axiosInstance.put('http://localhost:3001/api/update-salary-data', salaryDataToUpdate, {
      headers: {
        'Authorization': `Bearer ${user.access_token}`, // Use the access token
        'X-Schema-Name': user.schemaName, // Send the schema name as a header
      }
    });
    console.log('Salary data updated successfully!');
    toast.success("Salary data updated successfully!");
  } catch (error) {
    console.error('Error updating salary data:', error);
    toast.error("Error occurred while updating salary data.");
  }
}

// Save new salary data
  if (newSalaryData.length > 0) {
    try {
      await axiosInstance.post('http://localhost:3001/api/save-salary-data', newSalaryData, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`, // Use the access token
          'X-Schema-Name': user.schemaName, // Send the schema name as a header
        }
      });
      console.log('Salary data saved successfully!');
      toast.success("Salary data saved successfully!");
    } catch (error) {
      console.error('Error saving salary data:', error);
      toast.error("Error occurred while saving salary data.");
    }
  }

  setIsSalarySaved(true); // Update the state variable
};






const renderEmployeeTable = () => {
  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (validContracts.length === 0) {
    return <div>No employees with valid contracts for the selected month and year.</div>;
  }

return (
  <div className="salary-selection-page bg-gray-100 p-4 overflow-x-auto">
    <h2 className="text-lg font-bold mb-4">Lista płac za {month} / {year}</h2>
    {renderHistoricalSalariesTable()}
    <div className="my-4 flex flex-col md:flex-row gap-4 items-end">
     <div>
     <p><label htmlFor="salaryDate" className="block text-sm font-medium text-gray-700">Salary Date:</label></p>
     <p><input
      type="date"
      id="salaryDate"
      value={salaryDate}
      onChange={(e) => setSalaryDate(e.target.value)}
      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
    />
    </p>
    <p></p>
    </div>
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded focus:outline-none focus:shadow-outline" onClick={calculateSalaryForAll}>Calculate Salary for All</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded focus:outline-none focus:shadow-outline" onClick={handleSaveBreaksData} disabled={areBreaksSaved}>Save Breaks Data</button>
        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-1 rounded focus:outline-none focus:shadow-outline" onClick={handleSaveSalaryData} disabled={isSalarySaved}>
          {isEditMode ? "Update Salary" : "Save Salary Data"}
        </button>
        <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-1 rounded focus:outline-none focus:shadow-outline" onClick={handleBack}>
          {isEditMode ? "Back to Salary List" :"Powrót" }
        </button>
</div>

    {notification.show && 
      <Notification 
        employeeId={notification.employeeId}
        onClose={() => setNotification({ show: false, employeeId: null })}
      />
    } 

<div className="overflow-x-auto">
<table className=" min-w-full">
      <thead className="bg-gray-50">
      <tr>
      <th className="px-1 py-1 text-xs">ID</th>
        <th className="px-1 py-1 text-xs">Name</th>
        <th className="px-1 py-1 text-xs">Surname</th>
        <th className="px-1 py-1 text-xs">Wyn.zasadnicze</th>
        <th className="px-1 py-1 text-xs">Premia</th>
        <th className="px-1 py-1 text-xs">Start Date</th>
        
        <th className="px-1 py-1 text-xs">Days</th>
        <th className="px-1 py-1 text-xs">Health Break Type</th>
        <th className="whitespace-nowrap">
        {/* Combine Start and End Date in one cell with proper labeling */}
        <div className="flex flex-col">
        <th className="px-1 py-1 text-xs">Podstawa</th>
        <th className="px-1 py-1 text-xs">ub. społ.</th>
            </div>
          </th>
        
    <th className="px-1 py-1 text-xs">wyn</th>
          <th className="px-1 py-1 text-xs">em.pr</th>
          <th className="px-1 py-1 text-xs">rent.pr</th>
          <th className="px-1 py-1 text-xs">chorobowe</th>
          <th className="px-1 py-1 text-xs">FP</th>
          <th className="px-1 py-1 text-xs">Podst.zdrow.</th>
          <th className="px-1 py-1 text-xs">Podst.zaliczki</th>
          <th className="px-1 py-1 text-xs">Koszty</th>
          <th className="px-1 py-1 text-xs">Netto</th>
          </tr>
          <tr>
          <th className="px-1 py-1 text-xs"></th>
          <th className="px-1 py-1 text-xs"></th>
          <th className="px-1 py-1 text-xs"></th>
          <th className="px-1 py-1 text-xs"></th>
          <th className="px-1 py-1 text-xs"></th>
          <th className="px-1 py-1 text-xs">End Date</th>
          <th className="px-1 py-1 text-xs"></th>
          <th className="px-1 py-1 text-xs"></th>
          <th className="px-1 py-1 text-xs">ub. społ.</th>
          <th className="px-1 py-1 text-xs">chorobowe</th>
          <th className="px-1 py-1 text-xs">em.ub</th>
          <th className="px-1 py-1 text-xs">rent.ub</th>
          <th className="px-1 py-1 text-xs">wypadkowe</th>
    <th className="px-1 py-1 text-xs">FGŚP</th>
          <th className="px-1 py-1 text-xs">ub. zdrowotne</th>
    <th className="px-1 py-1 text-xs">zaliczka</th>
          <th className="px-1 py-1 text-xs">ulga</th>
          <th className="px-1 py-1 text-xs">Netto</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
    {calculatedContracts.map((employee, index) => {
      console.log('Employee object:', employee); 
      // Debug log to check if employee has parameters
  console.log(`Employee ${employee.employee_id} has parameters:`, parameters);  

  // Debug logs for specific parameters (koszty and ulga)
  console.log(`Koszty for Employee ${employee.employee_id}:`, employee.koszty);
  console.log(`Ulga for Employee ${employee.employee_id}:`, employee.ulga);
 

  const healthBreak = healthBreaks?.[index] || defaultHealthBreak;
  // Suppose you have a date string from the backend
const dateStringFromBackend = employee.startDate; // Replace with your actual field

// Convert the ISO date string to a local date using moment-timezone
const localDate = moment(dateStringFromBackend).tz("Europe/Warsaw").toDate();
      console.log(`Health break for employee ${employee.employee_id}:`, healthBreaks);
      console.log("healthBreak.startDate:", healthBreak.startDate);
      console.log("Parsed healthBreak.startDate:", healthBreak.startDate ? parseISO(healthBreak.startDate) : null);
      console.log("healthBreak.endDate:", healthBreak.endDate);
      console.log("Parsed healthBreak.endDate:", healthBreak.endDate ? parseISO(healthBreak.endDate) : null);
      // Logs for debugging
  console.log(`Employee ID: ${employee.employee_id}`);
  console.log("Original Start Date:", healthBreak.startDate);
      console.log("Processed Start Date for Display:", healthBreak.startDate 
            ? moment.utc(healthBreak.startDate).set({ hour: 12 }).tz("Europe/Warsaw").toDate()
            : null);
      
      const additionalBreaks = additionalBreaksByEmployee[employee.employee_id] || [];
      

                      return (
                        <React.Fragment key={employee.employee_id || index} className="hover:bg-gray-100">
                          <tr>
                              <td className="px-1 py-1 text-xs w-16">{employee.employee_id}</td>
                              <td  className="text-xs p-1 rounded">{employee.name}</td>
                              <td  className="text-xs p-1 rounded">{employee.surname}</td>
                              <td  className="text-xs p-1 rounded">{employee.gross_amount}</td>
                              <td  className="text-xs p-1 rounded"><input
type="number"
className="w-12 p-1 text-xs border-gray-300 rounded-md" // Constrain the width with w-12 and reduce padding with p-1
value={employeeBonuses[employee.employee_id] || 0}
onChange={(e) => handleBonusChange(e.target.value, employee.employee_id)}
/></td>
                              <td  className="text-xs p-1 rounded">
                              <DatePicker
  key={`start-date-picker-${index}`} // Unique key for each DatePicker
  selected={healthBreak.startDate 
            ? moment.utc(healthBreak.startDate).tz("Europe/Warsaw").toDate()
            : null}
  selectsStart
  startDate={healthBreak.startDate 
            ? moment.utc(healthBreak.startDate).tz("Europe/Warsaw").toDate()
            : null}
  endDate={healthBreak.endDate 
            ? moment.utc(healthBreak.endDate).tz("Europe/Warsaw").toDate()
            : null}
  onChange={(date) => handleHealthBreakStartDateChange(date, index)}
  dateFormat="yyyy/MM/dd"
/>




          </td>
          <td  className="text-xs p-1 rounded">{healthBreak.days}</td>

          <td td className="p-1">
          <div className="flex items-center space-x-1">
              <select
              className="text-xs p-1 rounded border-gray-300" // Added border color
                  value={healthBreak?.type || ''}
                  onChange={(e) => handleHealthBreakTypeChange(e, index)}
              >
                 
                  <option value="brak">Brak</option>
                  <option value="zwolnienie">Zwolnienie</option>
                  <option value="ciąża">Zwol. 100% ciąża</option>
                  <option value="bezpłatny">Bezpłatny</option>
                  <option value="nieobecność">Nieobecność</option>
                  <option value="wychowawczy">wychowawczy</option>
                  <option value="rodzicielski">rodzicielski</option>
                  <option value="zasiłek">zasiłek ZUS</option>
                  <option value="urlop">urlop wypoczynkowy</option>
              </select>
              
              
  </div>
</td>

      <td  className="text-xs p-1 rounded">{employee.contracts?.[0]?.social_base}</td> 
                    
      <td  className="text-xs p-1 rounded">{employee.contracts?.[0]?.wyn_chorobowe}</td>                        
      <td  className="text-xs p-1 rounded">{employee.contracts?.[0]?.emeryt_pr}</td>
      <td  className="text-xs p-1 rounded">{employee.contracts?.[0]?.rent_pr}</td>
      <td  className="text-xs p-1 rounded">{employee.contracts?.[0]?.chorobowe}</td>
      <td  className="text-xs p-1 rounded">{employee.contracts?.[0]?.FP}</td>
  
      <td  className="text-xs p-1 rounded">{employee.contracts?.[0]?.podstawa_zdrow}</td>
      <td  className="text-xs p-1 rounded">{employee.contracts?.[0]?.podstawa_zaliczki}</td>
      <td  className="text-xs p-1 rounded">{employee.koszty !== undefined ? employee.koszty : 250}</td>
      <td  className="text-xs p-1 rounded">{employee.contracts?.[0]?.netAmount}</td>
  </tr>
  <tr>
  <td  className="text-xs p-1 rounded"></td>
            <td  className="text-xs p-1 rounded"></td>
            <td  className="text-xs p-1 rounded"></td>
            <td  className="text-xs p-1 rounded"></td>
            <td  className="text-xs p-1 rounded"></td>
            <td
              className="text-xs p-1 rounded">
            <DatePicker
  selected={healthBreak.endDate 
            ? moment.utc(healthBreak.endDate).tz("Europe/Warsaw").toDate()
            : null}
  selectsEnd
  startDate={healthBreak.startDate 
            ? moment.utc(healthBreak.startDate).tz("Europe/Warsaw").toDate()
            : null}
  endDate={healthBreak.endDate 
            ? moment.utc(healthBreak.endDate).tz("Europe/Warsaw").toDate()
            : null}
  onChange={(date) => handleHealthBreakEndDateChange(date, index)}
  dateFormat="yyyy/MM/dd"
/>

            </td>
            <td  className="text-xs p-1 rounded"></td>
            <td>
              <div className="flex items-center space-x-1">
              <button
              className="p-1 rounded text-green-500 hover:text-green-700"
              onClick={() => addAdditionalBreak(employee.employee_id)}title="Add Break" // Tooltip text
              >
                <FontAwesomeIcon icon={faPlusCircle} /> 
                <i className="fas fa-plus-circle"></i> {/* Icon from FontAwesome */}
              </button>
              <button
              className="p-1 rounded text-red-500 hover:text-red-700"
              onClick={() => deletePrimaryBreak(employee.employee_id)}title="Delete Primary Break" // Tooltip text
    >
      <FontAwesomeIcon icon={faTrashAlt} />
      <i className="fas fa-trash-alt"></i> {/* Icon from FontAwesome */}
    </button>
    <button
      className="p-1 rounded text-blue-500 hover:text-blue-700"
      onClick={resetBreakFields}
      title="Clear Break Fields" // Tooltip text
    >
      <FontAwesomeIcon icon={faUndoAlt} /> 
      <i className="fas fa-undo-alt"></i> {/* Icon from FontAwesome */}
    </button>
  </div>
</td>
<td  className="text-xs p-1 rounded"></td>
            
            
<td  className="text-xs p-1 rounded"></td>
  <td  className="text-xs p-1 rounded">{employee.contracts?.[0]?.emeryt_ub}</td>
  <td  className="text-xs p-1 rounded">{employee.contracts?.[0]?.rent_ub}</td>
  <td  className="text-xs p-1 rounded">{employee.contracts?.[0]?.wypadkowe}</td>
  <td  className="text-xs p-1 rounded">{employee.contracts?.[0]?.FGSP}</td>
  <td  className="text-xs p-1 rounded">{employee.contracts?.[0]?.zdrowotne}</td>
  <td  className="text-xs p-1 rounded">{employee.contracts?.[0]?.zaliczka} ({employee.contracts?.[0]?.zal_2021})</td>
  <td  className="text-xs p-1 rounded">{employee.ulga !== undefined ? employee.ulga : 300}</td>
  <td  className="text-xs p-1 rounded">{employee.contracts?.[0]?.netAmount}</td>
                              </tr>
                              
                              
                              {(additionalBreaksByEmployee[employee.employee_id] || []).map((breakItem, breakIndex) => (
                                console.log(`Employee ID ${employee.employee_id} - Additional Break ${breakIndex} startDate:`, breakItem.startDate),
                                console.log(`Employee ID ${employee.employee_id} - Additional Break ${breakIndex} Parsed startDate:`, breakItem.startDate ? parseISO(breakItem.startDate) : null),
                               
              <tr key={`additional-${index}-${breakIndex}`}>
                  <td 
                  className="text-xs p-1 rounded"
                  colSpan={27}> {/* You can adjust colSpan according to the number of columns you have */}
                      <React.Fragment>
                          <td>
                          <DatePicker
  selected={breakItem.startDate 
            ? moment.utc(breakItem.startDate).tz("Europe/Warsaw").toDate()
            : null}
  onChange={(date) => handleAdditionalBreakStartDateChange(date, employee.employee_id, breakIndex)}
  dateFormat="yyyy/MM/dd"
/>


</td>
<td>
<DatePicker
  selected={breakItem.endDate 
            ? moment.utc(breakItem.endDate).tz("Europe/Warsaw").toDate()
            : null}
  selectsEnd
  startDate={breakItem.startDate 
            ? moment.utc(breakItem.startDate).tz("Europe/Warsaw").toDate()
            : null}
  endDate={breakItem.endDate 
            ? moment.utc(breakItem.endDate).tz("Europe/Warsaw").toDate()
            : null}
  onChange={(date) => handleAdditionalBreakEndDateChange(date, employee.employee_id, breakIndex)}
  dateFormat="yyyy/MM/dd"
/>



                          </td>
                          
                          <td>{breakItem.additionalDays}</td>

                          <td colSpan="4">
                              <select
                                  value={breakItem.type}
                                  onChange={(e) => handleAdditionalBreakTypeChange(e, employee.employee_id, breakIndex)}
                              >
                                  <option value="">Choose break type</option>
                                  <option value="zwolnienie">Zwolnienie</option>
                                  <option value="ciąża">Zwolnienie 100% ciąża</option>
                                  <option value="bezpłatny">Bezpłatny</option>
                                  <option value="nieobecność">Nieobecność</option>
                                  <option value="wychowawczy">wychowawczy</option>
                                  <option value="rodzicielski">rodzicielski</option>
                                  <option value="zasiłek">zasiłek ZUS</option>
                                  <option value="urlop">urlop wypoczynkowy</option>
                              </select>
                              
                              <button
                              className="p-1 rounded text-red-500 hover:text-red-700"
                              onClick={() => deleteAdditionalBreak(employee.employee_id, breakIndex)}
                                title="Delete Primary Break" // Tooltip text
    >
      <FontAwesomeIcon icon={faTrashAlt} />
      <i className="fas fa-trash-alt"></i> {/* Icon from FontAwesome */}
    </button>

                          </td>
                          
                      </React.Fragment>
                  </td>
              </tr>
              
    ))}
    
     <td className="text-xs p-1 rounded">
     {showRecalculateButton && (
                  <button
                    onClick={() => handleCalculateSalary_1(employee, index)}
                    className="mr-2 p-1 rounded text-xs"
                  >
                    Pobierz dane z tabeli {employee.name}
                  </button>
                )}
                <button
          className="p-1 rounded text-xs"
          onClick={async () => {
      const updatedEmployee = await fetchAllParameters(employee);
      console.log(`Updated parameters: koszty=${updatedEmployee.koszty}, ulga=${updatedEmployee.ulga}`);

       // Fetch historical salaries for the selected month and year
    const employeeWithHistoricalSalaries = await fetchHistoricalSalaries(updatedEmployee, year, month);

      // Fetch historical salaries for the selected month and year
  // Only fetch historical salaries and recalculate the average if it has NOT been manually set
  if (!isAverageManuallySet) {
    const employeeWithHistoricalSalaries = await fetchHistoricalSalaries(updatedEmployee, year, month);
    setHistoricalSalaries(employeeWithHistoricalSalaries.historicalSalaries);

    if (employeeWithHistoricalSalaries.historicalSalaries.length > 0) {
        const newAverageSalary = calculateAverageForChorobowe(employeeWithHistoricalSalaries.historicalSalaries);
        setAverageSalary(newAverageSalary);
    }
}
    
  const daysOfBreak = healthBreak.days;
  const breakType = healthBreak.type;
  const employeeProRatedGross = proRatedGrossSummary[employee.employee_id]; // Retrieve pro-rated gross for the employee
const grossAmountValue = employeeProRatedGross ? employeeProRatedGross : employee.gross_amount; // Use pro-rated gross if available, otherwise use standard gross amount
  
  // Construct the arrays here, based on the additionalBreaks structure.
   // Extract the arrays for the specific employee from the additionalBreaksByEmployee structure.
   const breaksForEmployee = additionalBreaksByEmployee[employee.employee_id] || [];
   // Filter out breaks that are marked for deletion
  const validBreaksForEmployee = breaksForEmployee.filter(breakItem => !breakItem.isDeleted);

   const additionalDaysArray = breaksForEmployee.map(breakItem => breakItem.additionalDays || 0);
   const additionalBreakTypesArray = breaksForEmployee.map(breakItem => breakItem.type || '');
   // Extract total days not worked for this employee
const employeeNotWorkedDetails = daysNotWorkedSummary[employee.employee_id] || [];
const totalDaysNotWorked = employeeNotWorkedDetails.reduce((total, detail) => total + detail.daysNotWorked, 0);
const bonus = employeeBonuses[employee.employee_id] || 0;

const bonusValue = employeeBonuses[employee.employee_id] || 0;

 

const allBreaks = [
  { 
      startDate: healthBreak.startDate,
      endDate: healthBreak.endDate,
      days: healthBreak.days, 
      type: healthBreak.type,
      id:healthBreak.id
  },
  ...breaksForEmployee
];

// Example: Calculate working days for all breaks of 'zwolnienie' and 'ciąża'
let workingDaysZwolnienie = 0;
let workingDaysCiaza = 0;

allBreaks.forEach(breakItem => {
  if (breakItem.type === 'zwolnienie') {
    workingDaysZwolnienie += calculateWorkingDaysForDefaultBreak(breakItem, holidays);
  } else if (breakItem.type === 'ciąża') {
    workingDaysCiaza += calculateWorkingDaysForDefaultBreak(breakItem, holidays);
  }
});
// Log dates before formatting
console.log('Dates before formatting:', allBreaks.map(breakItem => ({ startDate: breakItem.startDate, endDate: breakItem.endDate })));
// Format the dates for all breaks using formatDateForServer
allBreaks.forEach(breakItem => {
  breakItem.startDate = formatDateForServer(breakItem.startDate);
  breakItem.endDate = formatDateForServer(breakItem.endDate);
});

// Log dates after formatting
console.log('Dates after formatting:', allBreaks.map(breakItem => ({ startDate: breakItem.startDate, endDate: breakItem.endDate })));

// Add a log to check the value of wypadkoweRate before calling calculateSalary
console.log('wypadkoweRate before calling calculateSalary:', wypadkoweRate);

console.log("Individual Current state of employeeBonuses:", employeeBonuses);
console.log(`Individual calculation - Bonus for employee ${employee.employee_id}:`, bonusValue);
console.log(`Bonus for individual calculation for employee ${employee.employee_id}:`, bonus);


console.log(`Days Not Worked for Employee (from button click) ${employee.employee_id}:`, totalDaysNotWorked);
console.log(`proRatedGross (from button click) ${employee.employee_id}:`,employeeProRatedGross);
console.log(`proRatedGross for Employee ID (click) ${employee.employee_id}:`, employeeProRatedGross);
console.log(`Button clicked for employee ${employee.employee_id}`);

// Add logs to check the values before calling the function
console.log('Employee Data:', employee);
console.log('Koszty:', employee.koszty, 'Ulga:', employee.ulga);


 // Wait for the state to update before calculating salary
 setTimeout(() => {
  const calculatedValues = calculateSalary(
    grossAmountValue, 
    daysOfBreak, 
    breakType, 
    additionalDaysArray,  // pass the entire array
    additionalBreakTypesArray,
    workingHours,  // pass the entire array
    totalDaysNotWorked,
    employeeProRatedGross,
    bonus,
    bonusValue,
    wypadkoweRate,
    updatedEmployee.koszty, // Use updated koszty
    updatedEmployee.ulga,
    allBreaks,
    averageSalary, // pass the historical salaries array
    workingDaysZwolnienie, // Now defined
    workingDaysCiaza, // Now defined
    employeeWithHistoricalSalaries.historicalSalaries, // Pass historical salaries for accumulatedTaxBase calculation
    employee,
    employee.employee_id,
    employeeBonuses[employee.employee_id] || 0
     // Passing proRatedGross here// Pass the proRatedGross value here // Pass the proRatedGross value here // pass the total days not worked for this specific employee
  );
  
  // Update this specific employee's data in the state:
  const updatedEmployees = [...calculatedContracts];
  updatedEmployees[index] = { ...updatedEmployee, contracts: [calculatedValues] };
  setCalculatedContracts(updatedEmployees);
  
  // Perform the 33-day limit check after updating the state
  const currentYear = new Date().getFullYear();
  const currentContract = calculatedValues; // Assuming this contains the current month's break data

  // Call the function to adjust breaks and categorize excess days
  adjustBreakDaysAndCategorizeExcess(
      employeeWithHistoricalSalaries.historicalSalaries,
      currentContract,
      currentYear,
      message => toast.warn(message)
  );

  console.log('33-day limit check performed after updating state.');

   


  console.log(`Updated employee data for ID ${employee.employee_id}:`, updatedEmployees[index]);
}, 0);

}}>
  Przelicz wynagrodzenie
  
</button>

</td>

            






          
          
      </React.Fragment>
                              )
})}
    </tbody>
  </table>
  
  </div>
  </div>



  
  
);
};



return (
  <div className="min-h-screen bg-gray-100 p-4">
    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold mb-4 text-center"></h1>
    {!isEditMode && (
       <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col gap-4">
       <div className="mb-4">
       <label className="block text-gray-700 text-sm font-bold mb-2">
          Month:
          <select 
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={month} onChange={handleMonthChange}>
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
          Year:
          <select
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={year} onChange={handleYearChange}>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        </div>
        <div className="flex items-center justify-between">
        <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={fetchValidContracts}>Fetch Valid Contracts</button>
        <button
        className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
        onClick={handleBack}>Back to Salary List</button>
      </div>
      </div>
    )}
    <div className="employee-list-container bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {renderEmployeeTable()}</div>
  </div>
  </div>
);
}
export default SalarySelectionPage;