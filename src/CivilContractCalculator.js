import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance'; // Adjust to your setup
import { useUser } from './UserContext';
import { toast } from 'react-toastify';

const CivilContractCalculator = ({ grossAmount, prawaAutorskie, employeeId, employeePesel, onClose, contractType }) => {
  const [netAmount, setNetAmount] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState({});
  const [ulga, setUlga] = useState(0);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [employmentType, setEmploymentType] = useState('employee'); // Add employmentType state

  // Helper to calculate age from PESEL
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

  // Fetch parameters (ulga) for the employee
  // Fetch parameters (ulga) for the employee based on contract_type
  const fetchAllParameters = async (employeeId) => {
    try {
      const response = await axiosInstance.get(`/api/employee-params/${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName,
        },
      });
  
      // Filter the parameters for the 'umowa_cywilnoprawna' contract type
      const cywilnoprawnaParams = response.data.parameters.find(param => param.contract_type === 'umowa_cywilnoprawna');
  
      if (cywilnoprawnaParams) {
        const ulgaValue = cywilnoprawnaParams.ulga ?? 300; // Default to 300 if not provided
        setUlga(ulgaValue);
  
        
      } else {
        // No parameters for 'umowa_cywilnoprawna' found
        setUlga(300); // Use default ulga if none found
        alert('Brak parametrów dla umowa cywilnoprawna. Proszę dodać nowe w ustawieniach danych pracownika. Przyjęta została ulga 300 zł');
      }
    } catch (error) {
      console.error(`Error fetching parameters for employee ${employeeId}:`, error);
      setUlga(300); // Use default if there's an error
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

  const calculateNetAmount = (grossAmount, isPrawaAutorskie, employee, ulga, employmentType, contractType) => {
    const kosztyUzyskania = isPrawaAutorskie ? 0.5 : 0.2; // 50% for prawa autorskie, otherwise 20%

    // Social security contributions (umowa zlecenie)
    let emeryt_pr = 0, emeryt_ub = 0, rent_pr = 0, rent_ub = 0, chorobowe = 0, wypadkowe = 0, FP = 0, FGSP = 0, zdrowotne = 0;
    let podstawa_zdrow = 0;

    // Determine contributions based on contract type and employment type
    if (contractType === 'umowa_o_dzielo') {
      if (employmentType === 'employee') {
        // Full insurance for own employee (umowa o dzieło)
        emeryt_pr = (grossAmount * 0.0976).toFixed(2);
        emeryt_ub = (grossAmount * 0.0976).toFixed(2);
        rent_pr = (grossAmount * 0.065).toFixed(2);
        rent_ub = (grossAmount * 0.015).toFixed(2);
        wypadkowe = (grossAmount * 0.0167).toFixed(2);
        chorobowe = (grossAmount * 0.0245).toFixed(2);
        FP = (grossAmount * 0.0245).toFixed(2);
        FGSP = (grossAmount * 0.001).toFixed(2);
        podstawa_zdrow = (grossAmount - emeryt_ub - rent_ub - chorobowe).toFixed(2); // Exclude chorobowe for umowa o dzieło
        zdrowotne = (podstawa_zdrow * 0.09).toFixed(2);
      } else {
        // No insurance for umowa o dzieło without employee status
        zdrowotne = 0;
      }
    } else {
      // Umowa Zlecenie
      switch (employmentType) {
        case 'employee':
          emeryt_pr = (grossAmount * 0.0976).toFixed(2);
          emeryt_ub = (grossAmount * 0.0976).toFixed(2);
          rent_pr = (grossAmount * 0.065).toFixed(2);
          rent_ub = (grossAmount * 0.015).toFixed(2);
          chorobowe = (grossAmount * 0.0245).toFixed(2);
          wypadkowe = (grossAmount * 0.0167).toFixed(2);
          FP = (grossAmount * 0.0245).toFixed(2);
          FGSP = (grossAmount * 0.001).toFixed(2);
          podstawa_zdrow = (grossAmount - emeryt_ub - rent_ub - chorobowe).toFixed(2);
          zdrowotne = (podstawa_zdrow * 0.09).toFixed(2);
          break;

        case 'otherEmployment':
          podstawa_zdrow = grossAmount;
          zdrowotne = (podstawa_zdrow * 0.09).toFixed(2);
          break;

        case 'student':
          zdrowotne = 0; // No insurance, only tax
          
          break;

        case 'emeryt':
          emeryt_pr = (grossAmount * 0.0976).toFixed(2);
          emeryt_ub = (grossAmount * 0.0976).toFixed(2);
          rent_pr = (grossAmount * 0.065).toFixed(2);
          rent_ub = (grossAmount * 0.015).toFixed(2);
          wypadkowe = (grossAmount * 0.0167).toFixed(2);
          chorobowe = 0;
          FP = (grossAmount * 0.0245).toFixed(2);
          FGSP = (grossAmount * 0.001).toFixed(2);
          podstawa_zdrow = (grossAmount - emeryt_ub - rent_ub).toFixed(2); // Exclude chorobowe
          zdrowotne = (podstawa_zdrow * 0.09).toFixed(2);
          break;

        default:
          emeryt_pr = (grossAmount * 0.0976).toFixed(2);
          emeryt_ub = (grossAmount * 0.0976).toFixed(2);
          rent_pr = (grossAmount * 0.065).toFixed(2);
          rent_ub = (grossAmount * 0.015).toFixed(2);
          chorobowe = (grossAmount * 0.0245).toFixed(2);
          wypadkowe = (grossAmount * 0.0167).toFixed(2);
          FP = (grossAmount * 0.0245).toFixed(2);
          FGSP = (grossAmount * 0.001).toFixed(2);
          podstawa_zdrow = (grossAmount - emeryt_ub - rent_ub - chorobowe).toFixed(2);
          zdrowotne = (podstawa_zdrow * 0.09).toFixed(2);
          break;
      }
    }

    // Koszty Uzyskania and Podstawa Zaliczki calculation
   // Koszty Uzyskania and Podstawa Zaliczki calculation
  let kosztyUzyskaniaValue;
  if (employmentType === 'otherEmployment') {
    // No social security deduction, only koszty uzyskania (grossAmount * kosztyUzyskania)
    kosztyUzyskaniaValue = (grossAmount * kosztyUzyskania).toFixed(2);
  } else if (employmentType === 'emeryt') {
    // Deduct only 11.26% (13.71% - 2.45%) when no chorobowe
    kosztyUzyskaniaValue = ((grossAmount - 0.1126 * grossAmount) * kosztyUzyskania).toFixed(2);
  }  else if (employmentType === 'withoutInsurance') {
    // No social security deduction, only koszty uzyskania (grossAmount * kosztyUzyskania)
    kosztyUzyskaniaValue = (grossAmount * kosztyUzyskania).toFixed(2);
  } else {
    // Full social security deduction of 13.71%
    kosztyUzyskaniaValue = ((grossAmount - 0.1371 * grossAmount) * kosztyUzyskania).toFixed(2);
  } 

    const podstawa_zaliczki = (grossAmount - kosztyUzyskaniaValue - emeryt_ub - rent_ub - chorobowe).toFixed(0);

    // Fetch employee age from their PESEL
    const age = getAgeFromPesel(employee.pesel);
    const youngEmployeeTaxThreshold = 85528;
    let zaliczka = 0;

    // Determine if the employee is under 26 for tax exemption
    if (employmentType === 'student' || (age && age <= 26)) {
      zaliczka = 0;  // No income tax for employees under 26
    } else {
      // Calculate zaliczka based on current tax rules if age > 26
      zaliczka = (parseFloat(podstawa_zaliczki) * 0.12 - ulga).toFixed(0);
      zaliczka = zaliczka < 0 ? 0 : zaliczka; // Ensure zaliczka isn't negative
    }

    // Calculate zal_2021 (income tax according to 2021 rules)
    let zal_2021 = (parseFloat(podstawa_zaliczki) * 0.17).toFixed(2);
    zal_2021 = zal_2021 > 0 ? zal_2021 : '0'; // Ensure zal_2021 isn't negative

    // Calculate zdrowotne (health insurance), capping it at zal_2021 if necessary
    zdrowotne = parseFloat(zal_2021) < parseFloat(zdrowotne)
      ? parseFloat(zal_2021)
      : parseFloat(zdrowotne);

    // Final net amount after deductions
    const netAmount = ((grossAmount - emeryt_ub - rent_ub - chorobowe) - parseFloat(zdrowotne) - parseFloat(zaliczka)).toFixed(2);

    // Details for showing deductions
    const details = {
      socialSecurityContribution: employmentType === 'student' || contractType === 'umowa_o_dzielo' ? '0' : (parseFloat(emeryt_pr) + parseFloat(rent_pr) + parseFloat(chorobowe)).toFixed(2),
      healthInsuranceContribution: zdrowotne.toFixed(2),
      kosztyUzyskania: kosztyUzyskaniaValue,
      incomeTax: zaliczka,
      emeryt_pr,
      emeryt_ub,
      rent_pr,
      rent_ub,
      chorobowe,
      wypadkowe,
      FP,
      FGSP,
      podstawa_zdrow,
      podstawa_zaliczki,
      zal_2021,
      zaliczka,
      netAmount,
      zdrowotne
    };

    setDetails(details);
    return netAmount;
  };

  // Recalculate net amount when grossAmount or other parameters change
  const handleRecalculate = async () => {
    const employee = await fetchEmployee(employeeId);
    if (!employee) {
      setLoading(false);
      toast.error(`Employee data not found for ID: ${employeeId}`);
      return;
    }
    if (grossAmount) {
      const net = calculateNetAmount(parseFloat(grossAmount), prawaAutorskie, employee, ulga, employmentType, contractType);
      setNetAmount(net);
    }
  };

  useEffect(() => {
    // Fetch parameters (ulga) for the employee when component mounts
    fetchAllParameters(employeeId, contractType);
    if (grossAmount) {
      handleRecalculate();
    }
  }, [grossAmount, prawaAutorskie, employeeId, employmentType, contractType]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">Net Salary Calculation</h2>
      {grossAmount ? (
        <>
          <p><strong>Gross Amount:</strong> {grossAmount} zł</p>
          <p><strong>Net Amount:</strong> {netAmount ? `${netAmount} zł` : 'Calculating...'}</p>

          {/* Dropdown to select employment type */}
          <label className="block mb-2">Choose Employment Type:</label>
          <select 
            value={employmentType} 
            onChange={(e) => setEmploymentType(e.target.value)} 
            className="mb-4 p-2 border rounded"
          >
            {contractType === 'umowa_o_dzielo' ? (
              <>
                <option value="employee">Employee (Full Insurance)</option>
                <option value="withoutInsurance">Without Insurance</option>
              </>
            ) : (
              <>
                <option value="employee">Our Employee (Full Insurance)</option>
                <option value="otherEmployment">Ma Zatrudnienie Powyżej Minimum</option>
                <option value="student">Student (Only Tax)</option>
                <option value="emeryt">Emeryt (Full Insurance without Chorobowe)</option>
              </>
            )}
          </select>

          {/* Button to trigger recalculation */}
          <button 
            onClick={handleRecalculate} 
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm"
          >
            Recalculate
          </button>

          <button 
            onClick={() => setShowDetails(!showDetails)} 
            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-md shadow-sm"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>

          {showDetails && (
            <div className="mt-4">
              {/* Display details */}
              <p><strong>Social Security Contribution (Pracownik):</strong> {details.emeryt_pr} zł</p>
              <p><strong>Social Security Contribution (Ubezpieczyciel):</strong> {details.emeryt_ub} zł</p>
              <p><strong>Rent (Pracownik):</strong> {details.rent_pr} zł</p>
              <p><strong>Rent (Ubezpieczyciel):</strong> {details.rent_ub} zł</p>
              <p><strong>Chorobowe:</strong> {details.chorobowe} zł</p>
              <p><strong>Wypadkowe:</strong> {details.wypadkowe} zł</p>
              <p><strong>Labor Fund (FP):</strong> {details.FP} zł</p>
              <p><strong>Guaranteed Employee Benefits Fund (FGSP):</strong> {details.FGSP} zł</p>
              <p><strong>Health Contribution Base:</strong> {details.podstawa_zdrow} zł</p>
              <p><strong>Ub. zdrowotne:</strong> {details.zdrowotne} zł</p>
              <p><strong>Podstawa opodatkowania:</strong> {details.podstawa_zaliczki} zł</p>
              <p><strong>Koszty Uzyskania Przychodu:</strong> {details.kosztyUzyskania} zł</p>
              <p><strong>Income Tax:</strong> {details.incomeTax} zł</p>
              <p><strong>Income Tax (Zaliczka):</strong> {details.zaliczka} zł</p>
              <p><strong>Zaliczka na podatek wg 2021 roku:</strong> {details.zal_2021} zł</p>
            </div>
          )}
        </>
      ) : (
        <p>Please enter a valid gross amount.</p>
      )}

      <button onClick={onClose} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm">
        Close Calculator
      </button>
    </div>
  );
};

export default CivilContractCalculator;
