const handleCalculateSalary = () => {
  const updatedEmployees = employees.map((employee) => {
    if (employee.gross_amount && employee.gross_amount.length > 0) {
      const updatedContracts = employee.gross_amount.map((grossAmount, index) => {
        const daysOfBreak = parseInt(healthBreaks[index].days, 10) || 0;
        const breakType = healthBreaks[index].type || '';

        let customGrossAmount = grossAmount;
        let wynChorobowe = 0;

        if (breakType === 'zwolnienie') {
          // Calculate customGrossAmount differently for "zwolnienie"
          customGrossAmount = (grossAmount - (grossAmount / 30 * daysOfBreak)).toFixed(2);
          wynChorobowe = (((grossAmount - 0.1371 * grossAmount) / 30) * (daysOfBreak * 0.8)).toFixed(2);
        }

        // Calculate other salary components here based on customGrossAmount
        const emeryt_pr = (customGrossAmount * 0.0976).toFixed(2);
        const emeryt_ub = (customGrossAmount * 0.0976).toFixed(2);
        const rent_pr = (customGrossAmount * 0.065).toFixed(2);
        const rent_ub = roundUpToCent(customGrossAmount * 0.015).toFixed(2);
        const chorobowe = (customGrossAmount * 0.0245).toFixed(2);
        const wypadkowe = (customGrossAmount * 0.0167).toFixed(2);
        const FP = (customGrossAmount * 0.0245).toFixed(2);
        const FGSP = (customGrossAmount * 0.001).toFixed(2);

        // Calculate podstawa_zdrow based on customGrossAmount and wynChorobowe
        const podstawa_zdrow = (
          customGrossAmount - emeryt_ub - rent_ub - chorobowe + parseFloat(wynChorobowe)
        ).toFixed(2);

        // Calculate podstawa_zaliczki based on the break type
        let podstawa_zaliczki;
        if (breakType === 'zwolnienie') {
          podstawa_zaliczki = (customGrossAmount - emeryt_ub - rent_ub - chorobowe + parseFloat(wynChorobowe) - 250).toFixed(2);
        } else {
          podstawa_zaliczki = (podstawa_zdrow - 250).toFixed(0);
        }

        // Calculate other fields
        const zaliczka =
          (podstawa_zaliczki * 0.12 - 300) < 0
            ? 0
            : (podstawa_zaliczki * 0.12 - 300).toFixed(0);

        const zal_2021 = (podstawa_zaliczki * 0.17 - 43.76).toFixed(2);
        const zdrowotne =
          zal_2021 < podstawa_zdrow * 0.09
            ? zal_2021
            : (podstawa_zdrow * 0.09).toFixed(2);
        const netAmount = (
          podstawa_zdrow - zdrowotne - zaliczka
        ).toFixed(2);
        const ulga = (300).toFixed(2);
        const koszty = (250).toFixed(2);
        const social_base = customGrossAmount;


        return {
          ...calculateSalary(customGrossAmount, daysOfBreak),
          wyn_chorobowe: wynChorobowe,
          podstawa_zdrow: podstawa_zdrow,
          pod_zal: podstawa_zaliczki,
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
