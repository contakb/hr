  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import DatePicker from 'react-datepicker'; // Import DatePicker
  import 'react-datepicker/dist/react-datepicker.css'; // Import styles

  function calculateDaysNotWorked(workingDayCount, totalWorkingDaysInMonth) {
    return Math.max(0, totalWorkingDaysInMonth - workingDayCount);
  }

  function SalarySelectionPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [validContracts, setValidContracts] = useState([]);
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


const defaultHealthBreak = {
  startDate: null,
  endDate: null,
  days: 0,
  type: ''
};


  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:3001/employees');
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
    console.log("Fetching valid contracts...");

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    
    // Create a date object pointing to the first day of the following month, then subtract one day to get the last day of the selected month
    const endOfMonth = new Date(year, month, 0); // Month is 0-indexed in JS Date, so month 2 is March, hence month 0 is January

    const endDate = `${year}-${String(month).padStart(2, '0')}-${endOfMonth.getDate()}`;

    console.log("Dates:", startDate, endDate);

    try {
        console.log("About to make axios request...");

        const response = await axios.post('http://localhost:3001/api/valid-employees', {
            startDate,
            endDate,
        });

        console.log("Response received:", response.data);
        
        const employeesData = response.data.employees;
        setValidContracts(employeesData);
        setCalculatedContracts(employeesData); // Set the same fetched data to calculatedContracts

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




function getWorkingDayCountForContract(employeeId, fromDate, toDate) {
  const employeeDetails = daysNotWorkedSummary[employeeId] || [];
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
    const newProRatedGrossSummary = validContracts.reduce((acc, employee) => {
      if (employee.contract_details && employee.contract_details.length > 1) {
        const transformedEmployee = {
          ...employee,
          details: employee.contract_details.map(contract => ({
            ...contract,
            workingDayCount: getWorkingDayCountForContract(employee.employee_id, contract.contract_from_date, contract.contract_to_date)
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

useEffect(() => {
  console.log("Pro Rated Gross Summary:", proRatedGrossSummary);
}, [proRatedGrossSummary]);




















  
  
  
  



// Define the handleHealthBreakStartDateChange function
const handleHealthBreakStartDateChange = (date, index) => {
  const updatedBreaks = [...healthBreaks];
  updatedBreaks[index] = {
    ...updatedBreaks[index],
    startDate: date,
  };
  setHealthBreaks(updatedBreaks);

  // Calculate the number of days and update the state
  calculateDays(index, updatedBreaks);
};

// Define the handleHealthBreakEndDateChange function
const handleHealthBreakEndDateChange = (date, index) => {
  const updatedBreaks = [...healthBreaks];
  updatedBreaks[index] = {
    ...updatedBreaks[index],
    endDate: date,
  };
  setHealthBreaks(updatedBreaks);

  // Calculate the number of days and update the state
  calculateDays(index, updatedBreaks);
};

// Function to calculate the number of days between start and end dates and update the state
const calculateDays = (index, updatedBreaks) => {
  const startDate = updatedBreaks[index].startDate;
  const endDate = updatedBreaks[index].endDate;

  if (startDate && endDate) {
    const startDateWithoutTime = new Date(startDate);
    startDateWithoutTime.setHours(0, 0, 0, 0);

    const endDateWithoutTime = new Date(endDate);
    endDateWithoutTime.setHours(0, 0, 0, 0);

    // Calculate the difference in milliseconds
    const timeDifference = endDateWithoutTime.getTime() - startDateWithoutTime.getTime();

    // Calculate the number of days, considering partial days
    const daysDiff = timeDifference / (1000 * 60 * 60 * 24) + 1;

    updatedBreaks[index].days = daysDiff;
  } else {
    updatedBreaks[index].days = 0;
  }

  setHealthBreaks(updatedBreaks);
};



// Define the handleHealthBreakTypeChange function
const handleHealthBreakTypeChange = (e, index) => {
  const updatedBreaks = [...healthBreaks];
  updatedBreaks[index] = {
    ...updatedBreaks[index],
    type: e.target.value,
  };
  setHealthBreaks(updatedBreaks);
};

// Define the handleAdditionalBreakStartDateChange function
const handleAdditionalBreakStartDateChange = (date, employeeId, breakIndex) => {
  const breaksForEmployee = [...(additionalBreaksByEmployee[employeeId] || [])];
  breaksForEmployee[breakIndex].startDate = date;
  setAdditionalBreaksByEmployee({ ...additionalBreaksByEmployee, [employeeId]: breaksForEmployee });

  // Calculate the number of days and update the state
  calculateAdditionalDays(employeeId, breakIndex, breaksForEmployee);
};


// Define the handleAdditionalBreakEndDateChange function
const handleAdditionalBreakEndDateChange = (date, employeeId, breakIndex) => {
  const breaksForEmployee = [...(additionalBreaksByEmployee[employeeId] || [])];
  breaksForEmployee[breakIndex].endDate = date;
  setAdditionalBreaksByEmployee({ ...additionalBreaksByEmployee, [employeeId]: breaksForEmployee });

  // Calculate the number of days and update the state
  calculateAdditionalDays(employeeId, breakIndex, breaksForEmployee);
};


// Function to calculate the number of days between start and end dates for additional breaks and update the state
const calculateAdditionalDays = (employeeId, breakIndex, breaksForEmployee) => {
  const startDate = breaksForEmployee[breakIndex].startDate;
  const endDate = breaksForEmployee[breakIndex].endDate;

  if (startDate && endDate) {
    const startDateWithoutTime = new Date(startDate);
    startDateWithoutTime.setHours(0, 0, 0, 0);

    const endDateWithoutTime = new Date(endDate);
    endDateWithoutTime.setHours(0, 0, 0, 0);

    // Calculate the difference in milliseconds
    const timeDifference = endDateWithoutTime.getTime() - startDateWithoutTime.getTime();

    // Calculate the number of days, considering partial days
    const daysDiff = timeDifference / (1000 * 60 * 60 * 24) + 1;

    breaksForEmployee[breakIndex].additionalDays = daysDiff;
  } else {
    breaksForEmployee[breakIndex].additionalDays = 0;
  }

  setAdditionalBreaksByEmployee({ ...additionalBreaksByEmployee, [employeeId]: breaksForEmployee });
};


// Define the handleAdditionalBreakTypeChange function
const handleAdditionalBreakTypeChange = (e, employeeId, breakIndex) => {
  const breaksForEmployee = [...(additionalBreaksByEmployee[employeeId] || [])];
  breaksForEmployee[breakIndex].type = e.target.value;
  setAdditionalBreaksByEmployee({ ...additionalBreaksByEmployee, [employeeId]: breaksForEmployee });
};



const addAdditionalBreak = (employeeId) => {
  const newBreak = { startDate: null, endDate: null, type: '', additionalDays: 0 };
  const updatedBreaksForEmployee = [...(additionalBreaksByEmployee[employeeId] || []), newBreak];
  setAdditionalBreaksByEmployee({ ...additionalBreaksByEmployee, [employeeId]: updatedBreaksForEmployee });
};


const deleteAdditionalBreak = (employeeId, breakIndex) => {
  const breaksForEmployee = additionalBreaksByEmployee[employeeId] || [];
  breaksForEmployee.splice(breakIndex, 1);
  setAdditionalBreaksByEmployee({ ...additionalBreaksByEmployee, [employeeId]: breaksForEmployee });
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

function roundUpToCent(value) {
  return Math.ceil(value * 100) / 100;
}
// Define a function to calculate salary
// Define a function to calculate salary
console.log("Current employee object:", employees);



const calculateSalary = (grossAmountValue, daysOfBreak, breakType, additionalDaysArray, additionalBreakTypesArray, workingHours, totalDaysNotWorked, proRatedGross, totalProRatedGross) => {
  // Log to check the received value of daysNotWorked
  console.log("Days Not Worked Received:", totalDaysNotWorked);
  console.log(`Days Not Worked Received for Employee:`, totalDaysNotWorked);
  console.log(`proRatedGross:`, proRatedGross);
  console.log(`proRatedGross:`, totalProRatedGross);


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
let totalDaysZwolnienie = breakType === 'zwolnienie' ? daysOfBreak : 0;
let totalDaysBezplatny = breakType === 'bezpłatny' ? daysOfBreak : 0;
let wynChorobowe = 0;


  // Summing up additional days for each break type
  for(let i = 0; i < additionalDaysArray.length; i++) {
      if(additionalBreakTypesArray[i] === 'zwolnienie') {
          totalDaysZwolnienie += additionalDaysArray[i];
      } else if(additionalBreakTypesArray[i] === 'bezpłatny') {
          totalDaysBezplatny += additionalDaysArray[i];
      }
  }
  // Logging the total number of days for 'bezpłatny' break
console.log('Total Days Bezplatny:', totalDaysBezplatny);

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

  // Calculate deduction for not worked days
  const notWorkedDaysDeduction = totalDaysNotWorked > 0 ? dailyRate * totalDaysNotWorked * 8 : 0;
  console.log("Not Worked Days Deduction:", notWorkedDaysDeduction);

  // Special handling for combined 'bezpłatny' and 'zwolnienie':
  if (hasBezplatny && !hasZwolnienie) {
      const reductionBezplatny = (dailyRate * totalDaysBezplatny * 8);
      customGrossAmount -= reductionBezplatny;
  }

  // Process other breaks in order
  for (let i = 0; i < allBreakTypes.length; i++) {
      const currentBreakType = allBreakTypes[i];
      const currentBreakDays = allBreakDays[i];

      if (currentBreakType === 'zwolnienie') {
          customGrossAmount -= (grossAmountValue / 30 * currentBreakDays);
          wynChorobowe += ((grossAmountValue - 0.1371 * grossAmountValue) / 30) * (currentBreakDays * 0.8);
      } else if ((currentBreakType === 'bezpłatny' || currentBreakType === 'nieobecność' || currentBreakType === 'wychowawczy') && hasZwolnienie) {
        // Your code here
          customGrossAmount -= (dailyRate * currentBreakDays * 8);
      } else if (currentBreakType === 'ciąża') {
        customGrossAmount -= (grossAmountValue / 30 * currentBreakDays);
          wynChorobowe += ((grossAmountValue - 0.1371 * grossAmountValue) / 30) * (currentBreakDays);
      } else if (currentBreakType === 'rodzicielski') {
        // For 'rodzicielski', apply the same deduction as 'zwolnienie' but set wyn_chorobowe to 0
        customGrossAmount -= (grossAmountValue / 30 * currentBreakDays);
        wynChorobowe = 0; // This leave is covered by ZUS, not included in the salary calculation
    }
  }

  // Apply the not worked days deduction
  customGrossAmount -= notWorkedDaysDeduction;

  // Ensure customGrossAmount has two decimal places
  customGrossAmount = parseFloat(customGrossAmount.toFixed(2));

  // The rest of your logic remains unchanged
  let podstawa_zdrow = (roundUpToCent(customGrossAmount) - roundUpToCent(customGrossAmount * 0.0976) - roundUpToCent(customGrossAmount * 0.015) - roundUpToCent(customGrossAmount * 0.0245) + parseFloat(wynChorobowe)).toFixed(2);
  let pod_zal = ((customGrossAmount - (0.1371 * customGrossAmount)) + parseFloat(wynChorobowe) - 250);
pod_zal = pod_zal > 0 ? pod_zal.toFixed(0) : '0';

  let zaliczka = (parseFloat(pod_zal) * 0.12 - 300) < 0 ? 0 : (parseFloat(pod_zal) * 0.12 - 300).toFixed(0);
  let zal_2021 = (parseFloat(pod_zal) * 0.17 - 43.76).toFixed(2);
  zal_2021 = zal_2021 > 0 ? zal_2021 : '0';
  let zdrowotne = parseFloat(zal_2021) < parseFloat(podstawa_zdrow) * 0.09 ? parseFloat(zal_2021) : (parseFloat(podstawa_zdrow) * 0.09).toFixed(2);
  
  let netAmount = (parseFloat(podstawa_zdrow) - parseFloat(zdrowotne) - parseFloat(zaliczka)).toFixed(2);

  const calculatedValues = {
      grossAmount: grossAmountValue,
      netAmount,
      emeryt_pr: (customGrossAmount * 0.0976).toFixed(2),
      emeryt_ub: (customGrossAmount * 0.0976).toFixed(2),
      rent_pr: (customGrossAmount * 0.065).toFixed(2),
      rent_ub: roundUpToCent(customGrossAmount * 0.015).toFixed(2),
      chorobowe: (customGrossAmount * 0.0245).toFixed(2),
      wypadkowe: (customGrossAmount * 0.0167).toFixed(2),
      FP: roundUpToCent(customGrossAmount * 0.0245).toFixed(2),
      FGSP: roundUpToCent(customGrossAmount * 0.001).toFixed(2),
      wyn_chorobowe: wynChorobowe.toFixed(2),
      podstawa_zdrow: podstawa_zdrow,
      podstawa_zaliczki: pod_zal,
      zaliczka,
      zal_2021,
      zdrowotne,
      ulga: '300.00',
      koszty: '250.00',
      social_base: customGrossAmount,
      additionalDays: additionalDaysArray.reduce((acc, val) => acc + val, 0)  // Sum of all additional days
  };

  return calculatedValues;
};

const handleCalculateSalary = () => {
  console.log("Calculating salary...");
  console.log("handleCalculateSalary triggered");

  const updatedContracts = validContracts.map((employee, index) => {
      const normalizedGrossAmount = Array.isArray(employee.gross_amount) 
          ? employee.gross_amount.map(gross => parseFloat(gross))
          : [parseFloat(employee.gross_amount)];

      const updatedEmployeeContracts = normalizedGrossAmount.map((grossAmount, index) => {
          const daysOfBreak = parseInt(healthBreaks[index]?.days, 10) || 0;
          const breakType = healthBreaks[index]?.type || '';
          const additionalDays = [parseInt(additionalBreaks[index]?.additionalDays, 10) || 0];
          const additionalBreakType = [additionalBreaks[index]?.type || ''];
          const totalDaysNotWorked = daysNotWorkedSummary[employee.employee_id] || 0;
          const proRatedGross = employee.proRatedGross;
          
          console.log("Days Not Worked Summary State:", daysNotWorkedSummary);
          console.log(`Total Days Not Worked for Employee ID ${employee.employee_id}:`, totalDaysNotWorked);
          console.log("Inside handleCalculateSalary. Type of additionalDays:", typeof additionalDays, "Value:", additionalDays);

          const calculatedValues = calculateSalary(
            employee.employee_id,
            grossAmount, 
            daysOfBreak, 
            breakType, 
            additionalDays, 
            additionalBreakType,
            workingHours,
            totalDaysNotWorked,
            proRatedGross // Pass the proRatedGross value here
          );
          console.log("Calculate Salary Result for Employee:", employee.employee_id, "is:", calculatedValues);

          return { ...employee, contracts: calculatedValues };
      });

      return updatedEmployeeContracts;
  });

  console.log(updatedContracts);
  setCalculatedContracts(updatedContracts);
};

const renderEmployeeTable = () => {
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (validContracts.length === 0) {
    return <div>No employees with valid contracts for the selected month and year.</div>;
  }
  
  return (
    <div>
       <h2>Lista płac za {month} {year}</h2>
      <label htmlFor="salaryDate">Salary Date:</label>
      <input
        type="date"
        id="salaryDate"
        value={salaryDate}
        onChange={(e) => setSalaryDate(e.target.value)}
      />
            

    <table>
      <thead>
        <tr>
        <th>ID</th>
          <th>Name</th>
          <th>Surname</th>
          <th>Wyn.zasadnicze</th>
          <th>Netto</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Days</th>
          <th>Health Break Type</th>
          <th>Pods_społ</th>
			<th>wyn.chorobowe</th>
            <th>em.pr</th>
            <th>em.ub</th>
            <th>rent.pr</th>
            <th>rent.ub</th>
            <th>chorobowe</th>
            <th>wypadkowe</th>
            <th>FP</th>
            <th>FGSP</th>
            <th>Pods_zdrow</th>
            <th>zdrow</th>
			<th>koszty</th>
            <th>podstawa_zaliczki</th>
			<th>ulga</th>
            <th>zaliczka</th>
            <th>zal_2021</th>
            <th>Netto</th>
        </tr>
      </thead>
      <tbody>
      {calculatedContracts.map((employee, index) => {
        const healthBreak = healthBreaks?.[index] || defaultHealthBreak;
        

                        return (
                          <React.Fragment key={employee.employee_id || index}>
                            <tr>
                                <td>{employee.employee_id}</td>
                                <td>{employee.name}</td>
                                <td>{employee.surname}</td>
                                <td>{employee.gross_amount}</td>
                                <td>{employee.contracts?.[0]?.netAmount}</td>
                                <td>
                <DatePicker
                    selected={healthBreak.startDate || null}
                    selectsStart
                    startDate={healthBreak.startDate}
                    endDate={healthBreak.endDate}
                    onChange={(date) => handleHealthBreakStartDateChange(date, index)}
                    dateFormat="dd/MM/yyyy"
                />
            </td>

            <td>
                <DatePicker
                    selected={healthBreak.endDate || null}
                    selectsEnd
                    startDate={healthBreak.startDate}
                    endDate={healthBreak.endDate}
                    onChange={(date) => handleHealthBreakEndDateChange(date, index)}
                    dateFormat="dd/MM/yyyy"
                />
            </td>

            <td>{healthBreak.days}</td>

            <td>
                <select
                    value={healthBreak?.type || ''}
                    onChange={(e) => handleHealthBreakTypeChange(e, index)}
                >
                   
                    <option value="brak">Brak</option>
                    <option value="zwolnienie">Zwolnienie</option>
                    <option value="ciąża">Zwolnienie 100% ciąża</option>
                    <option value="bezpłatny">Bezpłatny</option>
                    <option value="nieobecność">Nieobecność</option>
                    <option value="wychowawczy">wychowawczy</option>
                    <option value="rodzicielski">rodzicielski</option>
                </select>
                
                <button onClick={() => addAdditionalBreak(employee.employee_id)}>Add Przerwa</button>

                
            </td>

        <td>{employee.contracts?.[0]?.social_base}</td>                       
        <td>{employee.contracts?.[0]?.wyn_chorobowe}</td>                        
        <td>{employee.contracts?.[0]?.emeryt_pr}</td>
    <td>{employee.contracts?.[0]?.emeryt_ub}</td>
    <td>{employee.contracts?.[0]?.rent_pr}</td>
    <td>{employee.contracts?.[0]?.rent_ub}</td>
    <td>{employee.contracts?.[0]?.chorobowe}</td>
    <td>{employee.contracts?.[0]?.wypadkowe}</td>
    <td>{employee.contracts?.[0]?.FP}</td>
    <td>{employee.contracts?.[0]?.FGSP}</td>
    <td>{employee.contracts?.[0]?.podstawa_zdrow}</td>
    <td>{employee.contracts?.[0]?.zdrowotne}</td>
    <td>{employee.contracts?.[0]?.koszty}</td>
    <td>{employee.contracts?.[0]?.podstawa_zaliczki}</td>
    <td>{employee.contracts?.[0]?.ulga}</td>
    <td>{employee.contracts?.[0]?.zaliczka}</td>
    <td>{employee.contracts?.[0]?.zal_2021}</td>
    <td>{employee.contracts?.[0]?.netAmount}</td>
    <td>


                </td>
                                </tr>
                                
                                
                                {(additionalBreaksByEmployee[employee.employee_id] || []).map((breakItem, breakIndex) => (
                                 
                <tr key={`additional-${index}-${breakIndex}`}>
                    <td colSpan={27}> {/* You can adjust colSpan according to the number of columns you have */}
                        <React.Fragment>
                            <td>
                            <DatePicker
  selected={breakItem.startDate} // ensure this gets the correct date
  onChange={(date) => handleAdditionalBreakStartDateChange(date, employee.employee_id, breakIndex)}
  dateFormat="dd/MM/yyyy"
/>

                            </td>
                            <td>
                            <DatePicker
  selected={breakItem.endDate}
  onChange={(date) => handleAdditionalBreakEndDateChange(date, employee.employee_id, breakIndex)}
  dateFormat="dd/MM/yyyy"
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
                                </select>
                                <button onClick={() => deleteAdditionalBreak(employee.employee_id, breakIndex)}>Remove</button>

                            </td>
                        </React.Fragment>
                    </td>
                </tr>
                
      ))}

            <tr>
            <button onClick={() => {
        
              
    const daysOfBreak = healthBreak.days;
    const breakType = healthBreak.type;
    const employeeProRatedGross = proRatedGrossSummary[employee.employee_id]; // Retrieve pro-rated gross for the employee
  const grossAmountValue = employeeProRatedGross ? employeeProRatedGross : employee.gross_amount; // Use pro-rated gross if available, otherwise use standard gross amount
    
    // Construct the arrays here, based on the additionalBreaks structure.
     // Extract the arrays for the specific employee from the additionalBreaksByEmployee structure.
     const breaksForEmployee = additionalBreaksByEmployee[employee.employee_id] || [];
     const additionalDaysArray = breaksForEmployee.map(breakItem => breakItem.additionalDays || 0);
     const additionalBreakTypesArray = breaksForEmployee.map(breakItem => breakItem.type || '');
     // Extract total days not worked for this employee
  const employeeNotWorkedDetails = daysNotWorkedSummary[employee.employee_id] || [];
  const totalDaysNotWorked = employeeNotWorkedDetails.reduce((total, detail) => total + detail.daysNotWorked, 0);
  

  console.log(`Days Not Worked for Employee (from button click) ${employee.employee_id}:`, totalDaysNotWorked);
  console.log(`proRatedGross (from button click) ${employee.employee_id}:`,employeeProRatedGross);
  console.log(`proRatedGross for Employee ID (click) ${employee.employee_id}:`, employeeProRatedGross);
  // Check if the employee has a proRatedGross value
  


    const calculatedValues = calculateSalary(
      grossAmountValue, 
      daysOfBreak, 
      breakType, 
      additionalDaysArray,  // pass the entire array
      additionalBreakTypesArray,
      workingHours,  // pass the entire array
      totalDaysNotWorked
       // Passing proRatedGross here// Pass the proRatedGross value here // Pass the proRatedGross value here // pass the total days not worked for this specific employee
    );
    
    // Update this specific employee's data in the state:
    const updatedEmployees = [...calculatedContracts];
    updatedEmployees[index] = { ...employee, contracts: [calculatedValues] };
    setCalculatedContracts(updatedEmployees);
}}>
    Calculate
</button>



            </tr>
        </React.Fragment>
                                )
})}
      </tbody>
    </table>
    



    </div>
  );
};




return (
  <div className="salary-selection-page">
    <h1>Salary Selection</h1>
    <div className="filter-container">
      <label>
        Month:
        <input type="text" value={month} onChange={handleMonthChange} />
      </label>
      <label>
        Year:
        <input type="text" value={year} onChange={handleYearChange} />
      </label>
      <button onClick={fetchValidContracts}>Fetch Valid Contracts</button>
    </div>
    <div className="employee-list-container">{renderEmployeeTable()}</div>
  </div>
);
}
export default SalarySelectionPage;