const cors = require('cors');
const express = require('express');
const session = require('express-session');
const axios = require('axios');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const moment = require('moment');



require('dotenv').config();

const generateSecretKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

const secretKey = generateSecretKey();

const supabaseUrl = 'https://hxaxnwozubxemmygmmkw.supabase.co'; // Replace with your Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4YXhud296dWJ4ZW1teWdtbWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTYyNDk0NzAsImV4cCI6MjAxMTgyNTQ3MH0.re-MQMIldEU9bhypt54b_14IPDqjOzTQhrcMEoLeTBg'; // Replace with your Supabase API key

const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(express.json());

console.log('Generated secret key:', secretKey);

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));


app.post('/create-employee', async (req, res) => {
  const employeeName = req.body.employeeName;
  const employeeSurname = req.body.employeeSurname;
  const street = req.body.street;
  const number = req.body.number;
  const postcode = req.body.postcode;
  const city = req.body.city;
  const country = req.body.country;
  const taxOfficeName = req.body.taxOfficeName;
  const PESEL = req.body.PESEL;

  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([
        {
          name: employeeName,
          surname: employeeSurname,
          street: street,
          number: number,
          postcode: postcode,
          city: city,
          country: country,
          tax_office: taxOfficeName,
          pesel: PESEL
        }
      ])
      .select();

      const { data: secondData, error: secondError } = await supabase.from('employees').insert(/*...*/);

      console.log('Supabase Response:', data, error);
        

    if (error) {
      console.error('Error inserting employee data', error);
      res.status(500).send('Error occurred while saving data.');
      return;
    }

    // Check if data has the expected structure
    if (data && data.length > 0) {
      const employeeId = data[0].id;
      res.send({
        employeeId,
        employeeName,
        employeeSurname
      });
    } else {
      console.error('Unexpected response structure from Supabase');
      res.status(500).send('Error occurred while processing the response.');
    }
  } catch (err) {
    console.error('An unexpected error occurred', err);
    res.status(500).send('An unexpected error occurred.');
  }
});


app.get('/tax-offices', async (req, res) => {
  try {
      let { data, error } = await supabase
          .from('taxoffices')
          .select('id, tax_office');
      
      if (error) throw error;

      res.json(data);
  } catch (error) {
      console.error('Error fetching tax offices', error);
      res.status(500).send('Error occurred fetching data.');
  }
});

