const bcrypt = require('bcrypt');
const cors = require('cors');
const express = require('express');
const { Pool } = require('pg');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const axios = require('axios');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const moment = require('moment-timezone');


require('dotenv').config();

const generateSecretKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

const secretKey = generateSecretKey();


const pool = new Pool({
  host: 'localhost',
  port: '5432',
  database: 'Users',
  user: 'postgres',
  password: 'Conta123!',
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(
  session({
    store: new pgSession({
      pool,
      tableName: 'session', // Name of the session table in the database
    }),
    secret: secretKey, // Secret key used for session encryption (replace with your own secret)
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 30 * 24 * 60 * 60 * 1000, // Session expiration time (in milliseconds)
    },
  })
);

app.use(express.json());

console.log('Generated secret key:', secretKey);

app.use(cors({ // Add this code to enable CORS
  origin: 'http://localhost:3000', // Replace with the origin of your client-side application
  credentials: true, // Enable credentials (cookies, authorization headers, etc)
}));


pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});

// Create employee route
app.post('/create-employee', (req, res) => {
  const employeeName = req.body.employeeName;
  const employeeSurname = req.body.employeeSurname;
  const street = req.body.street;
  const number = req.body.number;
  const postcode = req.body.postcode;
  const city = req.body.city;
  const country = req.body.country; // Add the missing parameter for the "country" column
  const taxOffice = req.body.taxOffice;
  const PESEL = req.body.PESEL;

  // Insert employee data into the employees table
  const insertEmployeeQuery = 'INSERT INTO employees (name, surname, street, number, postcode, city, country, tax_office, PESEL) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id';
  const employeeValues = [employeeName, employeeSurname, street, number, postcode, city, country, taxOffice, PESEL];


  pool.connect((error, client, done) => {
    if (error) {
      console.error('Error acquiring client from pool', error);
      res.status(500).send('Error occurred while saving data.');
      return;
    }

    client.query(insertEmployeeQuery, employeeValues, (error, result) => {
      done();

      if (error) {
        console.error('Error inserting employee data', error);
        res.status(500).send('Error occurred while saving data.');
        return;
      }

      const employeeId = result.rows[0].id;

      res.send({
        employeeId,
        employeeName,
        employeeSurname
      });
    });
  });
});
app.get('/tax-offices', (req, res) => {
  pool.connect((error, client, done) => {
      if (error) {
          console.error('Error acquiring client from pool', error);
          res.status(500).send('Error occurred fetching data.');
          return;
      }

      const query = 'SELECT id, tax_office FROM tax_offices';
      client.query(query, (error, result) => {
          done();

          if (error) {
              console.error('Error fetching tax offices', error);
              res.status(500).send('Error occurred fetching data.');
              return;
          }

          res.json(result.rows);
      });
  });
});


