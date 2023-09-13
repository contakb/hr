import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function SalaryCalculationForm() {
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [salaryDate, setSalaryDate] = useState('');


  useEffect(() => {
    const { state } = location;
    if (state && state.employeesData) {
      const { employeesData, month, year } = state; // Get month and year from location.state
      setMonth(month);
      setYear(year);

      const initializedEmployees = employeesData.map((employee) => {
        return {
          ...employee,
          contracts: employee.gross_amount ? employee.gross_amount.map(() => ({})) : [],
        };
      });
      setEmployees(initializedEmployees);
    }
  }, [location]);

  const calculateSalary = (grossAmount) => {
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
      };
    }

	const emeryt_pr = (grossAmountValue * 0.0976).toFixed(2);
	const emeryt_ub = (grossAmountValue * 0.0976).toFixed(2);
	const rent_pr = (grossAmountValue * 0.065).toFixed(2);
	const rent_ub = (grossAmountValue * 0.015).toFixed(2);
	const chorobowe = (grossAmountValue * 0.0245).toFixed(2);
	const wypadkowe = (grossAmountValue * 0.0167).toFixed(2);
	const FP = (grossAmountValue * 0.0245).toFixed(2);
	const FGSP = (grossAmountValue * 0.001).toFixed(2);
	const podstawa_zdrow = (grossAmountValue - emeryt_ub - rent_ub - chorobowe).toFixed(2);
	const podstawa_zaliczki = (podstawa_zdrow - 250).toFixed(0);
	const zaliczka = ((podstawa_zaliczki * 0.12) - 300) < 0 ? 0 : ((podstawa_zaliczki * 0.12) - 300).toFixed(0);
	const zal_2021 = (podstawa_zaliczki * 0.17 - 43.76).toFixed(2);
	const zdrowotne = zal_2021 < (podstawa_zdrow * 0.09) ? zal_2021 : (podstawa_zdrow * 0.09).toFixed(2);
	const netAmount = (podstawa_zdrow - zdrowotne - zaliczka).toFixed(2);
	const ulga = (300).toFixed(2);
	const koszty = (250).toFixed(2);

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
	  zal_2021
    };
  };

  const handleCalculateSalary = () => {
    const updatedEmployees = employees.map((employee) => {
      if (employee.gross_amount && employee.gross_amount.length > 0) {
        const updatedContracts = employee.gross_amount.map((grossAmount) =>
          calculateSalary(grossAmount)
        );
        return { ...employee, contracts: updatedContracts };
      }
      return employee;
    });

    setEmployees(updatedEmployees);
  };
  
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
            <th>Brutto</th>
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
                      <React.Fragment>
                        <td rowSpan={contracts.length}>{id}</td>
                        <td rowSpan={contracts.length}>{name}</td>
                        <td rowSpan={contracts.length}>{surname}</td>
                      </React.Fragment>
                    ) : null}
                    <td>{employee.gross_amount[contractIndex]}</td>
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
