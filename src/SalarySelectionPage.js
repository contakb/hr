import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker'; // Import DatePicker
import 'react-datepicker/dist/react-datepicker.css'; // Import styles

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

function countWorkingDays(employee, workingHours, holidays, year, month) {
  employee.contract_details.forEach(contract => {
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

    console.log(`Employee ID: ${employee.employee_id} - Actual Working Days: ${workingDayCount}, Adjusted Working Days: ${totalWorkingDaysInMonth}`);
  });
}

// Helper functions
function isWeekend(date) {
  return date.getDay() === 0 || date.getDay() === 6;
}

function isHolidayOnDate(holidays, date) {
  return holidays.some(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate.toDateString() === date.toDateString();
  });
}


useEffect(() => {
  if (validContracts.length > 0 && workingHours && holidays.length >= 0 && year && month) {
    validContracts.forEach(employee => {
      countWorkingDays(employee, workingHours, holidays, year, month);
    });
  }
}, [validContracts, workingHours, holidays, year, month]);












  
  
  
  



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
const calculateSalary = (grossAmountValue, daysOfBreak, breakType, additionalDaysArray, additionalBreakTypesArray,workingHours) => {
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

  let customGrossAmount = parseFloat(grossAmountValue);
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
  if (hasBezplatny && !hasZwolnienie) {
    const dailyRate = grossAmountValue / workingHours; // This will give you the gross amount per hour
      const reduction = (dailyRate * totalDaysBezplatny * 8);
      customGrossAmount -= reduction;
  }
// Logging the gross amount after reduction
console.log('Custom Gross Amount after reduction:', customGrossAmount);
  // Process other breaks in order:
  for (let i = 0; i < allBreakTypes.length; i++) {
      const currentBreakType = allBreakTypes[i];
      const currentBreakDays = allBreakDays[i];

      
      if (currentBreakType === 'zwolnienie') {
        customGrossAmount = parseFloat((customGrossAmount - (grossAmountValue / 30 * currentBreakDays)).toFixed(2));

        wynChorobowe = parseFloat((wynChorobowe + ((grossAmountValue - 0.1371 * grossAmountValue) / 30) * (currentBreakDays * 0.8)).toFixed(2));

      } else if (currentBreakType === 'bezpłatny' && hasZwolnienie) {
        customGrossAmount = parseFloat((customGrossAmount - (grossAmountValue / workingHours * currentBreakDays * 8)).toFixed(2));

      }
  }

  customGrossAmount = parseFloat(customGrossAmount.toFixed(2)); // To ensure it's 2 decimal places after all calculations

  // The rest of your logic remains unchanged
  let podstawa_zdrow = (roundUpToCent(customGrossAmount) - roundUpToCent(customGrossAmount * 0.0976) - roundUpToCent(customGrossAmount * 0.015) - roundUpToCent(customGrossAmount * 0.0245) + parseFloat(wynChorobowe)).toFixed(2);
  let pod_zal = ((customGrossAmount - (0.1371 * customGrossAmount)) + parseFloat(wynChorobowe) - 250).toFixed(0);

  let zaliczka = (parseFloat(pod_zal) * 0.12 - 300) < 0 ? 0 : (parseFloat(pod_zal) * 0.12 - 300).toFixed(0);
  let zal_2021 = (parseFloat(pod_zal) * 0.17 - 43.76).toFixed(2);
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
      wyn_chorobowe: wynChorobowe,
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

  const updatedContracts = validContracts.map((employee, index) => {
      const normalizedGrossAmount = Array.isArray(employee.gross_amount) 
          ? employee.gross_amount.map(gross => parseFloat(gross))
          : [parseFloat(employee.gross_amount)];

      const updatedEmployeeContracts = normalizedGrossAmount.map((grossAmount, index) => {
          const daysOfBreak = parseInt(healthBreaks[index]?.days, 10) || 0;
          const breakType = healthBreaks[index]?.type || '';
          const additionalDays = [parseInt(additionalBreaks[index]?.additionalDays, 10) || 0];



          const additionalBreakType = [additionalBreaks[index]?.type || ''];


          console.log("Inside handleCalculateSalary. Type of additionalDays:", typeof additionalDays, "Value:", additionalDays);

          const calculatedValues = calculateSalary(
              grossAmount, 
              daysOfBreak, 
              breakType, 
              additionalDays, 
              additionalBreakType,
              workingHours
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
                    <option value="bezpłatny">Bezpłatny</option>
                    <option value="nieobecność">Nieobecność</option>
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
                                    <option value="bezpłatny">Bezpłatny</option>
                                    <option value="nieobecność">Nieobecność</option>
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
    const grossAmountValue = employee.gross_amount;
    
    // Construct the arrays here, based on the additionalBreaks structure.
     // Extract the arrays for the specific employee from the additionalBreaksByEmployee structure.
     const breaksForEmployee = additionalBreaksByEmployee[employee.employee_id] || [];
     const additionalDaysArray = breaksForEmployee.map(breakItem => breakItem.additionalDays || 0);
     const additionalBreakTypesArray = breaksForEmployee.map(breakItem => breakItem.type || '');

    const calculatedValues = calculateSalary(
      grossAmountValue, 
      daysOfBreak, 
      breakType, 
      additionalDaysArray,  // pass the entire array
      additionalBreakTypesArray,
      workingHours  // pass the entire array
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