import React from 'react';

const RenderEmploymentCertificateDocument = React.forwardRef((props, ref) => {
  const { employee, companyData, contracts, breaks, deregistrationCode } = props;

  const breakTypeLegend = {
    'zwolnienie': 'CH',
    'opieka': 'OP',
    'zwolnienie 100%': 'ZW100',
    'zasiłek': 'ZAS',
  };

  const terminationTypeMapping = {
    'mutual_agreement': 'Art. 30 § 1 pkt 1 [Rozwiązanie umowy na mocy porozumienia stron]',
    'contract_expiry': 'Art. 30 § 1 pkt 4 [Rozwiązanie umowy z upływem czasu na który była zawarta]',
    'with_notice': 'Art. 30 § 1 pkt 2 [Rozwiązanie umowy za wypowiedzeniem]',
    'without_notice': 'Art. 30 § 1 pkt 3 [Rozwiązanie umowy bez wypowiedzenia]'
  };

  const earliestStartDate = contracts.reduce((earliest, contract) =>
    new Date(contract.contract_from_date) < new Date(earliest) ? contract.contract_from_date : earliest,
    contracts[0].contract_from_date
  );

  const latestEndDate = contracts.reduce((latest, contract) =>
    new Date(contract.contract_to_date) > new Date(latest) ? contract.contract_to_date : latest,
    contracts[0].contract_to_date
  );

  const stanowiskoChanges = [];
  const etatChanges = [];

  contracts.forEach(contract => {
    const fromDate = new Date(contract.contract_from_date).toLocaleDateString();
    const toDate = new Date(contract.contract_to_date).toLocaleDateString();

    const lastStanowiskoChange = stanowiskoChanges[stanowiskoChanges.length - 1];
    if (!lastStanowiskoChange || lastStanowiskoChange.stanowisko !== contract.stanowisko) {
      stanowiskoChanges.push({ stanowisko: contract.stanowisko, fromDate, toDate });
    } else {
      lastStanowiskoChange.toDate = toDate;
    }

    const lastEtatChange = etatChanges[etatChanges.length - 1];
    if (!lastEtatChange || lastEtatChange.etat !== contract.etat) {
      etatChanges.push({ etat: contract.etat, fromDate, toDate });
    } else {
      lastEtatChange.toDate = toDate;
    }
  });

  const currentYear = new Date().getFullYear();

  const totalBreakDays = breaks.reduce((total, breakItem) => {
    const breakYear = new Date(breakItem.break_start_date).getFullYear();
    if (breakYear === currentYear && (breakItem.break_type === 'zwolnienie' || breakItem.break_type === 'zwolnienie 100%')) {
      return total + breakItem.break_days;
    }
    return total;
  }, 0);

  const mostRecentContract = contracts.reduce((latest, current) => 
    new Date(current.contract_to_date) > new Date(latest.contract_to_date) ? current : latest, contracts[0]
  );

  return (
    <div ref={ref} className="printable-section">
      <div className="bg-white shadow rounded p-6 mt-4 max-w-4xl mx-auto mb-6">
        <h1 className="text-xl font-bold text-center mb-8">Świadectwo Pracy</h1>

        <p className="text-sm font-medium text-left mb-1">Dane firmy:</p>
        <p className="text-sm font-medium text-left mb-1">{companyData.company_name}</p>
        <p className="text-sm font-medium text-left mb-6">{companyData.street} {companyData.number}, {companyData.post_code} {companyData.city}</p>

        <p className="text-sm font-medium text-right mb-6">{companyData.city}, dnia: {new Date().toLocaleDateString()}</p>
        
        <p className="mb-6 text-left"><strong>1. Stwierdza się, że pan(i) {employee.name} {employee.surname}, urodzony(a) {new Date(employee.date_of_birth).toLocaleDateString()} był(a) zatrudniony(a) w {companyData.company_name} w okresie od {new Date(earliestStartDate).toLocaleDateString()} do {new Date(latestEndDate).toLocaleDateString()}.</strong></p>
        
        <p className="mb-6 text-left"><strong>2. W okresie zatrudnienia pracownik wykonywał(a) pracę tymczasową na rzecz:</strong> nie dotyczy</p>
        
        <p className="mb-6 text-left"><strong>3. W okresie zatrudnienia pracownik wykonywał(a) pracę:</strong></p>
        <table className="mb-6 w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Lp</th>
              <th className="border px-2 py-1">Data od</th>
              <th className="border px-2 py-1">Data do</th>
              <th className="border px-2 py-1">Stanowisko</th>
              <th className="border px-2 py-1">Etat</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract, index) => (
              <tr key={index}>
                <td className="border px-2 py-1">{index + 1}</td>
                <td className="border px-2 py-1">{new Date(contract.contract_from_date).toLocaleDateString()}</td>
                <td className="border px-2 py-1">{new Date(contract.contract_to_date).toLocaleDateString()}</td>
                <td className="border px-2 py-1">{contract.stanowisko}</td>
                <td className="border px-2 py-1">{contract.etat}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mb-6 text-left"><strong>4. Stosunek pracy ustał w wyniku:</strong> {terminationTypeMapping[mostRecentContract.termination_type]}</p>
        
        <p className="mb-6 text-left"><strong>5. Został zastosowany skrócony okres wypowiedzenia umowy o pracę na podstawie art. 36(1) § 1 Kodeksu pracy:</strong> nie dotyczy</p>
        <p className="mb-6 text-left"><strong>6. W okresie zatrudnienia pracownik:</strong></p>
        <ul className="list-disc list-inside mb-6">
          <li>1. wykorzystał zwolnienie od pracy przewidziane w art. 148<sup>1</sup> § 1 Kodeksu pracy: nie wykorzystał</li>
          <li>2. wykorzystał urlop wypoczynkowy w wymiarze: 9 dni - 72 godz. w tym: 0 dni - na podstawie art. 167<sup>2</sup> KP</li>
          <li>3. wykorzystał urlop opiekuńczy w wymiarze: nie korzystał z urlopu opiekuńczego</li>
          <li>4. korzystał z urlopu bezpłatnego: nie korzystał</li>
          <li>5. wykorzystał urlop ojcowski w wymiarze: nie korzystał z urlopu ojcowskiego</li>
          <li>6. wykorzystał urlop rodzicielski udzielony na podstawie art. 182<sup>1a</sup> Kodeksu pracy w wymiarze: nie korzystał z urlopu rodzicielskiego</li>
          <li>7. wykorzystał urlop wychowawczy udzielony na podstawie art. 186 Kodeksu pracy w wymiarze: nie korzystał z urlopu wychowawczego</li>
          <li>8. korzystał z ochrony stosunku pracy, o której mowa w art. 186<sup>8</sup> Kodeksu pracy w okresie: nie korzystał</li>
          <li>9. wykorzystał zwolnienie od pracy przewidziane w art. 188 Kodeksu Pracy: nie wykorzystał</li>
          <li>10. wykonywał pracę zdalną przewidzianą w art. 67<sup>33</sup> § 1 Kodeksu pracy: nie wykonywał pracy zdalnej</li>
          <li>11. był niezdolny do pracy przez okres: {totalBreakDays > 0 ? `${totalBreakDays} dni` : 'brak'}</li>
          <li>12. dni, za które pracownik nie zachował prawa do wynagrodzenia: nie dotyczy</li>
          <li>13. odbył służbę wojskową w okresie: nie odbywał służby wojskowej</li>
          <li>14. wykonywał pracę w szczególnych warunkach lub w szczególnym charakterze: nie wykonywał</li>
          <li>15. wykorzystał dodatkowy urlop albo inne uprawnienia lub świadczenia przewidziane przepisami prawa pracy: nie wykorzystał</li>
        
          <li className="mb-6 text-left">16. okresy nieskładkowe przypadajace w okresie zatrudnienia wskazanym w ust.1 *)</li>
        <ul className="list-disc list-inside mb-6">
          {breaks.length === 0 ? (
            <li>brak</li>
          ) : (
            breaks.map((breakItem, index) => (
              <p key={index}><strong>
                {new Date(breakItem.break_start_date).toLocaleDateString()} - {new Date(breakItem.break_end_date).toLocaleDateString()} ({breakTypeLegend[breakItem.break_type] || ''})
                </strong></p>
            ))
          )}
          {breaks.length > 0 && (
          <div className="text-left mb-6">
            <p className="mb-1">*) CH – choroba,OP – opieka nad dzieckiem lub inną osobą,ZW100 – zwolnienie 100%, ŚR – świadczenie rehabilitacyjne, BD – badania dawców tkanek</p>
            
              
              
           
          </div>
        )}
        </ul>
        </ul>
        
        <p className="mb-6 text-left"><strong>7. Informacja o zajęciu wynagrodzenia:</strong> brak</p>

        <p className="mb-6 text-left"><strong>8. Informacje uzupełniające: nie dotyczy</strong></p>
       
        
        <p className="mb-6 text-left"><strong>9. Inne informacje:</strong></p>
        <ul className="list-disc list-inside mb-6">
          <li>Kod zwolnienia: {deregistrationCode}</li>
          <li>Inne: ...</li>
        </ul>
        
        

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

        <div className="text-left mb-6">
          <p className="text-xs">POUCZENIE</p>
          <p className="text-xs">
            Pracownik ma prawo w ciągu 14 dni od otrzymania świadectwa pracy wystąpić z wnioskiem do pracodawcy o sprostowanie świadectwa pracy. W razie nieuwzględnienia wniosku,
            pracownik ma prawo w ciągu 14 dni od zawiadomienia o odmowie sprostowania świadectwa pracy wystąpić z żądaniem jego sprostowania do sądu pracy.
            Jeżeli pracodawca nie zawiadomił pracownika o odmowie sprostowania świadectwa pracy w terminie 7 dni, pracownik ma prawo wystąpić z żądaniem sprostowania świadectwa pracy
            do sądu pracy w ciągu 7 dni od dnia, w którym upłynął termin do zawiadomienia przez pracodawcę o odmowie sprostowania świadectwa pracy.
          </p>
        </div>
      </div>
    </div>
  );
});

export default RenderEmploymentCertificateDocument;
