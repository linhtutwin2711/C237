const mysql = require('mysql2');
const express = require('express');
const app = express();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Set up multer for file uploads.
// Use memoryStorage: the upload is held in RAM and only written to disk AFTER the
// request is fully received. This avoids destroying a file when you pick an image
// that already lives in public/images (writing while it's still being read).
const upload = multer({ storage: multer.memoryStorage() });

// Save an uploaded file (buffered in memory) to public/images and return its filename.
function saveUploadedImage(file) {
  fs.writeFileSync(path.join('public', 'images', file.originalname), file.buffer);
  return file.originalname;
}

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

app.post('/addStudent', upload.single('image'), (req, res) => {
  // Extract student data from the request body
  const { name, dob, contact } = req.body;
  let image;
  if (req.file) {
    image = saveUploadedImage(req.file); // write the buffered upload to disk, keep original name
  } else {
    image = null;
  }
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

app.get('/editStudent/:id', (req, res) => {
  const studentId = req.params.id;
  const sql = 'SELECT * FROM student WHERE studentId = ?';
  // Fetch data from MySQL based on the student ID
  connection.query( sql , [studentId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.send('Error retrieving student by ID');
    }
    // Check if any student with the given ID was found
    if (results.length > 0) {
      // Render HTML page with the student data
      res.render('editStudent', { student: results[0] });
    } else {
      // If no student with the given ID was found
      res.send('Student not found');
    }
  });
});

app.post('/editStudent/:id', upload.single('image'), (req, res) => {
  const studentId = req.params.id;
  // Extract student data from the request body
  const { name, dob, contact } = req.body;
  let image = req.body.currentImage; // retrieve current image filename
  if (req.file) { // if a new image is uploaded
    image = saveUploadedImage(req.file); // write the buffered upload to disk, keep original name
  }
  const sql = 'UPDATE student SET name = ?, dob = ?, contact = ?, image = ? WHERE studentId = ?';
  // Update the student in the database
  connection.query( sql , [name, dob, contact, image, studentId], (error, results) => {
    if (error) {
      // Handle any error that occurs during the database operation
      console.error("Error updating student:", error);
      res.send('Error updating student');
    } else {
      // Send a success response
      res.redirect('/');
    }
  });
});

app.get('/deleteStudent/:id', (req, res) => {
  const studentId = req.params.id;
  const sql = 'DELETE FROM student WHERE studentId = ?';
  connection.query( sql , [studentId], (error, results) => {
    if (error) {
      // Handle any error that occurs during the database operation
      console.error("Error deleting student:", error);
      res.send('Error deleting student');
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
