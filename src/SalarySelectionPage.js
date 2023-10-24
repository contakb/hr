import React, { useState, useEffect } from 'react';
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
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  
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
const handleAdditionalBreakStartDateChange = (date, breakIndex) => {
  const updatedBreaks = [...additionalBreaks];
  updatedBreaks[breakIndex] = {
    ...updatedBreaks[breakIndex],
    startDate: date,
  };
  setAdditionalBreaks(updatedBreaks);

  // Calculate the number of days and update the state
  calculateAdditionalDays(breakIndex, updatedBreaks);
};

// Define the handleAdditionalBreakEndDateChange function
const handleAdditionalBreakEndDateChange = (date, breakIndex) => {
  const updatedBreaks = [...additionalBreaks];
  updatedBreaks[breakIndex] = {
    ...updatedBreaks[breakIndex],
    endDate: date,
  };
  setAdditionalBreaks(updatedBreaks);

  // Calculate the number of days and update the state
  calculateAdditionalDays(breakIndex, updatedBreaks);
};

// Function to calculate the number of days between start and end dates for additional breaks and update the state
const calculateAdditionalDays = (breakIndex, updatedBreaks) => {
  const startDate = updatedBreaks[breakIndex].startDate;
  const endDate = updatedBreaks[breakIndex].endDate;

  if (startDate && endDate) {
    const startDateWithoutTime = new Date(startDate);
    startDateWithoutTime.setHours(0, 0, 0, 0);

    const endDateWithoutTime = new Date(endDate);
    endDateWithoutTime.setHours(0, 0, 0, 0);

    // Calculate the difference in milliseconds
    const timeDifference = endDateWithoutTime.getTime() - startDateWithoutTime.getTime();

    // Calculate the number of days, considering partial days
    const daysDiff = timeDifference / (1000 * 60 * 60 * 24) + 1;

    updatedBreaks[breakIndex].additionalDays = daysDiff;
  } else {
    updatedBreaks[breakIndex].additionalDays = 0;
  }

  setAdditionalBreaks(updatedBreaks);
};

// Define the handleAdditionalBreakTypeChange function
const handleAdditionalBreakTypeChange = (e, breakIndex) => {
  const updatedBreaks = [...additionalBreaks];
  updatedBreaks[breakIndex] = {
    ...updatedBreaks[breakIndex],
    type: e.target.value,
  };
  setAdditionalBreaks(updatedBreaks);
};


const addAdditionalBreak = () => {
  const newBreak = { startDate: null, endDate: null, type: '', additionalDays: 0 }; // Initialize additionalDays to 0
  setAdditionalBreaks([...additionalBreaks, newBreak]);
};

  const deleteAdditionalBreak = (breakIndex) => {
    // Delete the specified additional break
    const updatedAdditionalBreaks = [...additionalBreaks];
    updatedAdditionalBreaks.splice(breakIndex, 1);
    setAdditionalBreaks(updatedAdditionalBreaks);
  };

const handleAdditionalBreakDaysChange = (e, breakIndex) => {
  const { name, value } = e.target;
  const updatedAdditionalBreaks = [...additionalBreaks];
  updatedAdditionalBreaks[breakIndex][name] = value;
  setAdditionalBreaks(updatedAdditionalBreaks);
};

