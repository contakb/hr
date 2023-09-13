// MonthlySalaryDetails.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MonthlySalaryDetails({ month, year, onClose }) {
  const [monthlySalaries, setMonthlySalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMonthlySalaries(month, year);
  }, [month, year]);

  const fetchMonthlySalaries = async (month, year) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/salary-list?month=${month}&year=${year}`
      );
      setMonthlySalaries(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching monthly salaries:', error);
      setError('Error fetching monthly salaries. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Monthly Salary Details for {month}/{year}</h2>
        {loading && <div>Loading...</div>}
        {error && <div>{error}</div>}
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              {/* Other headers */}
            </tr>
          </thead>
          <tbody>
            {monthlySalaries.map((salary) => (
              <tr key={salary.id}>
                <td>{salary.employee_id}</td>
                {/* Other data */}
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default MonthlySalaryDetails;
