import { ToastContainer } from 'react-toastify';
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
import EmployeeContractPage from './EmployeeContractPage';
import ToDo from './ToDo';
import MedicalExaminationView from './MedicalExaminationView';
import EmployeeParam from './EmployeeParam';
import TerminateContract from './TerminateContract';
import Aneks from './Aneks';
import CreateCompany from './CreateCompany';
import SetupPage from './setup';
import { SetupProvider } from './SetupContext';



function App() {
  return (
    <div className="App">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Router>
	  {/* Navigation */}
        <NavigationPage />
        <SetupProvider>
        <Routes>
          <Route path="/" element={<Login />} />
		  <Route path="/account/:username" element={<AccountDetails />} />
          <Route path="/LoginUser" element={<LoginUser />} />
          <Route path="*" element={<Navigate to="/" />} />
		  <Route path="/company" element={<CreateCompanyForm />} />
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
      <Route path="/EmployeeContract/:employeeId" element={<EmployeeContract />} />
      <Route path="/ToDo" element={<ToDo />} />
      <Route path="/medical-examination/:employeeId" element={<MedicalExaminationView />} />
      <Route path="/employee-param/:employeeId" element={<EmployeeParam />} />
      <Route path="/TerminateContract/:employeeId" element={<TerminateContract />} />
      <Route path="/add-contract/:employeeId/:contractId" element={<AddContractForm />} />
      <Route path="/Aneks/:employeeId/:contractId" element={<Aneks />} />
      <Route path="/createcompany" element={<CreateCompany />} />
      <Route path="/setup" element={<SetupPage />} />


       

		  
        </Routes>
        </SetupProvider>
      </Router>
    </div>
  );
}

export default App;
