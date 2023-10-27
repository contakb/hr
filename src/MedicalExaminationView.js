import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function MedicalExaminationView() {
    const location = useLocation();
    const employee = location.state.employee;

console.log('Location:', location);
const { employeeId } = useParams();

// Check if employee data is available in location.state
const employeeData = location.state?.employee;

// If employee data is not available in location.state, you can fetch it using employeeId
if (!employeeData && employeeId) {

  axios.get(`http://localhost:3001/api/employees/${employeeId}`)
   .then((response) => {
     const data = response.data.employee;
     // Set the data to employeeData
  })
   .catch((error) => {
      console.error('Error fetching employee data:', error);
  });
}

// If employeeData is still not available, you can handle it accordingly
if (!employeeData) {
  return <div>No employee data available.</div>;
}





    return (
        <div className="medical-form">
            <h1>Medical Examination Form</h1>

            <p>Łódź, dnia {new Date().toLocaleDateString("pl-PL")}</p>  
            <p>(oznaczenie pracodawcy) (miejscowość, data)</p>

            <h2>SKIEROWANIE NA BADANIA LEKARSKIE (okresowe)</h2>
            <p>Działając na podstawie art.229 § 4a ustawy z dnia 26 czerwca 1974 r. – Kodeks pracy...</p>

            <p>Pana {employee.name} {employee.surname},</p>
            <p>nr PESEL: {employee.pesel},</p>
            <p>zamieszkałego: {employee.street },{employee.number}, {employee.city}</p>
            <p>zatrudnionego na stanowisku lub stanowiskach pracy: {employee.jobTitle},</p>
            // ... Continue integrating the rest of the template

            <footer>
                <p>Skierowanie na badania lekarskie jest wydawane w dwóch egzemplarzach, z których jeden otrzymuje osoba kierowana na badania.</p>
            </footer>
        </div>
    );
}

export default MedicalExaminationView;
