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
import { UserProvider } from './UserContext'; // Adjust the import path as necessary

import AddEmployees from './EmployeeForm'
import AddContractToEmployee from './AddContractForm'; // Import your new component
import AddParamsToEmployee from './EmployeeParam'; // Import your new component
import CalendarPage from './CalendarPage';
import EmployeeBreaksCalendar from './EmployeeBreaksCalendar';
import HolidayBaseCalculator from './HolidayBaseCalculator';
import EmployeeAccount from './EmployeeAccount';
import AdminBreaksCalendar from './AdminBreaksCalendar';
import PrivateRoute from './PrivateRoute';
import Unauthorized from './Unauthorized';



function App() {
  return (
    <UserProvider> {/* Wrap the entire Router with UserProvider */}
    <Router>
   
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
       
       
	  {/* Navigation */}
        <NavigationPage />
        <SetupProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/account-details" element={<AccountDetails />} />
          <Route path="/LoginUser" element={<LoginUser />} />
          <Route path="*" element={<Navigate to="/" />} />
		  <Route path="/company" element={<CreateCompanyForm />} />
		  <Route path="/salaryCalculator" element={<SalaryCalculator />} />
		  <Route path="/createEmployee" element={<EmployeeForm />} />
		  <Route path="/employeeList" element={<PrivateRoute element={EmployeeList} allowedRoles={['admin']} />} />
		  <Route path="/add-contract/:employeeId" element={<AddContractForm />} />
		  <Route path="/calculate-salary" element={<SalaryCalculationForm />} /> {/* Add this route for the SalaryCalculationPage */}
		  <Route path="/salary-selection" element={<PrivateRoute element={SalarySelectionPage} allowedRoles={['admin']} />} />
		  <Route path="/salary-list" element={<PrivateRoute element={SalaryListPage}  allowedRoles={['admin']}  />} />
		  <Route path="/Reports" element={<PrivateRoute element={ReportsPage}  allowedRoles={['admin']} />} />
      <Route path="/settings" element={<SettingsPage />} />
      
      <Route
                path="/EmployeeContract/:employeeId"
                element={<PrivateRoute element={EmployeeContract} allowedRoles={['admin', 'employee']} />}
              />
      <Route path="/ToDo" element={<PrivateRoute element={ToDo}  allowedRoles={['admin']}/>} />
      <Route path="/medical-examination/:employeeId" element={<MedicalExaminationView />} />
      <Route path="/employee-param/:employeeId" element={<EmployeeParam />} />
      <Route path="/TerminateContract/:employeeId" element={<TerminateContract />} />
      <Route path="/add-contract/:employeeId/:contractId" element={<AddContractForm />} />
      <Route path="/Aneks/:employeeId/:contractId" element={<Aneks />} />
      <Route path="/createcompany" element={<CreateCompany />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/createEmployee" element={<AddEmployees />} />
      <Route path="/add-contract/:employeeId"  element={<AddContractToEmployee />} /> {/* New route */}
      <Route path="/employee-param/:employeeId" element={<AddParamsToEmployee />} /> {/* New route */}
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/empbreakcalendar" element={<AdminBreaksCalendar />} />
      <Route path="/breakcalendar" element={<EmployeeBreaksCalendar />} />
      <Route path="/holidaybase/:employeeId" element={<HolidayBaseCalculator />} />
      <Route
                path="/employee-account"
                element={<PrivateRoute element={EmployeeAccount} allowedRoles={['employee']} />}
              />
      <Route path="/unauthorized" element={<Unauthorized />} />


       

		  
        </Routes>
        </SetupProvider>
      
        
    </div>
    
    </Router>
    </UserProvider>
  );
}

export default App;
