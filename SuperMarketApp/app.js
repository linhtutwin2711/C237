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
  database: 'c237_supermarketapp'
});

// Define routes
app.get('/', (req, res) => {
  const sql = 'SELECT * FROM products';
  // Fetch data from MySQL
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.send('Error Retrieving products');
    }
    // Render HTML page with data
    res.render('index', { products: results });
  });
});

app.get('/product/:id', (req, res) => {
  // Extract the product ID from the request parameters
  const productId = req.params.id;
  const sql = 'SELECT * FROM products WHERE productId = ?';
  // Fetch data from MySQL based on the product ID
  connection.query( sql , [productId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message); 
      return res.send('Error Retrieving product by ID'); 
    }
    // Check if any product with the given ID was found
    if (results.length > 0) {
      // Render HTML page with the product data
      res.render('product', { product: results[0] });
    } else {
      // If no product with the given ID was found
      res.send('Product not found');
    }
  });
});

app.get('/addProduct', (req, res) => {
  res.render('addProduct'); 
});

app.post('/addProduct', (req, res) => {
  // Extract product data from the request body
  const { name, quantity, price, image } = req.body;
  const sql = 'INSERT INTO products (productName, quantity, price, image) VALUES (?, ?, ?, ?)';
  // Insert the new product into the database
  connection.query( sql , [name, quantity, price, image], (error, results) => {
    if (error) {
      // Handle any error that occurs during the database operation
      console.error("Error adding product:", error);
      res.send('Error adding product');
    } else {
      // Send a success response
      res.redirect('/');
    }
  });
});

app.get('/editProduct/:id', (req,res) => {
  const productId = req.params.id;
  const sql = 'SELECT * FROM products WHERE productId = ?';
  // Fetch data from MySQL based on the product ID
  connection.query( sql , [productId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message); 
      return res.send('Error retrieving product by ID'); 
    }
    // Check if any product with the given ID was found
    if (results.length > 0) {
      // Render HTML page with the product data
      res.render('editProduct', { product: results[0] });
    } else {
      // If no product with the given ID was found, render a 404 page or handle it accordingly
      res.send('Product not found');
    }
  });
});

app.post('/editProduct/:id', (req, res) => {
  const productId = req.params.id;
  // Extract product data from the request body
  const { name, quantity, price } = req.body;
  const sql = 'UPDATE products SET productName = ? , quantity = ?, price = ? WHERE productId = ?';
  // Insert the new product into the database
  connection.query( sql , [name, quantity, price, productId], (error, results) => {
    if (error) {
      // Handle any error that occurs during the database operation
      console.error("Error updating product:", error);
      res.send('Error updating product');
    } else {
      // Send a success response
      res.redirect('/');
    }
  });
});

app.get('/deleteProduct/:id', (req, res) => {
  const productId = req.params.id;
  const sql = 'DELETE FROM products WHERE productId = ?';
  connection.query( sql , [productId], (error, results) => {
    if (error) {
      // Handle any error that occurs during the database operation
      console.error("Error deleting product:", error);
      res.send('Error deleting product');
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