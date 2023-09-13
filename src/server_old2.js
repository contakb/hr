const bcrypt = require('bcrypt');
const cors = require('cors');
const express = require('express');
const { Pool } = require('pg');
const session = require('express-session');

const app = express();
app.use(express.json());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(cors({ }))
const pool = new Pool({
  host: 'localhost',
  port: '5432',
  database: 'Users',
  user: 'postgres',
  password: 'Conta123!',
});

pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});

// Inserting sample data into the users table
pool.query('INSERT INTO public.users (email, password, username) VALUES ($1, $2, $3)', ['john.doe@example.com', 'password123', 'john.doe'], (error, result) => {
  if (error) {
    console.error('Error executing query:', error);
    // Handle the error
  } else {
    // Process the query result
    console.log('Data inserted successfully');
  }
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


app.post('/loginUser', (req, res) => {
  const { usernameOrEmail } = req.body;

  console.log('Received username or email:', usernameOrEmail);

  // Query the PostgreSQL database to check the user's credentials and fetch the associated companyid
  const query = `
    SELECT u.userid, u.username, uc.companyid
    FROM public.users u
    LEFT JOIN public.user_companies uc ON u.userid = uc.userid
    WHERE u.email = $1 OR u.username = $2`;
  const values = [usernameOrEmail, usernameOrEmail];

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

    console.log('Retrieved username and companyid:', storedUsername, companyid);
    console.log('Input username or email:', usernameOrEmail);

    // Perform the comparison outside the callback
    if (storedUsername === usernameOrEmail) {
      // User authenticated successfully
      console.log('Authentication successful:', usernameOrEmail);

      // Store the `companyid` in the user's session or token
      req.session.companyid = companyid; // For session-based authentication
      // or
      // const token = jwt.sign({ userid: user.userid, companyid }, 'your-secret-key'); // For token-based authentication

      res.json({ message: 'Logged in successfully', username: storedUsername, companyid });
    } else {
      // Incorrect username or email
      console.log('Invalid username or email:', usernameOrEmail);
      res.status(401).json({ error: 'Invalid username or email' });
    }
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



app.get('/account/:username', (req, res) => {
  const { username } = req.params;

  pool.query('SELECT email, username FROM public.users WHERE username = $1', [username], (error, result) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const accountDetails = result.rows[0];
    return res.json(accountDetails);
  });
});



app.get('/loginUser', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
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

app.post('/company', (req, res) => {
  const { companyname, address, taxid } = req.body;
  const authenticatedUserId = req.session.userid; // Assuming you have stored the authenticated userid in the session

  // Store the company data in the database
  const companyQuery = 'INSERT INTO public.companies (companyname, address, taxid) VALUES ($1, $2, $3) RETURNING companyid';
  const companyValues = [companyname, address, taxid];

  pool.query(companyQuery, companyValues, (error, result) => {
    if (error) {
      console.error('Error executing company query:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const companyid = result.rows[0].companyid;

    // Insert the user-company association into the user_companies table
    const associationQuery = 'INSERT INTO public.user_companies (userid, companyid) VALUES ($1, $2)';
    const associationValues = [authenticatedUserId, companyid];

    pool.query(associationQuery, associationValues, (error, result) => {
      if (error) {
        console.error('Error executing association query:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Send a response to indicate success
      res.json({ success: true, message: 'Company created successfully' });
    });
  });
});





app.listen(3001, () => {
  console.log('Server listening on port 3001');
});