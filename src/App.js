import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Switch } from 'react-router-dom';
import Login from './Login';
import AccountDetails from './AccountDetails';
import LoginUser from './LoginUser';
import CreateCompanyForm from './CreateCompanyForm';
import SalaryCalculator from './SalaryCalculator';
import EmployeeForm from './EmployeeForm';
import EmployeeList from './EmployeeList'; // Import the EmployeeList component
import AddContractForm from './AddContractForm';
import SalaryCalculationForm from './SalaryCalculationForm'; // Import the SalaryCalculationPage component
import SalarySelectionPage from './SalarySelectionPage';
import SalaryListPage from './SalaryListPage';
import NavigationPage from './NavigationPage';
import ReportsPage from './ReportsPage';
import SettingsPage from './SettingsPage';
import EmployeeContract from './EmployeeContract';



function App() {
  return (
    <div className="App">
      <Router>
	  {/* Navigation */}
        <NavigationPage />
        <Routes>
          <Route path="/" element={<Login />} />
		  <Route path="/account/:username" element={<AccountDetails />} />
          <Route path="/LoginUser" element={<LoginUser />} />
          <Route path="*" element={<Navigate to="/" />} />
		  <Route path="/company" element={CreateCompanyForm} />
		  <Route path="/salaryCalculator" element={<SalaryCalculator />} />
		  <Route path="/createEmployee" element={<EmployeeForm />} />
		  <Route path="/employeeList" element={<EmployeeList />} /> {/* Add this route for the EmployeeList */}
		  <Route path="/add-contract/:employeeId" element={<AddContractForm />} />
		  <Route path="/calculate-salary" element={<SalaryCalculationForm />} /> {/* Add this route for the SalaryCalculationPage */}
		  <Route path="/salary-selection" element={<SalarySelectionPage />} />
		  <Route path="/salary-list" element={<SalaryListPage />} />
		  <Route path="/Reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/accountById/:userid" element={<AccountDetails/>} />
      <Route path="/EmployeeContract" element={<EmployeeContract />} />

       

		  
        </Routes>
      </Router>
    </div>
  );
}

export default App;
