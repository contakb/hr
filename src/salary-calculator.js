import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const SalaryCalculator = () => {
  const [employeeData, setEmployeeData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryDetails, setSalaryDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const grossAmountValue = location.state?.grossAmount || 0;

  const fetchAllParameters = async (employee) => {
    try {
      console.log(`Fetching parameters for employee ${employee.employee_id}`);
      const response = await axios.get(`http://localhost:3001/api/employee-params/${employee.employee_id}`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName,
        }
      });
      const params = response.data.parameters[0] || {}; 
      const { koszty = 250, ulga = 300 } = params;
      console.log(`Parameters fetched for employee ${employee.employee_id}: koszty=${koszty}, ulga=${ulga}`);
      return { ...employee, koszty, ulga };
    } catch (error) {
      console.error(`Error fetching parameters for employee ${employee.employee_id}:`, error);
      return employee;
    }
  };

  const getAgeFromPesel = (pesel) => {
    if (pesel.length !== 11) return null;
    let year = parseInt(pesel.substring(0, 2), 10);
    let month = parseInt(pesel.substring(2, 4), 10);
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
    const birthDate = new Date(year, month - 1, 1);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateSalary = (grossAmountValue, employee) => {
    console.log(`Calculating salary for employee ID ${employee.employee_id}`);
    const employeeKoszty = employee.koszty !== undefined ? employee.koszty : 250;
    const employeeUlga = employee.ulga !== undefined ? employee.ulga : 300;
    console.log(`Koszty: ${employeeKoszty}, Ulga: ${employeeUlga}`);

    let customGrossAmount = parseFloat(grossAmountValue);
    customGrossAmount = customGrossAmount > 0 ? customGrossAmount : 0;
    console.log("customGrossAmount:", customGrossAmount);

    // Calculate social security and health insurance contributions
    const emeryt_pr = (customGrossAmount * 0.0976).toFixed(2);
    const emeryt_ub = (customGrossAmount * 0.0976).toFixed(2);
    const rent_pr = (customGrossAmount * 0.065).toFixed(2);
    const rent_ub = (customGrossAmount * 0.015).toFixed(2);
    const chorobowe = (customGrossAmount * 0.0245).toFixed(2);
    const wypadkowe = (customGrossAmount * 0.0167).toFixed(2); // Assuming 1.67% for accident insurance
    const FP = (customGrossAmount * 0.0245).toFixed(2);
    const FGSP = (customGrossAmount * 0.001).toFixed(2);
    
    // Podstawa zdrowotne calculation
    let wyn_chorobowe = 0; // Placeholder if needed for additional calculations
    let podstawa_zdrow = (customGrossAmount - customGrossAmount * 0.0976 - customGrossAmount * 0.015 - customGrossAmount * 0.0245).toFixed(2);
    
    // Podstawa zaliczki calculation
    let pod_zal = (customGrossAmount - customGrossAmount * 0.1371 - employeeKoszty).toFixed(2);
    let currentMonthTaxBase = parseFloat(pod_zal);
    let newAccumulatedTaxBase = currentMonthTaxBase;

    console.log(`Current Month Tax Base: ${currentMonthTaxBase}`);
    console.log(`New Accumulated Tax Base: ${newAccumulatedTaxBase}`);

    // Tax calculation
    const taxThreshold = 120000;
    const youngEmployeeTaxThreshold = 85528;
    let tax;

    const age = getAgeFromPesel(employee.pesel);
    if (employee.pesel && age <= 26) {
      if (newAccumulatedTaxBase <= youngEmployeeTaxThreshold) {
        tax = 0;
      } else if (newAccumulatedTaxBase <= taxThreshold) {
        tax = (newAccumulatedTaxBase - youngEmployeeTaxThreshold) * 0.12;
      } else {
        const lowerBracketTax = (taxThreshold - youngEmployeeTaxThreshold) * 0.12;
        const higherBracketTax = (newAccumulatedTaxBase - taxThreshold) * 0.32;
        tax = lowerBracketTax + higherBracketTax;
      }
    } else {
      if (newAccumulatedTaxBase <= taxThreshold) {
        tax = currentMonthTaxBase * 0.12;
      } else {
        tax = currentMonthTaxBase * 0.32;
      }
    }

    let zaliczka = tax - employeeUlga;
    zaliczka = zaliczka < 0 ? 0 : zaliczka.toFixed(0);

    let zal_2021 = (parseFloat(pod_zal) * 0.17 - 43.76).toFixed(2);
    zal_2021 = zal_2021 > 0 ? zal_2021 : '0';
    let zdrowotne = parseFloat(zal_2021) < parseFloat(podstawa_zdrow) * 0.09 ? parseFloat(zal_2021) : (parseFloat(podstawa_zdrow) * 0.09).toFixed(2);

    let netAmount = (parseFloat(podstawa_zdrow) - parseFloat(zdrowotne) - parseFloat(zaliczka)).toFixed(2);

    return {
      grossAmount: grossAmountValue,
      netAmount,
      emeryt_pr,
      emeryt_ub,
      rent_pr,
      rent_ub,
      chorobowe,
      wypadkowe,
      FP,
      FGSP,
      wyn_chorobowe: wyn_chorobowe.toFixed(2),
      podstawa_zdrow,
      podstawa_zaliczki: pod_zal,
      zaliczka,
      zal_2021,
      zdrowotne,
      ulga: employeeUlga,
      koszty: employeeKoszty,
      social_base: customGrossAmount
    };
  };

  const handleCalculate = async () => {
    if (!selectedEmployee) return;
    setLoading(true);
    const updatedEmployee = await fetchAllParameters(selectedEmployee);
    const salaryDetails = calculateSalary(grossAmountValue, updatedEmployee);
    setSalaryDetails(salaryDetails);
    setLoading(false);
  };

  useEffect(() => {
    // Fetch employee data and setEmployeeData
  }, []);

  return (
    <div className="salary-selection-page">
      <h1>Salary Calculator</h1>
      <div className="employee-list">
        {employeeData.map((employee) => (
          <div key={employee.employee_id} className="employee-card" onClick={() => setSelectedEmployee(employee)}>
            <h2>{employee.name} {employee.surname}</h2>
            <button onClick={handleCalculate}>Calculate Salary</button>
          </div>
        ))}
      </div>
      {loading && <p>Loading...</p>}
      {salaryDetails && (
        <div className="salary-details">
          <h2>Salary Details</h2>
          <p>Gross Amount: {salaryDetails.grossAmount}</p>
          <p>Net Amount: {salaryDetails.netAmount}</p>
          <p>Emeryt Pracownik: {salaryDetails.emeryt_pr}</p>
          <p>Emeryt Ubezpieczyciel: {salaryDetails.emeryt_ub}</p>
          <p>Rent Pracownik: {salaryDetails.rent_pr}</p>
          <p>Rent Ubezpieczyciel: {salaryDetails.rent_ub}</p>
          <p>Chorobowe: {salaryDetails.chorobowe}</p>
          <p>Wypadkowe: {salaryDetails.wypadkowe}</p>
          <p>FP: {salaryDetails.FP}</p>
          <p>FGSP: {salaryDetails.FGSP}</p>
          <p>Wyn Chorobowe: {salaryDetails.wyn_chorobowe}</p>
          <p>Podstawa Zdrow: {salaryDetails.podstawa_zdrow}</p>
          <p>Podstawa Zaliczki: {salaryDetails.podstawa_zaliczki}</p>
          <p>Zaliczka: {salaryDetails.zaliczka}</p>
          <p>Zal 2021: {salaryDetails.zal_2021}</p>
          <p>Zdrowotne: {salaryDetails.zdrowotne}</p>
          <p>Ulga: {salaryDetails.ulga}</p>
          <p>Koszty: {salaryDetails.koszty}</p>
          <p>Social Base: {salaryDetails.social_base}</p>
        </div>
      )}
    </div>
  );
};

export default SalaryCalculator;
