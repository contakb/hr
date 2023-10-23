import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [healthBreaks, setHealthBreaks] = useState([]); // Initialize healthBreaks as an empty array
  const [additionalBreaks, setAdditionalBreaks] = useState([]);
  const [additionalBreakDays, setAdditionalBreakDays] = useState([]);
  const [additionalDays, setAdditionalDays] = useState(0);
const [additionalBreakType, setAdditionalBreakType] = useState('');
const [calculatedContracts, setCalculatedContracts] = useState([]);




  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:3001/employees');
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
    try {
      // Calculate the start and end dates based on user input
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  
      // Send the calculated date range to the server
      const response = await axios.post('http://localhost:3001/api/valid-employees', {
        startDate,
        endDate,
      });
  
      setValidContracts(response.data.employees);
    } catch (error) {
      console.error('Error fetching valid contracts:', error);
      setValidContracts([]);
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
  if (isNaN(grossAmountValue)) {
    return {
      gross_amount: '',
      tax: '',
      insurance: '',
      netAmount: '',
      emeryt_pr: '',
      emeryt_ub: '',
      rent_pr: '',
      rent_ub: '',
      chorobowe: '',
      wypadkowe: '',
      FP: '',
      FGSP: '',
      podstawa_zdrow: '',
      zdrowotne: '',
      koszty: '',
      podstawa_zaliczki: '',
      ulga: '',
      zaliczka: '',
      zal_2021: '',
      wyn_chorobowe: '',
      social_base: '',
    };
  }

  const emeryt_pr = (grossAmountValue * 0.0976).toFixed(2);
  const emeryt_ub = (grossAmountValue * 0.0976).toFixed(2);
  const rent_pr = (grossAmountValue * 0.065).toFixed(2);
  const rent_ub = roundUpToCent(grossAmountValue * 0.015).toFixed(2);
  const chorobowe = (grossAmountValue * 0.0245).toFixed(2);
  const wypadkowe = (grossAmountValue * 0.0167).toFixed(2);
  const FP = roundUpToCent(grossAmountValue * 0.0245).toFixed(2);
  const FGSP = roundUpToCent(grossAmountValue * 0.001).toFixed(2);
  const wyn_chorobowe = (
    ((grossAmountValue - (0.1371 * grossAmountValue)) / 30) * (daysOfBreak * 0.8)
  ).toFixed(2);
  const podstawa_zdrow = (
    grossAmountValue - emeryt_ub - rent_ub - chorobowe
  ).toFixed(2);
  const podstawa_zaliczki = (podstawa_zdrow - 250).toFixed(0);
  const zaliczka = ((podstawa_zaliczki * 0.12) - 300) < 0 ? 0 : ((podstawa_zaliczki * 0.12) - 300).toFixed(0);
  const zal_2021 = (podstawa_zaliczki * 0.17 - 43.76).toFixed(2);
  const zdrowotne = zal_2021 < (podstawa_zdrow * 0.09) ? zal_2021 : (podstawa_zdrow * 0.09).toFixed(2);
  const netAmount = (podstawa_zdrow - zdrowotne - zaliczka).toFixed(2);
  const ulga = (300).toFixed(2);
  const koszty = (250).toFixed(2);
  const social_base = grossAmountValue.toFixed(2);

  return {
    grossAmount: grossAmountValue.toFixed(2),
    netAmount,
    emeryt_pr,
    emeryt_ub,
    rent_pr,
    rent_ub,
    chorobowe,
    wypadkowe,
    FP,
    FGSP,
    podstawa_zdrow,
    zdrowotne,
    koszty,
    podstawa_zaliczki,
    ulga,
    zaliczka,
    zal_2021,
    wyn_chorobowe,
    social_base
  };
};