// Get employees route
app.get('/employees', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('id, name, surname, street, number, postcode, city, country, tax_office, pesel');

    if (error) {
      console.error('Error retrieving employees data', error);
      res.status(500).send('Error occurred while retrieving data.');
    } else {
      const employees = data;
      res.send({
        employees,
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error occurred while retrieving data.');
  }
});

app.put('/update-employee/:employeeId', async (req, res) => {
  const employeeId = req.params.employeeId;
  const { name, surname, street, number, postcode, city, country, tax_office, pesel } = req.body;

  try {
    const { data, error } = await supabase
      .from('employees')
      .update({
        name: name,
        surname: surname,
        street: street,
        number: number,
        postcode: postcode,
        city: city,
        country: country,
        tax_office: tax_office,
        pesel: pesel
      })
      .eq('id', employeeId)
      .select(); // Chain a select() after update()

    if (error) {
      console.error('Error updating employee data', error);
      res.status(500).send('Error occurred while updating data.');
      return;
    }

    if (data && data.length > 0) {
      // Successfully updated
      res.send({ message: 'Employee updated successfully', updatedEmployee: data[0] });
    } else {
      // No rows updated, which means no employee was found with that ID
      res.status(404).send('Employee not found.');
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).send('Error occurred while updating employee data.');
  }
});


// Define the function to get the current date in the format: YYYY-MM-DD
// Define the function to get the current date in the format: YYYY-MM-DD HH:mm:ss
function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const hours = String(today.getHours()).padStart(2, '0');
  const minutes = String(today.getMinutes()).padStart(2, '0');
  const seconds = String(today.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Function to format date as "YYYY-MM-DD"
function formatDate(dateString) {
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) {
    return null; // Invalid date
  }
  return dateObj.toISOString().split('T')[0]; // Extract YYYY-MM-DD format
}

// Function to format timestamp as "YYYY-MM-DD"
function formatTimestamp(timestampString) {
  const timestampObj = new Date(timestampString);
  if (isNaN(timestampObj.getTime())) {
    return null; // Invalid timestamp
  }
  return timestampObj.toISOString().split('T')[0]; // Extract YYYY-MM-DD format
}

app.post('/api/save-salary-data', async (req, res) => {
  const salaryData = req.body; // The salary data received from the frontend

  try {
    // Construct the array of salary records
    const salaryRecords = salaryData.map((salary) => ({
      employee_id: salary.employee_id,
      gross_total: salary.gross_total,
      social_base: salary.social_base,
      emeryt_ub: salary.emeryt_ub,
      emeryt_pr: salary.emeryt_pr,
      rent_ub: salary.rent_ub,
      rent_pr: salary.rent_pr,
      chorobowe: salary.chorobowe,
      wypadkowe: salary.wypadkowe,
      fp: salary.fp,
      fgsp: salary.fgsp,
      health_base: salary.health_base,
      heath_amount: salary.heath_amount,
      tax_base: salary.tax_base,
      tax: salary.tax,
      ulga: salary.ulga,
      koszty: salary.koszty,
      net_amount: salary.net_amount,
      salary_month: salary.salary_month,
      salary_year: salary.salary_year,
      salary_date: formatDate(salary.salary_date), // Convert salary_date to a valid date format using formatDate()
      created_at: formatTimestamp(salary.created_at), // Convert created_at to a valid date format using formatTimestamp()
      updated_at: formatTimestamp(salary.updated_at), // Convert updated_at to a valid date format using formatTimestamp()
      zal_2021: salary.zal_2021,
    }));

    // Insert all salary records into the 'salaries' table using Supabase
    const { data, error } = await supabase
      .from('salaries')
      .upsert(salaryRecords);


    if (error) {
      console.error('Error inserting salary data:', error);
      res.status(500).json({ success: false, error: 'Error inserting salary data' });
    } else {
      console.log('Successfully inserted salary data:', data);
      res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Error inserting salary data' });
  }
});



app.get('/salary-list', async (req, res) => {
  const { month, year } = req.query;

  try {
    // Define the base query for retrieving salary data
    let baseQuery = supabase
      .from('salaries')
      .select('id, employee_id, gross_total, salary_month, salary_year, salary_date, net_amount, emeryt_ub, rent_ub, chorobowe, heath_amount, koszty,  tax, employees!salaries_employee_id_fkey(name, surname)')
      .order('salary_date', { ascending: false });

    // Add filters for month and year if provided
    if (month && year) {
      baseQuery = baseQuery
        .eq('salary_month', month)
        .eq('salary_year', year);
    }

    // Fetch employee data
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('id, name, surname');

    if (employeeError) {
      console.error('Error retrieving employee data', employeeError);
      res.status(500).send('Error occurred while retrieving employee data.');
      return;
    }

    // Fetch the salary data
    const { data: salaryList, error } = await baseQuery;

    if (error) {
      console.error('Error retrieving salary list data', error);
      res.status(500).send('Error occurred while retrieving salary data.');
      return;
    }

    // Combine salary and employee data
    const combinedData = salaryList.map((salary) => {
      const matchingEmployee = employeeData.find((employee) => employee.id === salary.employee_id);

      if (matchingEmployee) {
        return {
          ...salary,
          employee_name: matchingEmployee.name,
          employee_surname: matchingEmployee.surname,
        };
      }
      return salary;
    });

    // Send the combined data as the response
    res.json(combinedData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error occurred while retrieving data.');
  }
});










const fetchSalaryList = async () => {
  try {
    const response = await axios.get('http://localhost:3001/salary-list');
    if (response.data) {
      setSalaryList(response.data);
      setLoading(false);
    } else {
      console.error('No data received from the server.');
      setError('No data received from the server.');
      setLoading(false);
    }
  } catch (error) {
    console.error('Error fetching salary list:', error);
    setError('Error fetching salary list. Please try again later.');
    setLoading(false);
  }
};




app.get('/distinct-salary-months-years', async (req, res) => {
  try {
    // Construct the query to retrieve distinct months and years from the 'salary_date' column using Supabase
    const { data: distinctMonthsYears, error } = await supabase
      .from('salaries')
      .select('distinct(salary_month), distinct(salary_year)')
      .embed('fk_salaries_employee_id');

    if (error) {
      console.error('Error retrieving distinct months and years:', error);
      res.status(500).send('Error occurred while retrieving data.');
      return;
    }

    res.json(distinctMonthsYears);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error occurred while retrieving data.');
  }
});



app.get('/reports', async (req, res) => {
  const { type, month, year } = req.query;

  try {
    if (type === 'total-gross-amount') {
      // Query for total gross amount report
      const { data, error } = await supabase
        .from('salaries')
        .select('salary_month, salary_year, SUM(gross_total) AS total_gross_amount')
        .eq('salary_month', month)
        .eq('salary_year', year)
        .group('salary_month, salary_year');

      if (error) {
        console.error('Error fetching total gross amount report:', error);
        res.status(500).send('Error fetching report data.');
        return;
      }

      res.send(data);
    } else if (type === 'total-net-amount') {
      // Query for total net amount report
      const { data, error } = await supabase
        .from('salaries')
        .select('salary_month, salary_year, SUM(net_amount) AS total_net_amount')
        .eq('salary_month', month)
        .eq('salary_year', year)
        .group('salary_month, salary_year');

      if (error) {
        console.error('Error fetching total net amount report:', error);
        res.status(500).send('Error fetching report data.');
        return;
      }

      res.send(data);
    } else {
      res.status(400).send('Invalid report type.');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error fetching report data.');
  }
});



app.post('/employees/:employeeId/add-contract', async (req, res) => {
  const { employeeId } = req.params; // Retrieve the employeeId from the URL parameter
  const { grossAmount, startDate, endDate, stanowisko, etat, typ_umowy, workstart_date, period_próbny } = req.body;

  try {
    // Construct the contract data
    const contractData = {
      employee_id: employeeId,
      contract_from_date: startDate,
      contract_to_date: endDate,
      gross_amount: grossAmount,
      stanowisko,
      etat,
      typ_umowy,
      workstart_date,
      period_próbny

      

    };

    // Insert the contract data into the 'contracts' table using Supabase
    const { data, error } = await supabase
      .from('contracts')
      .upsert([contractData])
    .select();

    const { data: secondData, error: secondError } = await supabase.from('contracts').insert(/*...*/);

    console.log('Supabase Response:', data, error);

    if (error) {
      console.error('Error adding contract:', error);
      res.status(500).send('Error occurred while adding contract.');
      return;
    }

    // Return the added contract data as the response
    const contract = data[0];
    res.send({
      message: 'Contract added successfully',
      contract,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error occurred while adding contract.');
  }
});

app.post('/employees/:employeeId/add-params', async (req, res) => {
  const { employeeId } = req.params; // Retrieve the employeeId from the URL parameter
  const { koszty, ulga, kodUb, validFrom } = req.body;

  try {
    // Construct the employee parameter data
    const employeeParamData = {
      employee_id: employeeId,
      koszty,
      ulga,
      kod_ub: kodUb,
      valid_from: validFrom
    };

    // Insert the employee parameter data into your 'emp_var' table using Supabase
    const { data, error } = await supabase
      .from('emp_var')
      .upsert([employeeParamData])
      .select();

    const { data: secondData, error: secondError } = await supabase.from('emp_var').insert(/*...*/);

    console.log('Supabase Response:', data, error);



    if (error) {
      console.error('Error adding employee parameters:', error);
      res.status(500).send('Error occurred while adding employee parameters.');
      return;
    }

    // Assuming you want to return the first item of the inserted data
    const employeeParams = data[0];
    employeeParams.kod_ub = String(employeeParams.kod_ub).padStart(6, '0');
    res.send({
      message: 'Employee parameters added successfully',
      employeeParams,
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).send('Error occurred while adding employee parameters.');
  }
});

app.get('/api/employee-params/:employeeId', async (req, res) => {
  const employeeId = req.params.employeeId;

  try {
    const { data, error } = await supabase
      .from('emp_var')  // Target the emp_var table
      .select('*')  // Select all columns or specify like 'id, koszty, ulga, kod_ub, valid_from'
      .eq('employee_id', employeeId);  // Use the employee_id column to filter

    if (error) {
      console.error('Error fetching employee parameters:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const parameters = data; // You may receive an array of records
      if (parameters.length > 0) {
        res.json({
          parameters,
        });
      } else {
        res.status(404).json({ error: 'Parameters not found for the given employee' });
      }
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/employee-params/:employeeId', async (req, res) => {
  const employeeId = req.params.employeeId;
  const { koszty, ulga, kod_ub, valid_from } = req.body;

  try {
    const { data, error } = await supabase
      .from('emp_var')
      .update({ koszty, ulga, kod_ub, valid_from })
      .eq('employee_id', employeeId)
      .select(); // Chain a select() after update()

    if (error) {
      console.error('Error updating employee parameters:', error);
      res.status(500).json({ error: error.message }); // Provide more specific error message
    } else {
      res.json({
        message: 'Parameters updated successfully',
        updatedParameters: data
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.get('/api/contracts/:employeeId', async (req, res) => {
  const employeeId = req.params.employeeId;

  try {
    // Perform the database query to fetch the contracts for the specified employee
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('employee_id', employeeId);

    if (error) {
      console.error('Error fetching contracts:', error);
      res.status(500).json({ error: 'Error fetching contracts' });
      return;
    }

    // Format the dates using Moment.js and include them in the response
    const contracts = Array.isArray(data)
      ? data.map(contract => {
          const contractFrom = moment(contract.contract_from_date).format('YYYY-MM-DD');
          const contractTo = moment(contract.contract_to_date).format('YYYY-MM-DD');

          return {
            ...contract,
            contract_from_date: contractFrom,
            contract_to_date: contractTo
          };
        })
      : [];

    console.log('Contracts:', contracts);

    res.json({ contracts });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error fetching contracts' });
  }
});

const fetchData = async () => {
  const { data, error } = await supabase
      .rpc('fetch_valid_employees', { start_date: '2023-01-01', end_date: '2023-01-31' });
  
  if (error) {
      console.error("Error fetching data:", error);
  } else {
      // Use the 'data' however you want in your application
      console.log(data);
  }
}



app.post('/api/valid-employees', async (req, res) => {
  const { startDate, endDate } = req.body;

  // Step 1: Get list of valid employee IDs
  const validEmployeeIdsResponse = await supabase
      .from('contracts')
      .select('employee_id')
      .filter('contract_from_date', 'lte', endDate)
      .filter('contract_to_date', 'gte', startDate);

  const { data, error } = validEmployeeIdsResponse;

      if (error) {
        // Handle error appropriately
        console.error('Error fetching valid employee IDs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      
      if (!data) {
        // No valid contracts were found for the given period
        res.status(200).json({ employees: [] });
        return;
      }
          
  const validEmployeeIds = validEmployeeIdsResponse.data.map(item => item.employee_id);

  // Step 2: Use the validEmployeeIds to fetch the required data
  if (validEmployeeIds.length > 0) {
      const { data, error } = await supabase
          .from('employees')
          .select('id, name, surname, contracts(gross_amount, contract_from_date, contract_to_date)')
          .in('id', validEmployeeIds);

      if (error) {
          console.error('Error fetching valid employees:', error);
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          const employees = Array.isArray(data) ? data : [];
          const transformedEmployees = employees.map(employee => {
            // Map through the contracts to find those valid in the selected time frame
            const contracts = employee.contracts
              .filter(contract => contract.contract_from_date <= endDate && contract.contract_to_date >= startDate)
              .map(contract => ({
                gross_amount: contract.gross_amount.toFixed(2),
                contract_from_date: contract.contract_from_date,
                contract_to_date: contract.contract_to_date
              }));
          
            // Merge the contract details with the gross amount
            const grossAmounts = contracts.map(contract => contract.gross_amount);
          
            // Assuming an employee can have more than one contract in the period,
            // you might want to handle how to combine these gross amounts
            // For simplicity, here we just take the first contract's amount
            const combinedGrossAmount = grossAmounts.length > 0 ? grossAmounts[0] : '0.00';
          
            return {
              employee_id: employee.id,
              name: employee.name,
              surname: employee.surname,
              gross_amount: combinedGrossAmount, // Keep the gross amount format
              contract_details: contracts // Include all the contract details
            };
          });
          
          res.status(200).json({ employees: transformedEmployees });
          
      }
  }
});

// Fetch working hours
app.get('/api/getWorkingHours', async (req, res) => {
  const { year, month } = req.query;
  
  try {
    const { data, error } = await supabase
      .from('working_days')
      .select('work_hours')
      .eq('year', year)
      .eq('month', month)
      .single();

    if (error) throw error;
    
    res.json({ work_hours: data.work_hours });
  } catch (error) {
    console.error('Error fetching working hours:', error);
    res.status(500).send(error.message);
  }
});

app.get('/api/getHolidays', async (req, res) => {
  const { year, month } = req.query; // Assuming year and month are passed as query params
  
  if (!year || !month) {
    return res.status(400).json({ error: 'Year and month parameters are required' });
  }
  // Calculate the last day of the month
  const lastDayOfMonth = new Date(year, month, 0).getDate();

  try {
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .gte('date', `${year}-${String(month).padStart(2, '0')}-01`) // Greater than or equal to the first of the month
      .lte('date', `${year}-${String(month).padStart(2, '0')}-${lastDayOfMonth}`); // Less than or equal to the last day of the month

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

















app.post('/api/calculate-salary', async (req, res) => {
  const { month, year } = req.body;

  try {
    // Calculate the start and end dates of the selected month and year
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Perform the database query to fetch employees with valid contracts and their gross amounts
    const { data: employeesData, error: employeesError } = await supabase
      .from('employees')
      .select('id, name, surname')
      .eq('contracts.contract_from_date', startDate) // Assuming contracts have a 'contract_from_date' column
      .lte('contracts.contract_to_date', endDate) // Assuming contracts have a 'contract_to_date' column
      .innerJoin('contracts', { 'employees.id': 'contracts.employee_id' });

    if (employeesError) {
      console.error('Error fetching employee data:', employeesError);
      res.status(500).json({ error: 'Error occurred while fetching employee data.' });
      return;
    }

    const employees = Array.isArray(employeesData) ? employeesData : [];
    
    // Calculate salaries for each employee
    const salaries = employees.map(employee => {
      const { id, name, surname } = employee;
      // Replace this placeholder calculation with your own logic based on gross_amount
      const grossAmount = employee.contracts.gross_amount;
      const salary = calculateSalary(grossAmount);
      return { id, name, surname, salary };
    });

    res.status(200).json({ salaries });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Replace this placeholder function with your actual salary calculation logic
function calculateSalary(grossAmount) {
  // Replace with your salary calculation logic
  // For example, you can calculate the salary based on the provided gross amount
  // and any other factors like taxes, deductions, etc.
  return grossAmount * 0.8; // 80% of the gross amount as a placeholder
}




// Define the API endpoint to fetch contracts' gross amount
app.get('/api/contracts/:employee_id/gross_amount', async (req, res) => {
  const employee_id = parseInt(req.params.employee_id);

  try {
    // Perform the database query to fetch the contract's gross amount using Supabase
    const { data: contractData, error: contractError } = await supabase
      .from('contracts')
      .select('gross_amount')
      .eq('employee_id', employee_id)
      .embed('fk_salaries_employee_id');

    if (contractError) {
      console.error('Error fetching contract:', contractError);
      res.status(500).json({ error: 'Error fetching contract' });
      return;
    }

    if (!Array.isArray(contractData) || contractData.length === 0) {
      res.status(404).json({ error: 'No contract found for the employee' });
      return;
    }

    const grossAmount = contractData[0].gross_amount;
    console.log('Fetched gross amount:', grossAmount);
    res.json({ gross_amount: grossAmount });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/employees/:employeeId', async (req, res) => {
  const employeeId = req.params.employeeId;

  try {
    const { data, error } = await supabase
      .from('employees')
      .select('id, name, surname, street, city, pesel')  // Add any other columns you need here
      .eq('id', employeeId);  // Use the provided employeeId to filter the result

    if (error) {
      console.error('Error fetching employee details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const employee = data[0]; // Assuming you only expect one result
      if (employee) {
        res.send({
          employee,
        });
      } else {
        res.status(404).json({ error: 'Employee not found' });
      }
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});






// ...


app.get('/loginUser', async (req, res) => {
  const { usernameOrEmail } = req.query;

  try {
    console.log('Received username or email:', usernameOrEmail);

    // Use Supabase to query the user's credentials and fetch additional data
    const { data: users, error } = await supabase
      .from('users')
      .select('email, userid, username')
      .eq('email', usernameOrEmail)
      .or('username', 'eq', usernameOrEmail);

    if (error) {
      console.error('Error querying user data:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (!Array.isArray(users) || users.length === 0) {
      // User not found
      console.log('No user found:', usernameOrEmail);
      res.status(401).json({ error: 'Invalid username or email' });
      return;
    }

    const user = users[0];
    const storedUsername = user.username;
    const email = user.email;

    console.log('Retrieved username and email:', storedUsername, email);
    console.log('Input username or email:', usernameOrEmail);

    // Perform the comparison outside the callback
    if (storedUsername === usernameOrEmail) {
      // User authenticated successfully
      console.log('Authentication successful:', usernameOrEmail);

      const userid = user.userid;

      // Use Supabase to fetch additional user data
      const { data: userCompanies, error: companyError } = await supabase
        .from('user_companies')
        .select('companyid, companyname')
        .eq('userid', userid);

      if (companyError) {
        console.error('Error querying user companies:', companyError);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      if (!Array.isArray(userCompanies) || userCompanies.length === 0) {
        // User companies not found
        console.log('No user companies found for:', usernameOrEmail);
        res.status(401).json({ error: 'Invalid username or email' });
        return;
      }

      const userCompany = userCompanies[0];
      const companyid = userCompany.companyid;
      const companyname = userCompany.companyname;

      // Set the `companyid` and `companyname` in the user's session
      req.session.companyid = companyid;
      req.session.userid = userid;
      req.session.companyname = companyname;
      req.session.email = email;
      req.session.username = storedUsername;

      console.log('Session data before saving:', req.session);

      // Save the session data
      req.session.save((saveError) => {
        if (saveError) {
          console.error('Error saving session:', saveError);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }

        console.log('Session data after saving:', req.session);
        console.log('Session data after login:', req.session);

        res.json({ message: 'Logged in successfully', username: storedUsername, userid, companyid, companyname, email });
      });
    } else {
      // Incorrect username or email
      console.log('Invalid username or email:', usernameOrEmail);
      res.status(401).json({ error: 'Invalid username or email' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Middleware function to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (!req.session.userid) {
    return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
  }
  // Continue with the next middleware if the user is authenticated
  next();
}

app.get('/userid', (req, res) => {
  if (req.session && req.session.userid) {
    const userid = req.session.userid;
    res.json({ userid });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/account/:username', isAuthenticated, async (req, res) => {
  const { username } = req.params;

  // Ensure that the user making the request is the same as the requested user
  if (req.session.username !== username) {
    return res.status(403).json({ error: 'Access forbidden' });
  }

  try {
    // Use Supabase to fetch the user's account details
    const { data: userAccountDetails, error } = await supabase
      .from('users')
      .select('username, email')
      .eq('username', username);

    if (error) {
      console.error('Error fetching user account details:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!Array.isArray(userAccountDetails) || userAccountDetails.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const accountDetails = userAccountDetails[0];

    // Render your account details page or send JSON response with account details
    res.json({
      username: accountDetails.username, // Include username
      email: accountDetails.email, // Include email
      userid: req.session.userid, // Include userid from the session
      companyid: req.session.companyid, // Include companyid from the session
      companyname: req.session.companyname, // Include companyname from the session
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





app.post('/company', isAuthenticated, async (req, res) => {
  const { companyname, address, taxid } = req.body;
  const userid = req.session.userid;

  console.log('Authenticated User ID:', req.session.userid);
  console.log('Session Data:', req.session);
  console.log('Session Data - User ID:', req.session.userid);
  console.log('Is User Authenticated:', req.isAuthenticated());

  try {
    // Store the company data in the database, including the authenticated user's userid
    const { data: newCompany, error } = await supabase
      .from('companies')
      .upsert([{ companyname, address, taxid, userid }], { returning: 'minimal' });

    if (error) {
      console.error('Error creating company:', error);
      return res.status(500).json({ message: 'Failed to create company' });
    }

    console.log('Newly Created Company ID:', newCompany[0].id);

    // Send a response to indicate success
    res.json({ success: true, message: 'Company created successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});






app.post('/password-reminder', (req, res) => {
  const { username } = req.body;

  // Query the PostgreSQL database to get the user's email
  pool.query(
    'SELECT email FROM public.users WHERE username = $1',
    [username],
    (error, result) => {
      if (error) {
        console.error('Error sending password reminder:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      if (result.rows.length === 0) {
        // User not found
        res.status(404).json({ error: 'User not found' });
      } else {
        // Send the password reminder email to the user's email address
        const userEmail = result.rows[0].email;
        // Implement the code to send the email here
        res.json({ message: 'Password reminder sent' });
      }
    }
  );
});

app.post('/register', async (req, res) => {
  const { email, password, username, companyid } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store the hashed password in the database
    const { data: newUser, error: registrationError } = await supabase
      .from('users')
      .upsert([{ email, password: hashedPassword, username }], { returning: 'minimal' });

    if (registrationError) {
      console.error('Error registering user:', registrationError);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const userid = newUser[0].id;

    // Insert the user-company association into the user_company table
    const { error: associationError } = await supabase
      .from('user_companies')
      .insert([{ userid, companyid }]);

    if (associationError) {
      console.error('Error creating user-company association:', associationError);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Registration successful
    return res.json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





  
  
  
  app.use((req, res, next) => {
    console.log('Session Data:', req.session);
    console.log('User ID set in session:', req.session.userid);
   

    next();
  })
  
  app.get('/accountById/:userid', isAuthenticated, async (req, res) => {
    const { userid } = req.params;
  
    try {
      // Use Supabase to fetch the user's account details
      const { data: userAccountDetails, error } = await supabase
        .from('users')
        .select('userid')
        .eq('userid', userid);
  
      if (error) {
        console.error('Error fetching user account details:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      if (!Array.isArray(userAccountDetails) || userAccountDetails.length === 0) {
        return res.status(404).json({ error: 'Account not found' });
      }
  
      const accountDetails = userAccountDetails[0];
      console.log('Received userid from the database:', accountDetails.userid); // Log the retrieved userid
      return res.json(accountDetails);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  
  



  app.post('/check-registration', async (req, res) => {
    const { email, username } = req.body;
  
    try {
      // Check if email exists in the database
      const { data: emailExists, error: emailError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email);
  
      if (emailError) {
        console.error('Error checking email:', emailError);
        return res.status(500).json({ error: 'An error occurred' });
      }
  
      if (emailExists.length > 0) {
        // Email already exists
        return res.status(400).json({ error: 'Email already exists' });
      }
  
      // Check if username exists in the database
      const { data: usernameExists, error: usernameError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username);
  
      if (usernameError) {
        console.error('Error checking username:', usernameError);
        return res.status(500).json({ error: 'An error occurred' });
      }
  
      if (usernameExists.length > 0) {
        // Username already exists
        return res.status(400).json({ error: 'Username already exists' });
      }
  
      // Email and username are available
      return res.status(200).json({ message: 'Email and username are available' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  




app.listen(3001, () => {
  console.log('Server listening on port 3001');
});