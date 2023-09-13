const bcrypt = require('bcrypt');
const cors = require('cors');
const express = require('express');
const { Pool } = require('pg');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const axios = require('axios');
const crypto = require('crypto');

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


app.get('/loginUser', (req, res) => {
  const { usernameOrEmail } = req.query;

  console.log('Received username or email:', usernameOrEmail);

  // Query the PostgreSQL database to check the user's credentials and fetch the associated companyid
  const query = `
    SELECT u.userid, u.username, c.companyid, c.companyname
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

        const authenticatedUserId = useridResult.rows[0].userid;

        // Set the `companyid` and `companyname` in the user's session
        req.session.companyid = companyid;
        req.session.userid = authenticatedUserId;
        req.session.companyname = companyname;

        console.log('Session data before saving:', req.session); // Log the session data before saving

        req.session.save((saveError) => {
          if (saveError) {
            console.error('Error saving session:', saveError);
            res.status(500).json({ error: 'Internal server error' });
            return;
          }

          console.log('Session data after saving:', req.session); // Log the session data after saving

          // Use the authenticatedUserId obtained from the database
          // For session-based authentication
          // or
          // const token = jwt.sign({ userid: authenticatedUserId, companyid, companyname }, 'secretKey'); // For token-based authentication

          res.json({ message: 'Logged in successfully', username: storedUsername, companyid, companyname });
        });
      });
    } else {
      // Incorrect username or email
      console.log('Invalid username or email:', usernameOrEmail);
      res.status(401).json({ error: 'Invalid username or email' });
    }
  });
});



app.post('/company', (req, res) => {
  const { companyname, address, taxid } = req.body;
  const authenticatedUserId = req.session.userid; // Assuming you have stored the authenticated userid in the session
  
  console.log('Authenticated User ID:', req.session.userid);
  console.log('Authenticated User ID:', authenticatedUserId);

  // Store the company data in the database, including the authenticated user's userid
const companyQuery = 'INSERT INTO public.companies (companyname, address, taxid, userid) VALUES ($1, $2, $3, $4) RETURNING companyid';
const companyValues = [companyname, address, taxid, authenticatedUserId];


  pool.query(companyQuery, companyValues, (error, result) => {
    if (error) {
      console.error('Error executing company query:', error);
      return res.status(500).json({ error: 'Internal server error' });
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







app.get('/protected', (req, res) => {
  if (!req.session.userid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Retrieve the user's data from the database
  const query = 'SELECT * FROM public.users WHERE userid = $1';
  const values = [req.session.userid];

  pool.query(query, values, (error, result) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const userData = {
      email: user.email,
      username: user.username,
    };

    return res.status(200).json(userData);
  });
});




app.listen(3001, () => {
  console.log('Server listening on port 3001');
});