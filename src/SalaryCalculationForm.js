import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker'; // Import DatePicker
import 'react-datepicker/dist/react-datepicker.css'; // Import styles

function SalaryCalculationForm() {
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [salaryDate, setSalaryDate] = useState('');
  const [healthBreaks, setHealthBreaks] = useState([]); // Initialize healthBreaks as an empty array
  const [duplicateRowIndex, setDuplicateRowIndex] = useState(null); // Track the index of the row to duplicate
  const [additionalBreaks, setAdditionalBreaks] = useState([]);
  const [additionalBreakDays, setAdditionalBreakDays] = useState([]);
  const [additionalDays, setAdditionalDays] = useState(0);
const [additionalBreakType, setAdditionalBreakType] = useState('');




  

useEffect(() => {
  const { state } = location;
  if (state && state.employeesData) {
	  
    const { employeesData, month, year } = state;
    setMonth(month);
    setYear(year);

    const initializedEmployees = employeesData.map((employee) => {
      const numberOfBreaks = employee.gross_amount ? employee.gross_amount.length : 0;

      const healthBreaks = new Array(numberOfBreaks).fill({
        startDate: null,
        endDate: null,
        type: '',
        days: 0,
		additionalDays: 0,
  additionalBreakType: '', // Include additionalBreakType here
      });

      const additionalBreaks = new Array(numberOfBreaks).fill({
        startDate: null,
        endDate: null,
        type: '',
        additionalDays: 0,
		additionalBreakType: '',
      });
	  
	  

      return {
        ...employee,
        contracts: employee.gross_amount ? employee.gross_amount.map(() => ({})) : [],
        breaks: [], // Initialize the breaks array here
        healthBreaks: healthBreaks,
        additionalBreaks: additionalBreaks,
      };
    });

    // Initialize healthBreaks for each employee
    const initializedHealthBreaks = employeesData.map(() => ({
      startDate: null,
      endDate: null,
      type: '',
      days: 0,
    }));
	
const initializedAdditionalBreaks = employeesData.map((employee) => ({
	
  startDate: null,
  endDate: null,
  type: '',
  additionalDays: 0,
  additionalBreakType: '', // Include additionalBreakType here
}));

setEmployees(initializedEmployees);
setHealthBreaks(initializedHealthBreaks);
setAdditionalBreaks(initializedAdditionalBreaks);



  }
}, [location]);




// ...

console.log('additionalBreaks length:', additionalBreaks.length);

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


const calculateSalary = (grossAmount, daysOfBreak) => {
  const grossAmountValue = parseFloat(grossAmount);

  if (isNaN(grossAmountValue)) {
    return {
        grossAmount: '',
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
    grossAmountValue - emeryt_ub - rent_ub - chorobowe).toFixed(2);
	const podstawa_zaliczki = (podstawa_zdrow - 250).toFixed(0);
	const zaliczka = ((podstawa_zaliczki * 0.12) - 300) < 0 ? 0 : ((podstawa_zaliczki * 0.12) - 300).toFixed(0);
	const zal_2021 = (podstawa_zaliczki * 0.17 - 43.76).toFixed(2);
	const zdrowotne = zal_2021 < (podstawa_zdrow * 0.09) ? zal_2021 : (podstawa_zdrow * 0.09).toFixed(2);
	const netAmount = (podstawa_zdrow - zdrowotne - zaliczka).toFixed(2);
	const ulga = (300).toFixed(2);
	const koszty = (250).toFixed(2);
	const social_base = grossAmountValue
	

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
  const updatedEmployees = employees.map((employee) => {
    if (employee.gross_amount && employee.gross_amount.length > 0) {
      const updatedContracts = employee.gross_amount.map((grossAmount, index) => {
        const daysOfBreak = parseInt(healthBreaks[index].days, 10) || 0;
        const breakType = healthBreaks[index].type || '';
		const additionalDays = parseInt(additionalBreaks[index].additionalDays, 10) || 0; // Get additionalDays for the corresponding break
        const additionalBreakType = additionalBreaks[index].type || ''; // Get additionalBreakType for the corresponding break
		
		

        let customGrossAmount = grossAmount;
        let wynChorobowe = 0;
        let pod_zal = ((grossAmount - (0.1371 * grossAmount)) - 250).toFixed(0);
        let zal_2021;
        let zaliczka;
        let zdrowotne;
        let netAmount;

        // Declare and initialize emeryt_ub
        let emeryt_ub = roundUpToCent(customGrossAmount * 0.0976).toFixed(2);
        let emeryt_pr = roundUpToCent(customGrossAmount * 0.0976).toFixed(2);
        let rent_pr = roundUpToCent(customGrossAmount * 0.065).toFixed(2);
        let rent_ub = roundUpToCent(customGrossAmount * 0.015).toFixed(2);
        let chorobowe = roundUpToCent(customGrossAmount * 0.0245).toFixed(2);

        let podstawa_zdrow;

        if (breakType === 'zwolnienie') {
          // Calculate customGrossAmount differently for "zwolnienie"
          customGrossAmount = (grossAmount - (grossAmount / 30 * daysOfBreak)).toFixed(2);
          wynChorobowe = (((grossAmount - 0.1371 * grossAmount) / 30) * ((daysOfBreak) * 0.8)).toFixed(2);
          pod_zal = ((customGrossAmount - (0.1371 * customGrossAmount)) + parseFloat(wynChorobowe) - 250).toFixed(0);
		  
		  

          if (additionalBreakType === 'bezpłatny') {
			  
            
			// Calculate additional customGrossAmount for "bezpłatny" with additionalDays
            customGrossAmount -= (grossAmount / 168 * additionalDays * 8).toFixed(2);
            
            // Calculate fields for "bezpłatny"
            
			podstawa_zdrow = (roundUpToCent(customGrossAmount) - roundUpToCent(customGrossAmount * 0.0976) - roundUpToCent(customGrossAmount * 0.015) - roundUpToCent(customGrossAmount * 0.0245) + parseFloat(wynChorobowe)).toFixed(2);
			pod_zal = ((customGrossAmount - (0.1371 * customGrossAmount)) + parseFloat(wynChorobowe) - 250).toFixed(0);
            zaliczka = (parseFloat(pod_zal) * 0.12 - 300) < 0 ? 0 : (parseFloat(pod_zal) * 0.12 - 300).toFixed(0);
			zal_2021 = (parseFloat(pod_zal) * 0.17 - 43.76).toFixed(2);
			}
		  if (additionalBreakType === 'zwolnienie') {
            // Calculate additional customGrossAmount for "bezpłatny" with additionalDays
            customGrossAmount = (grossAmount - (grossAmount / 30 * (daysOfBreak+additionalDays))).toFixed(2);
			wynChorobowe = (((grossAmount - 0.1371 * grossAmount) / 30) * ((daysOfBreak+additionalDays) * 0.8)).toFixed(2);
            
            // Calculate fields for "bezpłatny"
            
			podstawa_zdrow = (roundUpToCent(customGrossAmount) - roundUpToCent(customGrossAmount * 0.0976) - roundUpToCent(customGrossAmount * 0.015) - roundUpToCent(customGrossAmount * 0.0245) + parseFloat(wynChorobowe)).toFixed(2);
			pod_zal = ((customGrossAmount - (0.1371 * customGrossAmount)) + parseFloat(wynChorobowe) - 250).toFixed(0);
            zaliczka = (parseFloat(pod_zal) * 0.12 - 300) < 0 ? 0 : (parseFloat(pod_zal) * 0.12 - 300).toFixed(0);
			zal_2021 = (parseFloat(pod_zal) * 0.17 - 43.76).toFixed(2);
		  
		  }

          // Calculate fields for "zwolnienie"
          zaliczka = (parseFloat(pod_zal) * 0.12 - 300) < 0 ? 0 : (parseFloat(pod_zal) * 0.12 - 300).toFixed(0);
          zal_2021 = (parseFloat(pod_zal) * 0.17 - 43.76).toFixed(2);

          // Calculate podstawa_zdrow here for "zwolnienie"
          podstawa_zdrow = (roundUpToCent(customGrossAmount) - roundUpToCent(customGrossAmount * 0.0976) - roundUpToCent(customGrossAmount * 0.015) - roundUpToCent(customGrossAmount * 0.0245) + parseFloat(wynChorobowe)).toFixed(2);

          // Calculate zdrowotne for "zwolnienie"
          zdrowotne = parseFloat(zal_2021) < parseFloat(podstawa_zdrow) * 0.09
            ? parseFloat(zal_2021)
            : (parseFloat(podstawa_zdrow) * 0.09).toFixed(2);
          netAmount = (
            parseFloat(podstawa_zdrow) - parseFloat(zdrowotne) - parseFloat(zaliczka)
          ).toFixed(2);
        } else if (breakType === 'bezpłatny') {
          // Calculate customGrossAmount for "bezpłatny"
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
          
          // Calculate fields for "bezpłatny"
          // Add your "bezpłatny" specific calculations here
        } else {
		 customGrossAmount = grossAmount;
          // Calculate fields for other scenarios
          podstawa_zdrow = (customGrossAmount - (customGrossAmount * 0.0976) - (customGrossAmount * 0.015) - (customGrossAmount * 0.0245) + parseFloat(wynChorobowe)).toFixed(2);

          const podstawa_zaliczki = (pod_zal - 250).toFixed(0);
          zal_2021 = (parseFloat(pod_zal) * 0.17 - 43.76).toFixed(2);
          zaliczka = (parseFloat(pod_zal) * 0.12 - 300) < 0 ? 0 : (parseFloat(pod_zal) * 0.12 - 300).toFixed(0);

          // Calculate zdrowotne for other scenarios
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
          ...calculateSalary(customGrossAmount, daysOfBreak, additionalDays),
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

  setEmployees(updatedEmployees);
};



// Similarly, create functions for endDate and type changes, and for deleting additional breaks.


  
const handleSaveSalaryData = () => {
  const salaryData = [];

  employees.forEach((employee) => {
    if (!employee.contracts || employee.contracts.length === 0) {
      return; // Skip employees without valid contracts
    }

    employee.contracts.forEach((contract) => {
      const salary = {
        employee_id: employee.id,
        gross_total: parseFloat(contract.grossAmount), // Convert to float or decimal
        social_base: parseFloat(contract.grossAmount), // Use grossAmount for both gross_total and social_base
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
        koszty: parseFloat(contract.koszty),
        tax_base: parseFloat(contract.podstawa_zaliczki),
        ulga: parseFloat(contract.ulga),
        tax: parseFloat(contract.zaliczka),
        zal_2021: parseFloat(contract.zal_2021),
        net_amount: parseFloat(contract.netAmount),
        salary_month: month, // Assuming month is available in the state
        salary_year: year, // Assuming year is available in the state
        salary_date: salaryDate, // Assuming salaryDate is available in the state
        created_at: new Date().toISOString(), // Get the current date for created_at
        updated_at: new Date().toISOString(), // Get the current date for updated_at
      };

      salaryData.push(salary);
    });
  });



  // Send a POST request to the server to save the salary data
axios
  .post('http://localhost:3001/api/save-salary-data', salaryData)
  .then((response) => {
    // Handle the response, e.g., show a success message to the user
    alert('Salary data saved successfully!');
  })
  .catch((error) => {
    // Handle any errors that occurred during the request
    console.error('Error saving salary data:', error);
    alert('Error saving salary data. Please try again later.');
  });

};


console.log('additionalBreaks:', additionalBreaks);


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
{employees.map((employee, index) => {
  const { name, id, surname, contracts } = employee;

  // Check if the employee has valid contracts
  if (!contracts || contracts.length === 0) {
    return null; // Skip employees without valid contracts
  }

  return (
    <React.Fragment key={index}>
{contracts.map((contract, contractIndex) => (
  <tr key={`${index}-${contractIndex}`}>
    {contractIndex === 0 ? (
      <>
        <td rowSpan={contracts.length}>{id}</td>
        <td rowSpan={contracts.length}>{name}</td>
        <td rowSpan={contracts.length}>{surname}</td>
      </>
    ) : null}
    <td>
      <div>
        <DatePicker
          selected={healthBreaks[index].startDate || null}
          selectsStart
          startDate={healthBreaks[index].startDate}
          endDate={healthBreaks[index].endDate}
          onChange={(date) => handleHealthBreakStartDateChange(date, index)}
          dateFormat="dd/MM/yyyy"
        />
      </div>
    </td>
    <td>
      <div>
        <DatePicker
          selected={healthBreaks[index].endDate || null}
          selectsEnd
          startDate={healthBreaks[index].startDate}
          endDate={healthBreaks[index].endDate}
          onChange={(date) => handleHealthBreakEndDateChange(date, index)}
          dateFormat="dd/MM/yyyy"
        />
      </div>
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
    <td>{employee.gross_amount[contractIndex]}</td>
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
  </tr>
))}

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



    </React.Fragment>
  );
})}


        </tbody>
      </table>
      <button onClick={handleCalculateSalary}>Wylicz wynagrodzenie</button>
      <button onClick={handleSaveSalaryData}>Zapisz liste plac</button>
    </div>
  );
}


export default SalaryCalculationForm;