const handleCalculateSalary = () => {
  console.log("Calculating salary...");
  console.log('Button clicked!'); // Add this line
  const updatedEmployees = employees.map((employee) => {
    if (employee.gross_amount && employee.gross_amount.length > 0) {
      const updatedContracts = employee.gross_amount.map((grossAmount, index) => {
        const daysOfBreak = parseInt(healthBreaks[index].days, 10) || 0;
        const breakType = healthBreaks[index].type || '';
        const additionalDays = parseInt(additionalBreaks[index].additionalDays, 10) || 0;
        const additionalBreakType = additionalBreaks[index].type || '';

        console.log(updatedEmployees)

        let customGrossAmount = grossAmount

        let wynChorobowe = 0;
        let pod_zal = ((customGrossAmount - (0.1371 * customGrossAmount)) - 250).toFixed(0);
        let zal_2021;
        let zaliczka;
        let zdrowotne;
        let netAmount;

        let emeryt_ub = roundUpToCent(customGrossAmount * 0.0976).toFixed(2);
        let emeryt_pr = roundUpToCent(customGrossAmount * 0.0976).toFixed(2);
        let rent_pr = roundUpToCent(customGrossAmount * 0.065).toFixed(2);
        let rent_ub = roundUpToCent(customGrossAmount * 0.015).toFixed(2);
        let chorobowe = roundUpToCent(customGrossAmount * 0.0245).toFixed(2);

        let podstawa_zdrow;

        if (breakType === 'zwolnienie') {
          customGrossAmount = (grossAmount - (grossAmount / 30 * daysOfBreak)).toFixed(2);
          wynChorobowe = (((grossAmount - 0.1371 * grossAmount) / 30) * ((daysOfBreak) * 0.8)).toFixed(2);
          pod_zal = ((customGrossAmount - (0.1371 * customGrossAmount)) + parseFloat(wynChorobowe) - 250).toFixed(0);

          if (additionalBreakType === 'bezpłatny') {
            customGrossAmount -= (grossAmount / 168 * additionalDays * 8).toFixed(2);
            podstawa_zdrow = (roundUpToCent(customGrossAmount) - roundUpToCent(customGrossAmount * 0.0976) - roundUpToCent(customGrossAmount * 0.015) - roundUpToCent(customGrossAmount * 0.0245) + parseFloat(wynChorobowe)).toFixed(2);
            pod_zal = ((customGrossAmount - (0.1371 * customGrossAmount)) + parseFloat(wynChorobowe) - 250).toFixed(0);
            zaliczka = (parseFloat(pod_zal) * 0.12 - 300) < 0 ? 0 : (parseFloat(pod_zal) * 0.12 - 300).toFixed(0);
            zal_2021 = (parseFloat(pod_zal) * 0.17 - 43.76).toFixed(2);
          }

          if (additionalBreakType === 'zwolnienie') {
            customGrossAmount = (grossAmount - (grossAmount / 30 * (daysOfBreak + additionalDays))).toFixed(2);
            wynChorobowe = (((grossAmount - 0.1371 * grossAmount) / 30) * ((daysOfBreak + additionalDays) * 0.8)).toFixed(2);

            podstawa_zdrow = (roundUpToCent(customGrossAmount) - roundUpToCent(customGrossAmount * 0.0976) - roundUpToCent(customGrossAmount * 0.015) - roundUpToCent(customGrossAmount * 0.0245) + parseFloat(wynChorobowe)).toFixed(2);
            pod_zal = ((customGrossAmount - (0.1371 * customGrossAmount)) + parseFloat(wynChorobowe) - 250).toFixed(0);
            zaliczka = (parseFloat(pod_zal) * 0.12 - 300) < 0 ? 0 : (parseFloat(pod_zal) * 0.12 - 300).toFixed(0);
            zal_2021 = (parseFloat(pod_zal) * 0.17 - 43.76).toFixed(2);
          }

          zaliczka = (parseFloat(pod_zal) * 0.12 - 300) < 0 ? 0 : (parseFloat(pod_zal) * 0.12 - 300).toFixed(0);
          zal_2021 = (parseFloat(pod_zal) * 0.17 - 43.76).toFixed(2);

          podstawa_zdrow = (roundUpToCent(customGrossAmount) - roundUpToCent(customGrossAmount * 0.0976) - roundUpToCent(customGrossAmount * 0.015) - roundUpToCent(customGrossAmount * 0.0245) + parseFloat(wynChorobowe)).toFixed(2);

          zdrowotne = parseFloat(zal_2021) < parseFloat(podstawa_zdrow) * 0.09
            ? parseFloat(zal_2021)
            : (parseFloat(podstawa_zdrow) * 0.09).toFixed(2);
          netAmount = (
            parseFloat(podstawa_zdrow) - parseFloat(zdrowotne) - parseFloat(zaliczka)
          ).toFixed(2);
        } else if (breakType === 'bezpłatny') {
          customGrossAmount = (grossAmount - (grossAmount / 168 * (daysOfBreak + additionalDays) * 8)).toFixed(2);
          podstawa_zdrow = (roundUpToCent(customGrossAmount) - roundUpToCent(customGrossAmount * 0.0976) - roundUpToCent(customGrossAmount * 0.015) - roundUpToCent(customGrossAmount * 0.0245) + parseFloat(wynChorobowe)).toFixed(2);
          pod_zal = ((customGrossAmount - (0.1371 * customGrossAmount)) + parseFloat(wynChorobowe) - 250).toFixed(0);
          zaliczka = (parseFloat(pod_zal) * 0.12 - 300) < 0 ? 0 : (parseFloat(pod_zal) * 0.12 - 300).toFixed(0);
          zal_2021 = (parseFloat(pod_zal) * 0.17 - 43.76).toFixed(2);
          zdrowotne = parseFloat(zal_2021) < parseFloat(podstawa_zdrow) * 0.09
            ? parseFloat(zal_2021)
            : (parseFloat(podstawa_zdrow) * 0.09).toFixed(2);
          netAmount = (
            parseFloat(podstawa_zdrow) - parseFloat(zdrowotne) - parseFloat(zaliczka)
          ).toFixed(2);

          // Add your "bezpłatny" specific calculations here
        } else {
          podstawa_zdrow = (customGrossAmount - (customGrossAmount * 0.0976) - (customGrossAmount * 0.015) - (customGrossAmount * 0.0245) + parseFloat(wynChorobowe)).toFixed(2);

          const podstawa_zaliczki = (pod_zal - 250).toFixed(0);
          zal_2021 = (parseFloat(pod_zal) * 0.17 - 43.76).toFixed(2);
          zaliczka = (parseFloat(pod_zal) * 0.12 - 300) < 0 ? 0 : (parseFloat(pod_zal) * 0.12 - 300).toFixed(0);

          zdrowotne = parseFloat(zal_2021) < parseFloat(podstawa_zdrow) * 0.09
            ? parseFloat(zal_2021)
            : (parseFloat(podstawa_zdrow) * 0.09).toFixed(2);
          netAmount = (
            parseFloat(podstawa_zdrow) - parseFloat(zdrowotne) - parseFloat(zaliczka)
          ).toFixed(2);
        }

        // Calculate other fields
        const ulga = (300).toFixed(2);
        const koszty = (250).toFixed(2);
        const social_base = customGrossAmount;

        return {
          ...calculateSalary(customGrossAmount, daysOfBreak, breakType, additionalDays, additionalBreakType),
          wyn_chorobowe: wynChorobowe,
          podstawa_zdrow: podstawa_zdrow,
          podstawa_zaliczki: pod_zal,
          zdrowotne: zdrowotne,
          zal_2021: zal_2021,
          zaliczka: zaliczka,
          netAmount: netAmount,
          additionalDays: additionalDays
          // Include other fields as needed
          // Include podstawa_zdrow in the result
          // Set other fields with their calculated values based on customGrossAmount
        };
      });

      return { ...employee, contracts: updatedContracts };
    }
    return employee;
  });
  setCalculatedContracts(updatedEmployees);
};



