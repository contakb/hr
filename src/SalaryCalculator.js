import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import axiosInstance from './axiosInstance';
import { toast } from 'react-toastify';

const SalaryCalculator = ({ grossAmount: initialGrossAmount, employeeId }) => {
  const [salaryDetails, setSalaryDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editableGrossAmount, setEditableGrossAmount] = useState(initialGrossAmount); // Editable gross amount state
  const { user } = useUser();
  const [showDetails, setShowDetails] = useState(false); // State for toggling more details

  useEffect(() => {
    console.log('SalaryCalculator Component Initialized');
    console.log(`Received Props - initialGrossAmount: ${initialGrossAmount}, employeeId: ${employeeId}`);
    setEditableGrossAmount(initialGrossAmount); // Initialize editableGrossAmount with the initial grossAmount
  }, [initialGrossAmount, employeeId]);

  const fetchAllParameters = async (employeeId) => {
    try {
      const response = await axiosInstance.get(`/api/employee-params/${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName,
        }
      });
      const params = response.data.parameters[0] || {};
      const koszty = params.koszty ?? 250;
      const ulga = params.ulga ?? 300;

      console.log(`Parameters fetched for employee ${employeeId}: koszty=${koszty}, ulga=${ulga}`);
      const usedDefault = params.koszty === undefined || params.ulga === undefined;

      if (usedDefault) {
        toast.warn(`Using default tax parameters for employee ID: ${employeeId}. Koszty: 250, Ulga: 300`);
      }

      return { koszty, ulga, usedDefault };
    } catch (error) {
      console.error(`Error fetching parameters for employee ${employeeId}:`, error);
      
      return { koszty: 250, ulga: 300, usedDefault: true };
    }
  };

  const fetchEmployee = async (employeeId) => {
    try {
      const response = await axiosInstance.get(`/api/employees/${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName,
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee with ID ${employeeId}:`, error);
      return null;
    }
  };

  const getAgeFromPesel = (pesel) => {
    if (!pesel || pesel.length !== 11) return null;
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

  const calculateSalary = (grossAmount, employee, koszty, ulga) => {
    console.log(`Calculating salary for employee ID ${employee.employee_id || employee.id}`);
    console.log(`Koszty: ${koszty}, Ulga: ${ulga}`);

    let customGrossAmount = parseFloat(grossAmount);
    customGrossAmount = customGrossAmount > 0 ? customGrossAmount : 0;

    const emeryt_pr = (customGrossAmount * 0.0976).toFixed(2);
    const emeryt_ub = (customGrossAmount * 0.0976).toFixed(2);
    const rent_pr = (customGrossAmount * 0.065).toFixed(2);
    const rent_ub = (customGrossAmount * 0.015).toFixed(2);
    const chorobowe = (customGrossAmount * 0.0245).toFixed(2);
    const wypadkowe = (customGrossAmount * 0.0167).toFixed(2);
    const FP = (customGrossAmount * 0.0245).toFixed(2);
    const FGSP = (customGrossAmount * 0.001).toFixed(2);

    let podstawa_zdrow = (customGrossAmount - customGrossAmount * 0.0976 - customGrossAmount * 0.015 - customGrossAmount * 0.0245).toFixed(2);

    let pod_zal = (customGrossAmount - customGrossAmount * 0.1371 - koszty).toFixed(2);
    let currentMonthTaxBase = parseFloat(pod_zal);
    let newAccumulatedTaxBase = currentMonthTaxBase;

    console.log(`Current Month Tax Base: ${currentMonthTaxBase}`);
    console.log(`New Accumulated Tax Base: ${newAccumulatedTaxBase}`);

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

    let zaliczka = tax - ulga;
    zaliczka = zaliczka < 0 ? 0 : zaliczka.toFixed(0);

    let zal_2021 = (parseFloat(pod_zal) * 0.17 - (ulga === 0 ? 0 : 43.76)).toFixed(2);
    zal_2021 = zal_2021 > 0 ? zal_2021 : '0';
    let zdrowotne = parseFloat(zal_2021) < parseFloat(podstawa_zdrow) * 0.09 ? parseFloat(zal_2021) : (parseFloat(podstawa_zdrow) * 0.09).toFixed(2);

    let netAmount = (parseFloat(podstawa_zdrow) - parseFloat(zdrowotne) - parseFloat(zaliczka)).toFixed(2);

    return {
      grossAmount,
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
      podstawa_zaliczki: pod_zal,
      zaliczka,
      zal_2021,
      zdrowotne,
      ulga,
      koszty,
      social_base: customGrossAmount
    };
  };

  const handleCalculate = async () => {
    setLoading(true);
    const employee = await fetchEmployee(employeeId);
    if (!employee) {
      setLoading(false);
      toast.error(`Employee data not found for ID: ${employeeId}`);
      return;
    }
    const { koszty, ulga, usedDefault } = await fetchAllParameters(employeeId);

    if (usedDefault) {
      toast.warn(`Using default tax parameters for employee ID: ${employeeId}. Koszty: 250, Ulga: 300`);
    }

    const salaryDetails = calculateSalary(editableGrossAmount, employee, koszty, ulga);
    setSalaryDetails(salaryDetails);
    setLoading(false);
  };

  return (
    <div className="salary-selection-page">
      
      
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Gross Amount:</label>
          <input
            type="text"
            value={editableGrossAmount}
            onChange={(e) => setEditableGrossAmount(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={handleCalculate}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Recalculate
          </button>
        </div>
        {loading && <p className="text-blue-500">Loading...</p>}
        {salaryDetails && (
          <div className="salary-details mt-6">
            <h2 className="text-2xl font-bold mb-4">Salary Details</h2>
            <p className="text-sm text-gray-600"><strong>Gross Amount:</strong> {salaryDetails.grossAmount}</p>
            <p className="text-lg font-semibold text-green-500"><strong>Net Amount:</strong> {salaryDetails.netAmount}</p>
            {showDetails && (
              <>
                <p className="text-sm text-gray-600"><strong>Emeryt Pracownik:</strong> {salaryDetails.emeryt_pr}</p>
                <p className="text-sm text-gray-600"><strong>Emeryt Ubezpieczyciel:</strong> {salaryDetails.emeryt_ub}</p>
                <p className="text-sm text-gray-600"><strong>Rent Pracownik:</strong> {salaryDetails.rent_pr}</p>
                <p className="text-sm text-gray-600"><strong>Rent Ubezpieczyciel:</strong> {salaryDetails.rent_ub}</p>
                <p className="text-sm text-gray-600"><strong>Chorobowe:</strong> {salaryDetails.chorobowe}</p>
                <p className="text-sm text-gray-600"><strong>Wypadkowe:</strong> {salaryDetails.wypadkowe}</p>
                <p className="text-sm text-gray-600"><strong>FP:</strong> {salaryDetails.FP}</p>
                <p className="text-sm text-gray-600"><strong>FGSP:</strong> {salaryDetails.FGSP}</p>
                <p className="text-sm text-gray-600"><strong>Podstawa Zdrow:</strong> {salaryDetails.podstawa_zdrow}</p>
                <p className="text-sm text-gray-600"><strong>Podstawa Zaliczki:</strong> {salaryDetails.podstawa_zaliczki}</p>
                <p className="text-sm text-gray-600"><strong>Zaliczka:</strong> {salaryDetails.zaliczka}</p>
                <p className="text-sm text-gray-600"><strong>Zal 2021:</strong> {salaryDetails.zal_2021}</p>
                <p className="text-sm text-gray-600"><strong>Zdrowotne:</strong> {salaryDetails.zdrowotne}</p>
                <p className="text-sm text-gray-600"><strong>Ulga:</strong> {salaryDetails.ulga}</p>
                <p className="text-sm text-gray-600"><strong>Koszty:</strong> {salaryDetails.koszty}</p>
                <p className="text-sm text-gray-600"><strong>Social Base:</strong> {salaryDetails.social_base}</p>
              </>
            )}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-4 w-full bg-gray-300 text-black py-2 rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {showDetails ? 'Hide Details' : 'Show More Details'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


export default SalaryCalculator;
