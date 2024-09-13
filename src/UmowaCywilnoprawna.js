import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from './axiosInstance';
import { useRequireAuth } from './useRequireAuth';

const UmowaCywilnoprawna = () => {
  const [employee, setEmployee] = useState({});
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const user = useRequireAuth();
  const umowaRef = useRef(null);
  const [amountInWords, setAmountInWords] = useState('');
  const [payPerHourInWords, setPayPerHourInWords] = useState('');


  
  


  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const employeeResponse = await axiosInstance.get(`http://localhost:3001/api/employees/${employeeId}`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            'x-schema-name': user.schemaName,
          }
        });
        const contractResponse = await axiosInstance.get(`http://localhost:3001/api/civil-contracts/${employeeId}`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            'x-schema-name': user.schemaName,
          }
        });
        const companyResponse = await axiosInstance.get('http://localhost:3001/api/created_company', {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            'x-schema-name': user.schemaName,
          }
        });

        setEmployee(employeeResponse.data.employee);
        setContracts(contractResponse.data.contracts);
        setCompanyData(companyResponse.data.length > 0 ? companyResponse.data[0] : null);
        setSelectedContractId(contractResponse.data.contracts[0]?.id);
      } catch (error) {
        setError('Error fetching data');
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [employeeId, user]);

  const handleContractSelection = (e) => {
    setSelectedContractId(e.target.value);
  };

  const selectedContract = contracts.find(contract => contract.id === Number(selectedContractId));

  useEffect(() => {
    if (selectedContract) {
      // Convert gross amount
      if (selectedContract.gross_amount) {
        const parsedValue = parseFloat(selectedContract.gross_amount);
        if (!isNaN(parsedValue)) {
          setAmountInWords(numberToPolishWords(parsedValue));
        } else {
          setAmountInWords('');
        }
      }
  
      // Convert pay_per_hour
      if (selectedContract.pay_per_hour) {
        const parsedPayPerHour = parseFloat(selectedContract.pay_per_hour);
        if (!isNaN(parsedPayPerHour)) {
          setPayPerHourInWords(numberToPolishWords(parsedPayPerHour));
        } else {
          setPayPerHourInWords('');
        }
      }
    }
  }, [selectedContract]);
  

  const renderContractTypeDetails = (contract) => {
    if (!contract) return null;

    switch (contract.contract_type) {
      case 'umowa o dzieło':
        return (
          <>
            <h2 className="text-xs font-bold mb-3 text-center list-disc list-inside ml-4"></h2>
            <p className="text-center">§ 1 </p>  
            <p> 1. Wykonawca zobowiązuje się do wykonania dzieła na zlecenie Zamawiającego: </p>
            
            <p> <strong>{contract.task_description}</strong></p>
            <p>Data ukończenia dzieła:<strong> {new Date(contract.deadline_dzieło).toLocaleDateString()}</strong></p>
            <p> 2. Wykonawca będzie wykonywać dzieło w okresie od <strong> {new Date(contract.contract_from_date).toLocaleDateString()}</strong> do <strong>{new Date(contract.contract_to_date).toLocaleDateString()}</strong>  </p>
            <div className="my-4"></div>
            <p className="text-center">§ 2 </p> 
            <p> Wykonawca nie może powierzyć realizację zobowiązań wynikających z niniejszej umowy innej osobie
            bez zgody Zamawiającego. </p>
            <div className="my-4"></div>
            <p className="text-center">§ 3 </p>  
            <p>1. Wykonawcy za wykonanie dzieła określonego w § 1 umowy przysługuje wynagrodzenie w wysokości: <strong>{contract.gross_amount}</strong> zł</p>
            <p>Kwota słownie:<strong> {amountInWords || '—'}</strong></p>
      
            

            <p>2. Wynagrodzenie płatne będzie wypłacone:, zgodnie z ilością przepracowanych godzin.</p>
            
            <p><strong>Data zakończenia:</strong> {new Date(contract.contract_to_date).toLocaleDateString()}</p>
            
          <div className="my-4"></div>
            <p className="text-center">§ 4 </p> 
            <p> Zmiany umowy wymagają formy pisemnej w postaci aneksu.</p> 
            <div className="my-4"></div>
            <p className="text-center">§ 5 </p> 
            <p><strong>1. Dodatkowe informacje:</strong> {contract.additional_info} </p>
            {/* Prawa Autorskie Section */}
          {contract.prawa_autorskie && (
            <>
              <p><strong>2. Prawa Autorskie:</strong></p>
              <p>{contract.prawa_autorskie}</p>
            </>
          )}
            <div className="my-4"></div>
            <p className="text-center">§ 6 </p> 
            <p> W sprawach nieuregulowanych niniejszą umową mają zastosowanie przepisy Kodeksu Cywilnego.</p>
            <p> Umowę spisano w dwóch jednobrzmiących egzemplarzach po jednym dla każdej ze stron.</p>
          </>
        );
      case 'umowa zlecenie':
        return (
          <>
            <h2 className="text-xs font-bold mb-3 text-center list-disc list-inside ml-4"></h2>
            <p className="text-center">§ 1 </p>  
            <p> 1. Wykonawca zobowiązuje się na zlecenie Zamawiającego do: </p>
            
            <p> <strong>{contract.task_description}</strong></p>
            
            <p> 2. Wykonawca będzie wykonywać zlecenie w okresie od <strong> {new Date(contract.contract_from_date).toLocaleDateString()}</strong> do <strong>{new Date(contract.contract_to_date).toLocaleDateString()}</strong>  </p>
            <div className="my-4"></div>
            <p className="text-center">§ 2 </p> 
            <p> Wykonawca nie może powierzyć realizację zobowiązań wynikających z niniejszej umowy innej osobie
            bez zgody Zamawiającego. </p>
            <div className="my-4"></div>
            <p className="text-center">§ 3 </p>  
            <p>1. Wykonawcy za wykonanie zlecenia określonego w § 1 umowy przysługuje wynagrodzenie w wysokości: <strong>{contract.gross_amount}</strong> zł</p>
            <p>Kwota słownie: {amountInWords || '—'}</p>
      
            

            <p>2. Wynagrodzenie płatne będzie wypłacone:, zgodnie z ilością przepracowanych godzin.</p>

            <p><strong>Liczba godzin do przepracowania:</strong> {contract.hours_worked}</p>
            <p><strong>Stawka godzinowa:</strong> {contract.pay_per_hour} zł brutto</p>
            <p>słownie: {payPerHourInWords || '—'}</p>
            <div className="my-4"></div>
            <p className="text-center">§ 4 </p> 
            <p> Zmiany umowy wymagają formy pisemnej w postaci aneksu.</p> 
            <div className="my-4"></div>
            <p className="text-center">§ 5 </p> 
            <p><strong>Dodatkowe informacje:</strong> {contract.additional_info} </p>
            {/* Prawa Autorskie Section */}
          {contract.prawa_autorskie && (
            <>
              <h3 className="text-lg font-semibold mb-2">Prawa Autorskie:</h3>
              <p>{contract.prawa_autorskie}</p>
            </>
          )}
            <div className="my-4"></div>
            <p className="text-center">§ 6 </p> 
            <p> W sprawach nieuregulowanych niniejszą umową mają zastosowanie przepisy Kodeksu Cywilnego.</p>
            <p> Umowę spisano w dwóch jednobrzmiących egzemplarzach po jednym dla każdej ze stron.</p>
          </>
        );
      default:
        return <p>Nieznany typ umowy.</p>;
    }
  };

  const handleDownloadPDFClick = async () => {
    const element = document.querySelector('.printable-section');
    const htmlContent = element.outerHTML;

    const response = await fetch('http://localhost:3001/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ html: htmlContent })
    });

    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'contract.pdf';
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
    } else {
      console.error('Failed to generate PDF');
    }
  };

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!selectedContract) {
    return <div>Nie znaleziono umowy.</div>;
  }

  return (
    <div className="bg-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Dropdown for selecting a contract */}
        <div className="mb-4">
          <select className="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white border border-solid border-gray-300 rounded focus:border-blue-600 focus:outline-none"
            onChange={handleContractSelection} value={selectedContractId}>
            {contracts.map((contract) => (
              <option key={contract.id} value={contract.id}>
                {contract.contract_type} od {new Date(contract.contract_from_date).toLocaleDateString()} do {new Date(contract.contract_to_date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => window.print()}
            className="w-32 h-8 bg-blue-500 hover:bg-blue-700 text-white font-semibold text-xs py-1 px-2 rounded whitespace-nowrap"
          >
            Print or Save as PDF
          </button>
          <button
            onClick={handleDownloadPDFClick}
            className="w-32 h-8 bg-blue-500 hover:bg-blue-700 text-white font-semibold text-xs py-1 px-2 rounded whitespace-nowrap"
          >
            Download PDF
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-32 h-8 bg-blue-500 hover:bg-blue-700 text-white font-semibold text-xs py-1 px-2 rounded whitespace-nowrap"
          >
            Back
          </button>
        </div>

        <div className="printable-section">
          <div className="contract-container bg-100 p-4 rounded-lg shadow text-xs">
            {selectedContract ? (
              <div ref={umowaRef} className="mt-8 break-before-page">
                <div className="border border-gray-300 p-4">
                  <header className="header mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p>{companyData?.company_name}</p>
                        <p><strong>ul:</strong> {companyData?.street} {companyData?.number}, {companyData?.post_code}, {companyData?.city}, {companyData?.country}</p>
                        <p><strong>NIP:</strong> {companyData?.taxid}</p>
                      </div>
                      <div>
                        <p>{companyData?.city}, dnia {selectedContract && selectedContract.contract_from_date ? new Date(selectedContract.contract_from_date).toLocaleDateString() : "N/A"}</p>
                      </div>
                    </div>
                  </header>

                  <section className="contract-section mb-4">
                  <h1 className="contract-title text-2xl font-bold mb-3 text-center">
  {selectedContract?.contract_type || 'Umowa Cywilnoprawna'}
</h1>
                    <p><strong>Zawarta w dniu:</strong> {selectedContract && selectedContract.contract_from_date ? new Date(selectedContract.contract_from_date).toLocaleDateString() : "N/A"} w miejscowości:{companyData?.city}</p>
                    <div className="h-4"></div>
                    <p><strong>pomiędzy:</strong></p>
                    <p><strong>Pracodawca:</strong> {companyData?.company_name}</p>
                    <p><strong>ul:</strong> {companyData?.street} {companyData?.number}, {companyData?.post_code}, {companyData?.city}, {companyData?.country}</p>
                    <p><strong>NIP:</strong> {companyData?.taxid}</p>
                    <p><strong>Reprezentowaną przez:</strong> {companyData.representative_name}</p>
                    <p>zwaną dalej <strong>Zamawiającym,</strong></p>

                    <div className="h-4"></div>
                    <p><strong>a Panią/Panem</strong></p>
                    <p><strong>Pracownik:</strong> {employee.name} {employee.surname} zam. ul. {employee.street} {employee.number} {employee.postcode} {employee.city}</p>
                    <p>zwany dalej <strong>Wykonawcą,</strong> zawarto umowę o następującej treści:</p>
                    

                    {/* Render contract-specific details */}
                    {renderContractTypeDetails(selectedContract)}
                  </section>

                  <div className="h-8"></div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p>Podpis pracownika</p>
                      <div className="signature-line w-full border-t border-gray-400"></div>
                      <p>{employee.name} {employee.surname}</p>
                    </div>
                    <div>
                      <p>Podpis osoby reprezentującej firmę</p>
                      <div className="signature-line w-full border-t border-gray-400"></div>
                      <p>{companyData?.representative_name}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p>No contract selected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Conversion function from earlier
function numberToPolishWords(value) {
    const units = ['', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć'];
    const teens = ['dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście', 'piętnaście', 'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście'];
    const tens = ['', '', 'dwadzieścia', 'trzydzieści', 'czterdzieści', 'pięćdziesiąt', 'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt'];
    const hundreds = ['', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset', 'sześćset', 'siedemset', 'osiemset', 'dziewięćset'];
    const thousands = ['tysiąc', 'tysiące', 'tysięcy'];
  
    if (value === 0) return 'zero złotych zero groszy';
  
    let zlote = Math.floor(value);
    let grosze = Math.round((value - zlote) * 100);
  
    const groszePart = grosze === 0 ? 'zero groszy' : `${grosze} groszy`;
  
    let result = '';
  
    if (zlote > 999) {
      const thousandPart = Math.floor(zlote / 1000);
      zlote %= 1000;
      result += `${units[thousandPart]} ${thousands[1]} `;
    }
  
    if (zlote >= 100) {
      result += `${hundreds[Math.floor(zlote / 100)]} `;
      zlote %= 100;
    }
  
    if (zlote >= 20) {
      result += `${tens[Math.floor(zlote / 10)]} `;
      zlote %= 10;
    } else if (zlote >= 10) {
      result += `${teens[zlote - 10]} `;
      zlote = 0;
    }
  
    if (zlote > 0) {
      result += `${units[zlote]} `;
    }
  
    result += `złotych ${groszePart}`;
    return result.trim();
  }

export default UmowaCywilnoprawna;
