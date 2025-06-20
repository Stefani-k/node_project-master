// oleg bergin stefani kazmirchuk
// מסלולי הרשמה והתחברות (Authentication routes)
// Authentication routes (register & login)

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// מביאים את ממשק ה-Promise של מסד הנתונים
// Get DB promise interface from singleton
const db = require("../dbSingleton").getPromise();

const JWT_SECRET = process.env.JWT_SECRET || "my_name_is_oleg";

// רישום משתמש חדש
// Register a new user
router.post("/register", async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    password,
    role = "customer",
  } = req.body;

  // בדיקת שדות חובה
  // Check required fields
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // גיבוב סיסמה
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // הכנסה למסד הנתונים
    // Insert new user to database
    const sql = `INSERT INTO users (first_name, last_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [first_name, last_name, email, phone, hashedPassword, role];

    const [result] = await db.query(sql, params);

    // מחזיר מזהה משתמש חדש
    // Return new user ID
    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
    });
  } catch (err) {
    // טיפול בשגיאה – משתמש עם מייל קיים
    // Handle error: user with same email
    console.error("Error during registration:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists." });
    }
    // שגיאת שרת כללית
    // General server error
    res.status(500).json({ error: "Failed to register user." });
  }
});

// התחברות משתמש קיים
// Login an existing user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // בדיקת קלט
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // חיפוש משתמש לפי מייל
    // Find user by email
    const sql = `SELECT user_id, first_name, last_name, email, password_hash, role FROM users WHERE email = ?`;
    const [results] = await db.query(sql, [email]);

    // אם לא נמצא משתמש
    // If no user found
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    const user = results[0];

    // בדיקת סיסמה
    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // יצירת JWT
    // Create JWT token
    const payload = { userId: user.user_id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    // מחזיר טוקן ופרטי משתמש
    // Return token and user info
    res.json({
      message: "Login successful",
      token: token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    // שגיאת שרת כללית
    // General server error
    console.error("Error during login process:", err);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

// ייצוא הראוטר לקובץ הראשי
// Export router for main app
module.exports = router;