// Get employees route
app.get('/employees', (req, res) => {
  // Retrieve employee data from the employees table
  const getEmployeesQuery = 'SELECT id, name, surname, street, number, postcode, city, country, tax_office, pesel FROM employees';

  pool.query(getEmployeesQuery, (error, result) => {
    if (error) {
      console.error('Error retrieving employees data', error);
      res.status(500).send('Error occurred while retrieving data.');
      return;
    }

    const employees = result.rows;

    res.send({
      employees
    });
  });
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

app.post('/api/save-salary-data', (req, res) => {
  const salaryData = req.body; // The salary data received from the frontend

  // Construct the query and execute it for each row in salaryData
  const insertSalaryDataQuery = `
    INSERT INTO salaries (
      employee_id,
      gross_total,
      social_base,
      emeryt_ub,
      emeryt_pr,
      rent_ub,
      rent_pr,
      chorobowe,
      wypadkowe,
      fp,
      fgsp,
      health_base,
      heath_amount,
      tax_base,
      tax,
      ulga,
      koszty,
      net_amount,
      salary_month,
      salary_year,
      salary_date,
      created_at,
      updated_at,
      zal_2021
    )
    VALUES 
    ${salaryData.map((_, index) => `(${generatePlaceholders(index * 24 + 1, 24)})`).join(',\n')}
  `;

  const values = [];

  salaryData.forEach((salary) => {
    // Assuming contract is an object, not an array
    const rowValues = [
      salary.employee_id,
      salary.gross_total,
      salary.social_base,
      salary.emeryt_ub,
      salary.emeryt_pr,
      salary.rent_ub,
      salary.rent_pr,
      salary.chorobowe,
      salary.wypadkowe,
      salary.fp,
      salary.fgsp,
      salary.health_base,
      salary.heath_amount,
      salary.tax_base,
      salary.tax,
      salary.ulga,
      salary.koszty,
      salary.net_amount,
      salary.salary_month,
      salary.salary_year,
      formatDate(salary.salary_date), // Convert salary_date to a valid date format using formatDate()
      formatTimestamp(salary.created_at), // Convert created_at to a valid date format using formatTimestamp()
      formatTimestamp(salary.updated_at), // Convert updated_at to a valid date format using formatTimestamp()
      salary.zal_2021,
    ];

    values.push(...rowValues);
  });

  // Function to generate placeholders for the query
  function generatePlaceholders(startIndex, count) {
    return Array.from({ length: count }, (_, i) => `$${startIndex + i}`).join(', ');
  }

  // Execute the query for all rows of data in salaryData
  pool
    .query(insertSalaryDataQuery, values)
    .then((result) => {
      // Handle the result
      console.log('Successfully inserted salary data:', result);
      res.status(200).json({ success: true });
    })
    .catch((error) => {
      // Handle errors
      console.error('Error inserting salary data:', error);
      res.status(500).json({ success: false, error: 'Error inserting salary data' });
    });
});

// Get salary list route
app.get('/salary-list', (req, res) => {
  const { month, year } = req.query;

  // Construct the SQL query to retrieve salary data based on month and year
  let getSalaryListQuery = `
    SELECT s.id, e.name, e.surname, s.gross_total, s.salary_month, s.salary_year, s.salary_date, s.net_amount, employee_id, emeryt_ub, rent_ub, chorobowe, heath_amount, koszty, tax
    FROM salaries s
    JOIN employees e ON s.employee_id = e.id
  `;

  if (month && year) {
    getSalaryListQuery += `
      WHERE s.salary_month = $1 AND s.salary_year = $2
    `;
  }

  const queryValues = month && year ? [month, year] : [];

  pool.query(getSalaryListQuery, queryValues, (error, result) => {
    if (error) {
      console.error('Error retrieving salary list data', error);
      res.status(500).send('Error occurred while retrieving data.');
      return;
    }

    const salaryList = result.rows;
    res.send(salaryList);
  });
});



app.get('/distinct-salary-months-years', (req, res) => {
  const getDistinctMonthsYearsQuery = `
    SELECT DISTINCT EXTRACT(MONTH FROM salary_date) AS month, EXTRACT(YEAR FROM salary_date) AS year
    FROM salaries;
  `;

  pool.query(getDistinctMonthsYearsQuery, (error, result) => {
    if (error) {
      console.error('Error retrieving distinct months and years:', error);
      res.status(500).send('Error occurred while retrieving data.');
      return;
    }

    const distinctMonthsYears = result.rows;
    res.json(distinctMonthsYears);
  });
});


// Get report data route
app.get('/reports', async (req, res) => {
  const { type, month, year } = req.query;

  if (type === 'total-gross-amount') {
    // Query for total gross amount report
    const getGrossAmountReportQuery = `
      SELECT salary_month, salary_year, SUM(gross_total) AS total_gross_amount
      FROM salaries
      WHERE salary_month = $1 AND salary_year = $2
      GROUP BY salary_month, salary_year;
    `;

    try {
      const result = await pool.query(getGrossAmountReportQuery, [month, year]);
      res.send(result.rows);
    } catch (error) {
      console.error('Error fetching total gross amount report:', error);
      res.status(500).send('Error fetching report data.');
    }
  } else if (type === 'total-net-amount') {
    // Query for total net amount report
    const getNetAmountReportQuery = `
      SELECT salary_month, salary_year, SUM(net_amount) AS total_net_amount
      FROM salaries
      WHERE salary_month = $1 AND salary_year = $2
      GROUP BY salary_month, salary_year;
    `;

    try {
      const result = await pool.query(getNetAmountReportQuery, [month, year]);
      res.send(result.rows);
    } catch (error) {
      console.error('Error fetching total net amount report:', error);
      res.status(500).send('Error fetching report data.');
    }
  } else {
    res.status(400).send('Invalid report type.');
  }
});


app.post('/employees/:employeeId/add-contract', (req, res) => {
  const { employeeId } = req.params; // Retrieve the employeeId from the URL parameter
  const { grossAmount, startDate, endDate } = req.body;

  const addContractQuery = 'INSERT INTO contracts (employee_id, contract_from_date, contract_to_date, gross_amount) VALUES ($1, $2, $3, $4) RETURNING *';
  const values = [employeeId, startDate, endDate, grossAmount];

  console.log('Employee ID:', employeeId);
  console.log('Start Date:', startDate);
  console.log('End Date:', endDate);
  console.log('Gross Amount:', grossAmount);

  pool.query(addContractQuery, values, (error, result) => {
    if (error) {
      console.error('Error adding contract:', error);
      res.status(500).send('Error occurred while adding contract.');
      return;
    }

    const contract = result.rows[0];
    res.send({
      message: 'Contract added successfully',
      contract,
    });
  });
});


app.get('/api/contracts/:employeeId', (req, res) => {
  const employeeId = req.params.employeeId;

  // Perform the database query to fetch the contracts for the specified employee
  const query = `
    SELECT *
    FROM contracts
    WHERE employee_id = $1
  `;

  pool.query(query, [employeeId], (error, results) => {
    if (error) {
      console.error('Error fetching contracts:', error);
      res.status(500).json({ error: 'Error fetching contracts' });
      return;
    }

    // Convert the dates using Moment.js
    console.log('Contracts:', results.rows);

    const contracts = Array.isArray(results.rows)
      ? results.rows.map(contract => {
          const contractFrom = moment(contract.contract_from).format('YYYY-MM-DD');
          const contractTo = moment(contract.contract_to).format('YYYY-MM-DD');

          return { ...contract, contract_from: contractFrom, contract_to: contractTo };
        })
      : [];

    console.log('Converted Contracts:', contracts);

    res.json({ contracts });


  });
});

app.post('/api/valid-employees', (req, res) => {
  const { startDate, endDate } = req.body;

  const query = `
    SELECT employees.id AS employee_id, employees.name, employees.surname, contracts.gross_amount
    FROM employees
    INNER JOIN contracts ON employees.id = contracts.employee_id
    WHERE
      contracts.contract_from_date <= $1 AND
      contracts.contract_to_date >= $2
  `;


  pool.query(query, [endDate, startDate], (error, result) => {
    if (error) {
      console.error('Error fetching valid employees:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const employees = result.rows;
      res.status(200).json({ employees });
    }
  });
});









app.post('/api/calculate-salary', (req, res) => {
  const { month, year } = req.body;
  
  // Calculate the start and end dates of the selected month and year
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  // Query to fetch employees with valid contracts and their gross amounts
  const query = `
    SELECT employees.id, employees.name, employees.surname, contracts.gross_amount
    FROM employees
    JOIN contracts ON employees.id = contracts.employee_id
    WHERE contracts.contract_from_date <= $1
      AND contracts.contract_to_date >= $2
  `;
  
  // Execute the query passing the start and end dates as parameters
  pool.query(query, [startDate, endDate], (error, result) => {
    if (error) {
      console.error('Error fetching employee data:', error);
      res.status(500).send('Error occurred while fetching employee data.');
      return;
    }
    
    const employees = result.rows;
    const salaries = employees.map(employee => {
      const { id, name, surname, gross_amount } = employee;
      // Calculate the salary for each employee based on the gross amount and any additional calculations
      // Replace the placeholder calculation with your own logic
      const salary = calculateSalary(gross_amount);
      return { id, name, surname, salary };
    });
    
    res.send({ salaries });
  });
});




// Define the API endpoint to fetch contracts' gross amount
app.get('/api/contracts/:employee_id/gross_amount', (req, res) => {
  const employee_id = parseInt(req.params.employee_id);

  // Perform the database query
  const query = `
    SELECT gross_amount
    FROM contracts
    WHERE employee_id = ${employee_id}
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching contracts:', error);
      res.status(500).json({ error: 'Error fetching contracts' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'No contracts found for the employee' });
      return;
    }

    const grossAmount = results[0].gross_amount;
    console.log('Fetched gross amount:', gross_amount);
    res.json({ gross_amount });
  });
});






// ...


app.get('/loginUser', (req, res) => {
  const { usernameOrEmail } = req.query;

  console.log('Received username or email:', usernameOrEmail);

  // Query the PostgreSQL database to check the user's credentials and fetch the associated companyid
  const query = `
    SELECT u.email, u.userid, u.username, c.companyid, c.companyname
    FROM public.users u
    LEFT JOIN public.user_companies uc ON u.userid = uc.userid
    LEFT JOIN public.companies c ON uc.companyid = c.companyid
    WHERE u.email = $1 OR u.username = $1`;
  const values = [usernameOrEmail];

  pool.query(query, values, (error, result) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (result.rows.length === 0) {
      // User not found
      console.log('No user found:', usernameOrEmail);
      res.status(401).json({ error: 'Invalid username or email' });
      return;
    }

    const user = result.rows[0];
    const storedUsername = user.username;
    const companyid = user.companyid;
    const companyname = user.companyname;
    const email = user.email;

    console.log('Retrieved username, companyid, and companyname:', storedUsername, companyid, companyname);
    console.log('Input username or email:', usernameOrEmail);

    // Perform the comparison outside the callback
    if (storedUsername === usernameOrEmail) {
      // User authenticated successfully
      console.log('Authentication successful:', usernameOrEmail);

      // Fetch the authenticated user's ID from the database
      const useridQuery = `SELECT userid FROM public.users WHERE username = $1`;
      const useridValues = [storedUsername];

      pool.query(useridQuery, useridValues, (useridError, useridResult) => {
        if (useridError) {
          console.error('Error executing userid query:', useridError);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        console.log('User ID query result:', useridResult.rows); // Log the result to check the returned userid

        if (useridResult.rows.length === 0) {
          // User ID not found
          console.log('User ID not found:', storedUsername);
          res.status(401).json({ error: 'Invalid username or email' });
          return;
        }

        const userid = useridResult.rows[0].userid;

        // Set the `companyid` and `companyname` in the user's session
        req.session.companyid = companyid;
        req.session.userid = userid;
        req.session.companyname = companyname;
        req.session.email = email;
        req.session.username = storedUsername; // Change to `username`

        console.log('Session data before saving:', req.session); // Log the session data before saving

        req.session.save((saveError) => {
          if (saveError) {
            console.error('Error saving session:', saveError);
            res.status(500).json({ error: 'Internal server error' });
            return;
          }

          console.log('Session data after saving:', req.session);
          console.log('Session data after login:', req.session); // Log the session data after saving

          // Use the AuthenticatedUserID obtained from the database
          // For session-based authentication
          // or
          // const token = jwt.sign({ userid, companyid, companyname }, 'secretKey'); // For token-based authentication

          res.json({ message: 'Logged in successfully', username: storedUsername, userid, companyid, companyname, email });

        });
      });
    } else {
      // Incorrect username or email
      console.log('Invalid username or email:', usernameOrEmail);
      res.status(401).json({ error: 'Invalid username or email' });
    }
  });
});


app.get('/userid', (req, res) => {
  if (req.session && req.session.userid) {
    const userid = req.session.userid;
    res.json({ userid });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

function isAuthenticated(req, res, next) {
  if (!req.session.userid) {
    return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
  }
  // Continue with the next middleware if the user is authenticated
  next();
}


app.get('/account/:username', isAuthenticated, (req, res) => {
  const { username } = req.params;

  // Ensure that the user making the request is the same as the requested user
  if (req.session.storedUsername !== username) {
    return res.status(403).json({ error: 'Access forbidden' });
  }

  pool.query(
    'SELECT username, email FROM public.users WHERE username = $1',
    [username],
    (error, result) => {
      if (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Account not found' });
      }

      const accountDetails = result.rows[0];

      // Now, you can use this information to render your account details page
      res.render('account-details', {
        username: accountDetails.username, // Include username
        email: accountDetails.email, // Include email
        userid: req.session.userid, // Include userid from the session
        companyid: req.session.companyid, // Include companyid from the session
        companyname: req.session.companyname, // Include companyname from the session
      });
    }
  );
});





app.post('/company', isAuthenticated, (req, res) => {
  const { companyname, address, taxid } = req.body;
  const userid = req.session.userid;

  console.log('Authenticated User ID:', req.session.userid);
  console.log('Session Data:', req.session);
  console.log('Session Data - User ID:', req.session.userid);
  console.log('Is User Authenticated:', req.isAuthenticated());


  // Store the company data in the database, including the authenticated user's userid
  const companyQuery = 'INSERT INTO public.companies (companyname, address, taxid, userid) VALUES ($1, $2, $3, $4) RETURNING companyid';
  const companyValues = [companyname, address, taxid, userid];

  pool.query(companyQuery, companyValues, (error, result) => {
    if (error) {
      console.error('Error executing company query:', error);
      return res.status(500).json({ message: 'Failed to create company' });
    }

    const companyid = result.rows[0].companyid;
    console.log('Newly Created Company ID:', companyid);

    // Send a response to indicate success
    res.json({ success: true, message: 'Company created successfully' });
  });
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

app.post('/register', (req, res) => {
  const { email, password, username, companyid } = req.body;

  // Hash the password
  bcrypt.hash(password, 10, (error, hashedPassword) => {
    if (error) {
      console.error('Error hashing password:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Store the hashed password in the database
    const query = 'INSERT INTO public.users (email, password, username) VALUES ($1, $2, $3) RETURNING userid';
    const values = [email, hashedPassword, username];

    pool.query(query, values, (error, result) => {
      if (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const userid = result.rows[0].userid;

      // Insert the user-company association into the user_company table
      const associationQuery = 'INSERT INTO public.user_companies (userid, companyid) VALUES ($1, $2)';
      const associationValues = [userid, companyid];

      pool.query(associationQuery, associationValues, (error, result) => {
        if (error) {
          console.error('Error executing query:', error);
          return res.status(500).json({ error: 'Internal server error' });
        }

        // Registration successful
        return res.json({ message: 'Registration successful' });
      });
    });
  });
	});






  
  
  
  app.use((req, res, next) => {
    console.log('Session Data:', req.session);
    console.log('User ID set in session:', req.session.userid);
   

    next();
  })
  
  app.get('/accountById/:userid', isAuthenticated, (req, res) => {
    const { userid } = req.params;
  
    pool.query('SELECT userid FROM public.users WHERE userid = $1', [userid], (error, result) => {
      if (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Account not found' });
      }
  
      const accountDetails = result.rows[0];
      console.log('Received userid from the database:', accountDetails.userid); // Log the retrieved userid
      return res.json(accountDetails);
    });
  });
  
  
  



app.post('/check-registration', (req, res) => {
  const { email, username } = req.body;

  // Check if email and username are present in the request body
  if (!email || !username) {
    return res.status(400).json({ error: 'Email and username are required' });
  }

  // Check if email exists in the database
  const queryEmail = 'SELECT COUNT(*) FROM public.users WHERE email = $1';
  const valuesEmail = [email];

  pool.query(queryEmail, valuesEmail, (errorEmail, resultEmail) => {
    if (errorEmail) {
      console.error('Error checking email:', errorEmail);
           return res.status(500).json({ error: 'An error occurred' });
    }

    if (resultEmail.rows[0].count > 0) {
      // Email already exists
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Check if username exists in the database
    const queryUsername = 'SELECT COUNT(*) FROM public.users WHERE username = $1';
    const valuesUsername = [username];

    pool.query(queryUsername, valuesUsername, (errorUsername, resultUsername) => {
      if (errorUsername) {
        console.error('Error checking username:', errorUsername);
        return res.status(500).json({ error: 'An error occurred' });
      }

      if (resultUsername.rows[0].count > 0) {
        // Username already exists
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Email and username are available
      return res.status(200).json({ message: 'Email and username are available' });
    });
  });
});




app.listen(3001, () => {
  console.log('Server listening on port 3001');
});