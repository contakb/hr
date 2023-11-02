import React, { useState, useEffect } from 'react'; // Add useEffect here

import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function MedicalExaminationView() {
  const location = useLocation();
  const { employeeId } = useParams();

console.log('Location:', location);
  // Initial state for employeeData
  const [employeeData, setEmployeeData] = useState(location.state?.employee || null);

  // If employeeData is not available and employeeId is present, fetch it
  useEffect(() => {
    if (!employeeData && employeeId) {
      axios.get(`http://localhost:3001/api/employees/${employeeId}`)
        .then((response) => {
          const data = response.data.employee;
          setEmployeeData(data);  // Set the fetched data to state
        })
        .catch((error) => {
          console.error('Error fetching employee data:', error);
        });
    }
  }, [employeeId, employeeData]);

  // If employeeData is still not available after fetching, show an error message
  if (!employeeData) {
    return <div>No employee data available.</div>;
  }


    return (
        <div className="medical-form">
            <h1>Medical Examination Form</h1>

            <p>Łódź, dnia {new Date().toLocaleDateString("pl-PL")}</p>  
            <p>(oznaczenie pracodawcy) (miejscowość, data)</p>

            <h2>SKIEROWANIE NA BADANIA LEKARSKIE (okresowe/wstępne/kontrolne)</h2>
            <p>Działając  na  podstawie  art.229  § 4a  ustawy  z  dnia  26 czerwca 1974 r. – Kodeks pracy (Dz.U. z 2020 r. poz. 1320 z późn. zm.),  kieruję  na  badania  lekarskie:</p>

            <p>Pana/Panią {employeeData.name} {employeeData.surname},</p>
            <p>nr PESEL: {employeeData.pesel},</p>
            <p>zamieszkałego: {employeeData.street },{employeeData.number}, {employeeData.city}</p>
            <p>zatrudnionego na stanowisku lub stanowiskach pracy: {employeeData.jobTitle},</p>
            <p>określenie stanowiska pracy ***:  : {employeeData.jobTitle},</p>
            <p>Opis  warunków  pracy  uwzględniający  informacje  o  występowaniu  na  stanowisku  lub  stanowiskach  pracy, czynników  niebezpiecznych,  szkodliwych  dla  zdrowia  lub  czynników  uciążliwych  i  innych  wynikających  ze  sposobu  wykonywania  pracy,  z  podaniem  wielkości  narażenia  oraz  aktualnych  wyników badań  i  pomiarów czynników  szkodliwych  dla  zdrowia,  wykonanych  na  tym  stanowisku/stanowiskach – należy  wpisać  nazwę czynnika/czynników  i  wielkość/wielkości  narażenia **** :,</p>
            <p>   I.  Czynniki fizyczne: :  {employeeData.jobTitle},</p>
            <p>II.  Pyły:  : {employeeData.jobTitle},</p>
            <p>III.  Czynniki chemiczne:   : {employeeData.jobTitle},</p>
            <p> IV.  Czynniki biologiczne: :  : {employeeData.jobTitle},</p>
            <p>  V.  Inne czynniki, w tym niebezpieczne::  : {employeeData.jobTitle},</p>
            <p> V.  Inne czynniki, w tym niebezpieczne::  : {employeeData.jobTitle},</p>
            <p>Łączna liczba czynników niebezpiecznych, szkodliwych dla zdrowia lub czynników uciążliwych i innych wynikających
ze sposobu wykonywania pracy wskazanych w skierowaniu:,</p>

            
……………………………………………………………………
  (podpis pracodawcy)


            <footer>
                <p>Skierowanie na badania lekarskie jest wydawane w dwóch egzemplarzach, z których jeden otrzymuje osoba kierowana na badania.</p>
            </footer>
        </div>
    );
}

export default MedicalExaminationView;
