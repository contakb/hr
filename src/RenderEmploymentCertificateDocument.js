import React from 'react';

const RenderEmploymentCertificateDocument = React.forwardRef((props, ref) => {
  const { employee, companyData, contracts, breaks, deregistrationCode } = props;

  // Mapping of break types to their corresponding legends
  const breakTypeLegend = {
    'zwolnienie': 'CH',
    'opieka': 'OP',
    'zwolnienie 100%': 'ZW100',
    'zasiłek': 'ZAS',
    // Add more mappings as needed
  };

  // Mapping of termination types to labor code articles
  const terminationTypeMapping = {
    'mutual_agreement': 'Art. 30 § 1 pkt 1 [Rozwiązanie umowy na mocy porozumienia stron]',
    'contract_expiry': 'Art. 30 § 1 pkt 4 [Rozwiązanie umowy z upływem czasu, na który była zawarta]',
    'with_notice': 'Art. 30 § 1 pkt 2 [Rozwiązanie umowy za wypowiedzeniem]',
    'without_notice': 'Art. 30 § 1 pkt 3 [Rozwiązanie umowy bez wypowiedzenia]'
  };

  // Determine the earliest start date and the latest end date
  const earliestStartDate = contracts.reduce((earliest, contract) =>
    new Date(contract.contract_from_date) < new Date(earliest) ? contract.contract_from_date : earliest,
    contracts[0].contract_from_date
  );

  const latestEndDate = contracts.reduce((latest, contract) =>
    new Date(contract.contract_to_date) > new Date(latest) ? contract.contract_to_date : latest,
    contracts[0].contract_to_date
  );

  // Aggregate "stanowisko" and "etat" changes
  const stanowiskoChanges = [];
  const etatChanges = [];

  contracts.forEach(contract => {
    const fromDate = new Date(contract.contract_from_date).toLocaleDateString();
    const toDate = new Date(contract.contract_to_date).toLocaleDateString();

    const lastStanowiskoChange = stanowiskoChanges[stanowiskoChanges.length - 1];
    if (!lastStanowiskoChange || lastStanowiskoChange.stanowisko !== contract.stanowisko) {
      stanowiskoChanges.push({ stanowisko: contract.stanowisko, fromDate, toDate });
    } else {
      lastStanowiskoChange.toDate = toDate; // Update the end date of the last entry if same stanowisko
    }

    const lastEtatChange = etatChanges[etatChanges.length - 1];
    if (!lastEtatChange || lastEtatChange.etat !== contract.etat) {
      etatChanges.push({ etat: contract.etat, fromDate, toDate });
    } else {
      lastEtatChange.toDate = toDate; // Update the end date of the last entry if same etat
    }
  });

  // Get the current year
  const currentYear = new Date().getFullYear();

  // Calculate the total break days for "zwolnienie" and "zwolnienie 100%" in the current year
  const totalBreakDays = breaks.reduce((total, breakItem) => {
    const breakYear = new Date(breakItem.break_start_date).getFullYear();
    if (breakYear === currentYear && (breakItem.break_type === 'zwolnienie' || breakItem.break_type === 'zwolnienie 100%')) {
      return total + breakItem.break_days;
    }
    return total;
  }, 0);

  // Get the most recent contract's termination type
  const mostRecentContract = contracts.reduce((latest, current) => 
    new Date(current.contract_to_date) > new Date(latest.contract_to_date) ? current : latest, contracts[0]
  );

  return (
    <div ref={ref} className="printable-section">
      <div className="bg-white shadow rounded p-6 mt-4 max-w-4xl mx-auto mb-6">
        <h1 className="text-xl font-bold text-center mb-8">Świadectwo Pracy</h1>
        <p className="text-sm font-medium text-right mb-6">Dnia: {new Date().toLocaleDateString()}</p>
        <p className="text-sm font-medium text-left mb-1">Dane firmy:</p>
        <p className="text-sm font-medium text-left mb-1">{companyData.company_name}</p>
        <p className="text-sm font-medium text-left mb-6">{companyData.street} {companyData.number}, {companyData.post_code} {companyData.city}</p>
        <p className="mb-6 text-left"><strong>Pracownik:</strong> {employee.name} {employee.surname}, zam. ul. {employee.street} {employee.number} {employee.city}</p>
        <p className="mb-6 text-left"><strong>Okres zatrudnienia:</strong> Od {new Date(earliestStartDate).toLocaleDateString()} do {new Date(latestEndDate).toLocaleDateString()}</p>
        
        <p className="mb-6 text-left"><strong>Stanowisko:</strong></p>
        <ul className="list-disc list-inside mb-6">
          {stanowiskoChanges.map((change, index) => (
            <li key={index}>{change.stanowisko}: od {change.fromDate} do {change.toDate}</li>
          ))}
        </ul>
        
        <p className="mb-6 text-left"><strong>Etat:</strong></p>
        <ul className="list-disc list-inside mb-6">
          {etatChanges.map((change, index) => (
            <li key={index}>{change.etat}: od {change.fromDate} do {change.toDate}</li>
          ))}
        </ul>
        
        <p className="mb-6 text-left"><strong>Przerwy:</strong></p>
        <ul className="list-disc list-inside mb-6">
          {breaks.length === 0 ? (
            <li>brak</li>
          ) : (
            breaks.map((breakItem, index) => (
              <li key={index}>
                {new Date(breakItem.break_start_date).toLocaleDateString()} - {new Date(breakItem.break_end_date).toLocaleDateString()} ({breakTypeLegend[breakItem.break_type] || ''})
              </li>
            ))
          )}
        </ul>

        <p className="mb-6 text-left"><strong>Był niezdolny do pracy przez okres:</strong></p>
        <p className="mb-6 text-left">{totalBreakDays > 0 ? `${totalBreakDays} dni` : 'brak'}</p>

        <p className="mb-6 text-left"><strong>Sposób zakończenia umowy:</strong></p>
        <p className="mb-6 text-left">{terminationTypeMapping[mostRecentContract.termination_type]}</p>
        
        <p className="mb-6 text-left"><strong>Inne informacje:</strong></p>
        <ul className="list-disc list-inside mb-6">
          <li>Kod zwolnienia: {deregistrationCode}</li>
          <li>Inne: ...</li>
        </ul>
        
        {breaks.length > 0 && (
          <div className="text-left mb-6">
            <p className="mb-1"><strong>Legenda przerw:</strong></p>
            <ul className="list-disc list-inside">
              {Object.entries(breakTypeLegend).map(([key, value]) => (
                <li key={key}>{key} ({value})</li>
              ))}
              {/* Add more legend items as needed */}
              <li>CH – choroba</li>
              <li>OP – opieka nad dzieckiem lub inną osobą</li>
              <li>ŚR – świadczenie rehabilitacyjne</li>
              <li>BD – badania dawców tkanek</li>
            </ul>
          </div>
        )}

        <div className="flex justify-between mt-6 mb-6">
          <div className="text-center">
            <div className="mb-6">______________________________</div>
            <p>Podpis pracodawcy</p>
            <p>(osoby upoważnionej do reprezentowania firmy)</p>
          </div>
          <div className="text-center">
            <div className="mb-1">______________________________</div>
            <p>Podpis pracownika</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default RenderEmploymentCertificateDocument;
