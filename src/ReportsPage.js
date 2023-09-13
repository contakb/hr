import React, { useState } from 'react';
import axios from 'axios';

function ReportsPage() {
  const [reportType, setReportType] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [reportData, setReportData] = useState([]);

  const handleGenerateReport = async () => {
    try {
      // Send a request to the server to fetch the report data based on report type
      const response = await axios.get(
        `http://localhost:3001/reports?type=${reportType}&month=${month}&year=${year}`
      );
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setReportData([]);
    }
  };

  const renderReportTable = () => {
    if (reportType === 'total-gross-amount') {
      return (
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Year</th>
              <th>Total Gross Amount</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((report) => (
              <tr key={report.id}>
                <td>{report.salary_month}</td>
                <td>{report.salary_year}</td>
                <td>{report.total_gross_amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (reportType === 'total-net-amount') {
      return (
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Year</th>
              <th>Total Net Amount</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((report) => (
              <tr key={report.id}>
                <td>{report.salary_month}</td>
                <td>{report.salary_year}</td>
                <td>{report.total_net_amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    // Add more cases for other report types
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
            {/* Add more report types */}
          </select>
        </label>
        {reportType && (
          <>
            <label>
              Month:
              <input type="text" value={month} onChange={(e) => setMonth(e.target.value)} />
            </label>
            <label>
              Year:
              <input type="text" value={year} onChange={(e) => setYear(e.target.value)} />
            </label>
          </>
        )}
        <button onClick={handleGenerateReport}>Generate</button>
      </div>

      <h2>Report Data</h2>
      {renderReportTable()}
    </div>
  );
}

export default ReportsPage;
