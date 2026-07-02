const mysql = require('mysql2');
const express = require('express');
const app = express();

// Tell Express to use EJS for rendering views
app.set('view engine', 'ejs');
//enable static files
app.use(express.static('public'));
//enable form parsing
app.use(express.urlencoded({ extended: false }));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'RP738964$',
  database: 'c237_studentlistapp',
  dateStrings: true            // return DATE columns (dob) as 'YYYY-MM-DD' strings
});

// Define routes
app.get('/', (req, res) => {
  const sql = 'SELECT * FROM student';
  // Fetch data from MySQL
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.send('Error Retrieving students');
    }
    // Render HTML page with data
    res.render('index', { students: results });
  });
});

app.get('/student/:id', (req, res) => {
  // Extract the student ID from the request parameters
  const studentId = req.params.id;
  const sql = 'SELECT * FROM student WHERE studentId = ?';
  // Fetch data from MySQL based on the student ID
  connection.query( sql , [studentId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.send('Error Retrieving student by ID');
    }
    // Check if any student with the given ID was found
    if (results.length > 0) {
      // Render HTML page with the student data
      res.render('student', { student: results[0] });
    } else {
      // If no student with the given ID was found
      res.send('Student not found');
    }
  });
});

app.get('/addStudent', (req, res) => {
  res.render('addStudent');
});

app.post('/addStudent', (req, res) => {
  // Extract student data from the request body
  const { name, dob, contact, image } = req.body;
  const sql = 'INSERT INTO student (name, dob, contact, image) VALUES (?, ?, ?, ?)';
  // Insert the new student into the database
  connection.query( sql , [name, dob, contact, image], (error, results) => {
    if (error) {
      // Handle any error that occurs during the database operation
      console.error("Error adding student:", error);
      res.send('Error adding student');
    } else {
      // Send a success response
      res.redirect('/');
    }
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
