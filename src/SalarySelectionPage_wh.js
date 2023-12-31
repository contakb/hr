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





const didEmployeeWorkWholeMonth = (contractFromDate, contractToDate, year, month) => {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0); // This will get the last day of the month.
  const contractStart = new Date(contractFromDate);
  const contractEnd = contractToDate ? new Date(contractToDate) : new Date();

  return contractStart <= monthStart && contractEnd >= monthEnd;
};


const calculateProRatedGrossAmount = (contract, workingHours) => {
  const { gross_amount, contract_from_date, contract_to_date } = contract;

  // Parse the contract dates.
  const contractStart = new Date(contract_from_date);
  const contractEnd = contract_to_date ? new Date(contract_to_date) : new Date();

  // Calculate the start and end of the relevant month.
  const monthStart = new Date(year, month - 1, 1); // Note: Months are zero-indexed in JavaScript Dates
  const monthEnd = new Date(year, month, 0); // This will get the last day of the month.

  // Calculate the number of days not worked in the month if the employee starts mid-month or ends before the month's last day.
  const daysNotWorkedAtStart = contractStart > monthStart ? (contractStart - monthStart) / (1000 * 3600 * 24) : 0;
  const daysNotWorkedAtEnd = contractEnd < monthEnd ? (monthEnd - contractEnd) / (1000 * 3600 * 24) : 0;
  const totalDaysNotWorked = daysNotWorkedAtStart + daysNotWorkedAtEnd;

  // Calculate the daily wage based on the total working hours for the month.
  const dailyWage = gross_amount / workingHours * 8; // 8 is the number of work hours per day.

  // Pro-rate the gross amount by subtracting the salary for the days not worked.
  let customGrossAmount = gross_amount - (dailyWage * totalDaysNotWorked);

  return customGrossAmount.toFixed(2); // Round to two decimal places for currency.
};







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
const calculateSalary = (
  grossAmountValue,
  daysOfBreak,
  breakType,
  additionalDaysArray,
  additionalBreakTypesArray,
  workingHours
) => {
  if (!Array.isArray(additionalDaysArray) || !Array.isArray(additionalBreakTypesArray)) {
    console.error("One of the arrays is not valid.");
    return; // Handle this error as you see fit
  }

  let customGrossAmount = parseFloat(grossAmountValue);
  let totalDaysZwolnienie = breakType === 'zwolnienie' ? daysOfBreak : 0;
  let totalDaysBezplatny = breakType === 'bezpłatny' ? daysOfBreak : 0;
  let wynChorobowe = 0;

  // Combine additional break days into the total count
  additionalDaysArray.forEach((days, index) => {
    if (additionalBreakTypesArray[index] === 'zwolnienie') {
      totalDaysZwolnienie += days;
    } else if (additionalBreakTypesArray[index] === 'bezpłatny') {
      totalDaysBezplatny += days;
    }
  });

  const hasZwolnienie = totalDaysZwolnienie > 0;
  const hasBezplatny = totalDaysBezplatny > 0;

  // Logging the presence of the break types
  console.log('Has Bezplatny:', hasBezplatny);
  console.log('Has Zwolnienie:', hasZwolnienie);

  // Special handling for combined 'bezpłatny' and 'zwolnienie':
  if (hasBezplatny && hasZwolnienie) {
    // Apply a different calculation if both breaks are present
    customGrossAmount -= (customGrossAmount / workingHours * totalDaysBezplatny * 8);
    wynChorobowe += (grossAmountValue - (grossAmountValue * 0.1371) / 30 * totalDaysZwolnienie * 0.8);
  } else {
    // If there's only bezpłatny, reduce the gross amount accordingly
    if (hasBezplatny) {
      customGrossAmount -= (customGrossAmount / workingHours * totalDaysBezplatny * 8);
    }
    // If there's only zwolnienie, adjust the wynChorobowe accordingly
    if (hasZwolnienie) {
      wynChorobowe += (grossAmountValue - (grossAmountValue * 0.1371) / 30 * totalDaysZwolnienie * 0.8);
    }
  }


  // The rest of your logic remains unchanged
  let podstawa_zdrow = (roundUpToCent(customGrossAmount) - roundUpToCent(customGrossAmount * 0.0976) - roundUpToCent(customGrossAmount * 0.015) - roundUpToCent(customGrossAmount * 0.0245) + parseFloat(wynChorobowe)).toFixed(2);
  let pod_zal = ((customGrossAmount - (0.1371 * customGrossAmount)) + parseFloat(wynChorobowe) - 250).toFixed(0);

  let zaliczka = (parseFloat(pod_zal) * 0.12 - 300) < 0 ? 0 : (parseFloat(pod_zal) * 0.12 - 300).toFixed(0);
  let zal_2021 = (parseFloat(pod_zal) * 0.17 - 43.76).toFixed(2);
  let zdrowotne = parseFloat(zal_2021) < parseFloat(podstawa_zdrow) * 0.09 ? parseFloat(zal_2021) : (parseFloat(podstawa_zdrow) * 0.09).toFixed(2);
  
  let netAmount = (parseFloat(podstawa_zdrow) - parseFloat(zdrowotne) - parseFloat(zaliczka)).toFixed(2);

  const calculatedValues = {
    grossAmount: customGrossAmount.toFixed(2), // Keep two decimals for currency
    wynChorobowe: wynChorobowe.toFixed(2),
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

  if (!workingHours) {
    console.error('Working hours are not set.');
    return; // Exit the function if working hours are not available
  }

  const updatedContracts = validContracts.map((employee, index) => {
    // Here you're assuming employee.gross_amount is an array or a single value.
    // You might want to handle this outside of map if every employee has only one contract
    const normalizedGrossAmount = Array.isArray(employee.gross_amount) 
      ? employee.gross_amount.map(gross => parseFloat(gross))
      : [parseFloat(employee.gross_amount)];

    const updatedEmployeeContracts = normalizedGrossAmount.map((grossAmount, grossIndex) => {
      const daysOfBreak = parseInt(healthBreaks[grossIndex]?.days, 10) || 0;
      const breakType = healthBreaks[grossIndex]?.type || '';
      const additionalDays = [parseInt(additionalBreaks[grossIndex]?.additionalDays, 10) || 0];
      const additionalBreakType = [additionalBreaks[grossIndex]?.type || ''];

      console.log("Inside handleCalculateSalary. Type of additionalDays:", typeof additionalDays, "Value:", additionalDays);

      const calculatedValues = calculateSalary(
        grossAmount, 
        daysOfBreak, 
        breakType, 
        additionalDays, 
        additionalBreakType,
        workingHours // Pass the working hours to the calculateSalary function
      );

      console.log("Calculate Salary Result for Employee:", employee.id, "is:", calculatedValues);

      return { ...employee, ...calculatedValues }; // Combine the employee data with the calculated values
    });

    // Since updatedEmployeeContracts is an array (from the map above), you need to handle how you want to merge these if needed
    // For simplicity, assuming only one contract per employee, you could simply return the first one
    return updatedEmployeeContracts[0];
  });

  console.log(updatedContracts);
  setCalculatedContracts(updatedContracts); // Assuming this sets the state with the updated contracts
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
  
  // Extract the arrays for the specific employee from the additionalBreaksByEmployee structure.
  const breaksForEmployee = additionalBreaksByEmployee[employee.employee_id] || [];
  const additionalDaysArray = breaksForEmployee.map(breakItem => breakItem.additionalDays || 0);
  const additionalBreakTypesArray = breaksForEmployee.map(breakItem => breakItem.type || '');

  // Ensure that workingHours is defined and available in the scope of this function.
  if (!workingHours) {
    alert('Working hours data is not available yet.');
    return;
  }

  const calculatedValues = calculateSalary(
    grossAmountValue,
    daysOfBreak,
    breakType,
    additionalDaysArray,
    additionalBreakTypesArray,
    workingHours // Pass the workingHours here
  );
  
  // Update this specific employee's data in the state:
  const updatedEmployees = [...calculatedContracts];
  updatedEmployees[index] = { ...employee, contracts: calculatedValues };
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