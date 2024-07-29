const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const db = new sqlite3.Database('./bookstore.db');

// set up for multer for file uploads - 21/07/2024 - pavan
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));

// Creating tables and inserting the data - 21/07/2024 - pavan
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT NOT NULL UNIQUE, password TEXT NOT NULL)");

    db.run("CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, price REAL NOT NULL, image TEXT NOT NULL, about TEXT NOT NULL)");
});

// Signup for endpoint - 21/07/2024 - pavan
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], function(err) {
        if (err) {
            res.status(500).send({ success: false, message: 'Signup failed' });
        } else {
            res.send({ success: true });
        }
    });
});

// Login for endpoint - 21/07/2024 - pavan
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            res.status(500).send({ success: false, message: 'Error' });
        } else if (row) {
            res.send({ success: true });
        } else {
            res.send({ success: false, message: 'Invalid username or password' });
        }
    });
});

// CRUD operations endpoints for books - 21/07/2024 - pavan

// Creating (Add) a new book 
app.post('/books', upload.single('image'), (req, res) => {
    const { title, price, about } = req.body;
    const image = req.file ? req.file.path : '';
    db.run("INSERT INTO books (title, price, image, about) VALUES (?, ?, ?, ?)", [title, price, image, about], function(err) {
        if (err) {
            res.status(500).send('Error adding book');
        } else {
            res.send({ id: this.lastID });
        }
    });
});

// Read (Get) all books - 21/07/2024 - pavan
app.get('/books', (req, res) => {
    db.all("SELECT * FROM books", (err, rows) => {
        if (err) {
            res.status(500).send('Error retrieving books');
        } else {
            res.send(rows);
        }
    });
});

// Updating an existing book - 21/07/2024 - pavan
app.put('/books/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { title, price, about } = req.body;
    const image = req.file ? req.file.path : '';
    db.run("UPDATE books SET title = ?, price = ?, image = ?, about = ? WHERE id = ?", [title, price, image, about, id], function(err) {
        if (err) {
            res.status(500).send('Error updating book');
        } else {
            res.send({ changes: this.changes });
        }
    });
});

// Deleting a book - 21/07/2024 - pavan
app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM books WHERE id = ?", id, function(err) {
        if (err) {
            res.status(500).send('Error deleting book');
        } else {
            res.send({ changes: this.changes });
        }
    });
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
