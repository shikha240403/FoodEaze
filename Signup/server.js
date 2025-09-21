const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.json());

// Connect to MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'yourpassword',
    database: 'foodeaze'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});

// Register via Email
app.post('/signup-email', async (req, res) => {
    const { fullName, email, password, address } = req.body;

    // Check if email exists in either table
    const query = `
        SELECT email FROM users_email WHERE email = ? 
        UNION 
        SELECT email FROM users_google WHERE email = ?
    `;
    db.query(query, [email, email], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            return res.status(400).json({ message: 'Email already exists.' });
        }

        // Hash the password and insert into users_email table
        const hashedPassword = bcrypt.hashSync(password, 8);
        db.query(
            `INSERT INTO users_email (full_name, email, password, address) VALUES (?, ?, ?, ?)`,
            [fullName, email, hashedPassword, address],
            (err, result) => {
                if (err) throw err;
                res.status(201).json({ message: 'User registered successfully!' });
            }
        );
    });
});

// Register via Google
app.post('/signup-google', (req, res) => {
    const { fullName, email, googleId } = req.body;

    // Check if email exists in either table
    const query = `
        SELECT email FROM users_email WHERE email = ? 
        UNION 
        SELECT email FROM users_google WHERE email = ?
    `;
    db.query(query, [email, email], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            return res.status(400).json({ message: 'Email already exists.' });
        }

        // Insert into users_google table
        db.query(
            `INSERT INTO users_google (full_name, email, google_id) VALUES (?, ?, ?)`,
            [fullName, email, googleId],
            (err, result) => {
                if (err) throw err;
                res.status(201).json({ message: 'Google account registered successfully!' });
            }
        );
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