function roundUpToCent(value) {
  return Math.ceil(value * 100) / 100;
}
// Define a function to calculate salary
// Define a function to calculate salary
const calculateSalary = (grossAmountValue, daysOfBreak, breakType, additionalDays, additionalBreakType) => {
  

  let customGrossAmount = parseFloat(grossAmountValue);

  let wynChorobowe = 0;
  let podstawa_zdrow;
  let pod_zal;
  let zaliczka;
  let zdrowotne;
  let zal_2021;
  let netAmount;

  if (breakType === 'zwolnienie') {
      customGrossAmount = (grossAmountValue - (grossAmountValue / 30 * daysOfBreak)).toFixed(2);
      wynChorobowe = (((grossAmountValue - 0.1371 * grossAmountValue) / 30) * (daysOfBreak * 0.8)).toFixed(2);

      if (additionalBreakType === 'bezpłatny') {
          customGrossAmount -= (grossAmountValue / 168 * additionalDays * 8).toFixed(2);
      }

      if (additionalBreakType === 'zwolnienie') {
          customGrossAmount = (grossAmountValue - (grossAmountValue / 30 * (daysOfBreak + additionalDays))).toFixed(2);
      }
  } else if (breakType === 'bezpłatny') {
      customGrossAmount = (grossAmountValue - (grossAmountValue / 168 * (daysOfBreak + additionalDays) * 8)).toFixed(2);
  }

  podstawa_zdrow = (roundUpToCent(customGrossAmount) - roundUpToCent(customGrossAmount * 0.0976) - roundUpToCent(customGrossAmount * 0.015) - roundUpToCent(customGrossAmount * 0.0245) + parseFloat(wynChorobowe)).toFixed(2);
  pod_zal = ((customGrossAmount - (0.1371 * customGrossAmount)) + parseFloat(wynChorobowe) - 250).toFixed(0);

  zaliczka = (parseFloat(pod_zal) * 0.12 - 300) < 0 ? 0 : (parseFloat(pod_zal) * 0.12 - 300).toFixed(0);
  zal_2021 = (parseFloat(pod_zal) * 0.17 - 43.76).toFixed(2);
  zdrowotne = parseFloat(zal_2021) < parseFloat(podstawa_zdrow) * 0.09 ? parseFloat(zal_2021) : (parseFloat(podstawa_zdrow) * 0.09).toFixed(2);
  
  netAmount = (parseFloat(podstawa_zdrow) - parseFloat(zdrowotne) - parseFloat(zaliczka)).toFixed(2);

  const calculatedValues = {
      grossAmount: grossAmountValue,
      netAmount,
      emeryt_pr: (grossAmountValue * 0.0976).toFixed(2),
      emeryt_ub: (grossAmountValue * 0.0976).toFixed(2),
      rent_pr: (grossAmountValue * 0.065).toFixed(2),
      rent_ub: roundUpToCent(grossAmountValue * 0.015).toFixed(2),
      chorobowe: (grossAmountValue * 0.0245).toFixed(2),
      wypadkowe: (grossAmountValue * 0.0167).toFixed(2),
      FP: roundUpToCent(grossAmountValue * 0.0245).toFixed(2),
      FGSP: roundUpToCent(grossAmountValue * 0.001).toFixed(2),
      wyn_chorobowe: wynChorobowe,
      podstawa_zdrow: podstawa_zdrow,
      podstawa_zaliczki: pod_zal,
      zaliczka,
      zal_2021,
      zdrowotne,
      ulga: '300.00',
      koszty: '250.00',
      social_base: customGrossAmount,
      additionalDays
  };
  return calculatedValues; // Return the calculated values
}



const handleCalculateSalary = () => {
  console.log("Calculating salary...");

  const updatedContracts = validContracts.map((employee, index) => {
      const normalizedGrossAmount = Array.isArray(employee.gross_amount) 
          ? employee.gross_amount.map(gross => parseFloat(gross))
          : [parseFloat(employee.gross_amount)];

      const updatedEmployeeContracts = normalizedGrossAmount.map((grossAmount, index) => {
          const daysOfBreak = parseInt(healthBreaks[index]?.days, 10) || 0;
          const breakType = healthBreaks[index]?.type || '';
          const additionalDays = parseInt(additionalBreaks[index]?.additionalDays, 10) || 0;
          const additionalBreakType = additionalBreaks[index]?.type || '';

          const calculatedValues = calculateSalary(
              grossAmount, 
              daysOfBreak, 
              breakType, 
              additionalDays, 
              additionalBreakType
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
                            <tr key={employee.employee_id || index}>
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
          <div>
          <select
  value={healthBreak?.type || ''}
  onChange={(e) => handleHealthBreakTypeChange(e, index)}
>

              <option value="">Jaka przerwa</option>
              <option value="brak">Brak</option>
              <option value="zwolnienie">Zwolnienie</option>
              <option value="bezpłatny">Bezpłatny</option>
              <option value="nieobecność">Nieobecność</option>
            </select>
            <button onClick={addAdditionalBreak}>Add Przerwa</button>
          </div>
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
    <button onClick={() => {
    const daysOfBreak = healthBreak.days;
    const breakType = healthBreak.type;
    const grossAmountValue = employee.gross_amount;
    const additionalDays = 0;  // TODO: Fetch this properly
    const additionalBreakType = '';  // TODO: Fetch this properly
    
    const calculatedValues = calculateSalary(
      grossAmountValue, 
      daysOfBreak, 
      breakType, 
      additionalDays, 
      additionalBreakType
    );
    
    // Now update this specific employee's data in the state:
    const updatedEmployees = [...calculatedContracts];
    updatedEmployees[index] = { ...employee, contracts: [calculatedValues] };
    setCalculatedContracts(updatedEmployees);
}}>
    Calculate
</button>

                </td>
                                </tr>
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