const renderEmployeeTable = () => {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (validContracts.length === 0) {
    return <div>No employees with valid contracts for the selected month and year.</div>;
  }

  // The return statement should be placed here, inside the function
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
            {/* Add more table headers for contract properties */}
            <th>Przerwa od</th>
            <th>Przerwa do</th>
            <th>Dni</th>
            <th>typ</th>
            <th>Brutto</th>
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
        {validContracts.map((contract, index) => {
            return (
              <tr key={index}>
                <td>{contract.employee_id}</td>
                <td>{contract.name}</td>
                <td>{contract.surname}</td>
        <td>
          <DatePicker
            selected={healthBreaks[index].startDate || null}
            selectsStart
            startDate={healthBreaks[index].startDate}
            endDate={healthBreaks[index].endDate}
            onChange={(date) => handleHealthBreakStartDateChange(date, index)}
            dateFormat="dd/MM/yyyy"
          />
        </td>
        <td>
          <DatePicker
            selected={healthBreaks[index].endDate || null}
            selectsEnd
            startDate={healthBreaks[index].startDate}
            endDate={healthBreaks[index].endDate}
            onChange={(date) => handleHealthBreakEndDateChange(date, index)}
            dateFormat="dd/MM/yyyy"
          />
        </td>
        <td>{healthBreaks[index].days}</td>
        <td>
          <div>
            <select
              value={healthBreaks[index].type || ''}
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
        <td>{contract.gross_amount}</td>
        <td>{contract.social_base}</td>
    <td>{contract.wyn_chorobowe}</td>
    <td>{contract.emeryt_pr}</td>
    <td>{contract.emeryt_ub}</td>
    <td>{contract.rent_pr}</td>
    <td>{contract.rent_ub}</td>
    <td>{contract.chorobowe}</td>
    <td>{contract.wypadkowe}</td>
    <td>{contract.FP}</td>
    <td>{contract.FGSP}</td>
    <td>{contract.podstawa_zdrow}</td>
    <td>{contract.zdrowotne}</td>
    <td>{contract.koszty}</td>
    <td>{contract.podstawa_zaliczki}</td>
    <td>{contract.ulga}</td>
    <td>{contract.zaliczka}</td>
    <td>{contract.zal_2021}</td>
    <td>{contract.netAmount}</td>
        {/* Add more table cells for contract properties */}
      </tr>
  );
})}
{/* Additional breaks */}
{additionalBreaks.length > 0 && additionalBreaks.map((breakData, breakIndex) => (
  <tr key={breakIndex}>
    {/* Render the additional break rows only if additional breaks exist */}
    <td>
      <div>
        <DatePicker
          selected={breakData.startDate || null}
          selectsStart
          startDate={breakData.startDate}
          endDate={breakData.endDate}
          onChange={(date) => handleAdditionalBreakStartDateChange(date, breakIndex)}
          dateFormat="dd/MM/yyyy"
        />
      </div>
    </td>
    <td>
      <div>
        <DatePicker
          selected={breakData.endDate || null}
          selectsEnd
          startDate={breakData.startDate}
          endDate={breakData.endDate}
          onChange={(date) => handleAdditionalBreakEndDateChange(date, breakIndex)}
          dateFormat="dd/MM/yyyy"
        />
      </div>
    </td>
    <td>{additionalBreaks[breakIndex].additionalDays}</td>
    <td>
      <select
        value={breakData.type || ''}
        onChange={(e) => handleAdditionalBreakTypeChange(e, breakIndex)}
      >
        <option value="">Jaka przerwa</option>
        <option value="brak">Brak</option>
        <option value="zwolnienie">Zwolnienie</option>
        <option value="bezpłatny">Bezpłatny</option>
        <option value="nieobecność">Nieobecność</option>
      </select>
    </td>
    <td>
      <button onClick={() => deleteAdditionalBreak(breakIndex)}>Delete Przerwa</button>
    </td>
  </tr>
))}

        </tbody>
      </table>
      <button onClick={handleCalculateSalary}>Wylicz wynagrodzenie</button>
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