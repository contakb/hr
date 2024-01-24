import React, { useState } from 'react';
import axios from 'axios';

function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed

  const [reportType, setReportType] = useState('');
  const [month, setMonth] = useState(currentMonth.toString()); // Initialize to current month
  const [year, setYear] = useState(currentYear.toString()); // Initialize to current year
  const [reportData, setReportData] = useState([]);
  const [totalGrossAmount, setTotalGrossAmount] = useState(0);
  const [totalNetAmount, setTotalNetAmount] = useState(0);
  const [isReportGenerated, setIsReportGenerated] = useState(false); // New state variable

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 2051 - 1990 }, (_, i) => i + 1990);

  const calculateSum = (data, field) => {
    return data.reduce((sum, record) => sum + parseFloat(record[field]), 0);
  };

  const handleGenerateReport = async () => {
    setIsReportGenerated(false); // Reset the flag before generating a new report
    try {
      const response = await axios.get(`http://localhost:3001/reports?month=${month}&year=${year}`);
      setReportData(response.data);

      if (reportType === 'total-gross-amount') {
        setTotalGrossAmount(calculateSum(response.data, 'gross_total'));
      } else if (reportType === 'total-net-amount') {
        setTotalNetAmount(calculateSum(response.data, 'net_amount'));
      }
      setIsReportGenerated(true); // Set the flag to true after generating the report
    } catch (error) {
      console.error('Error fetching report data:', error);
      setReportData([]);
    }
  };

  const renderReportTable = () => {
    if (!isReportGenerated) return null; // Do not render if the report has not been generated
    if (reportType === 'total-gross-amount') {
      return (
        <>
          <h3>Total Gross Amount: {totalGrossAmount.toFixed(2)}</h3>
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Gross Amount</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((report, index) => (
                <tr key={index}>
                  <td>{report.employee_id}</td>
                  <td>{report.gross_total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    } else if (reportType === 'total-net-amount') {
      return (
        <>
          <h3>Total Net Amount: {totalNetAmount.toFixed(2)}</h3>
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((report, index) => (
                <tr key={index}>
                  <td>{report.employee_id}</td>
                  <td>{report.net_amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    }
    return null;
  };

  return (
    <div>
      <h2>Generate Report</h2>
      <div>
        <label>
          Report Type:
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="">Select Report Type</option>
            <option value="total-gross-amount">Total Gross Amount by Month and Year</option>
            <option value="total-net-amount">Total Net Amount by Month and Year</option>
          </select>
        </label>
        {reportType && (
          <>
            <label>
              Month:
              <select value={month} onChange={(e) => setMonth(e.target.value)}>
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
            <label>
              Year:
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>
          </>
        )}
        <button onClick={handleGenerateReport}>Generate</button>
      </div>

      <h2>Report Data</h2>
    {isReportGenerated && renderReportTable()}
  </div>
  );
}

export default ReportsPage;
