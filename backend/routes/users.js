// backend/routes/users.js
const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getPromise();

/**
 * GET a single user's public profile information by their ID.
 * We specifically DO NOT select the password hash.
 */
router.get("/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const sql =
      "SELECT user_id, first_name, last_name, email, phone, role FROM users WHERE user_id = ?";
    const [rows] = await db.query(sql, [userId]);

    // Check if a user was found
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user data
    res.json(rows[0]);
  } catch (err) {
    console.error(`DB error fetching user with id ${userId}:`, err);
    res.status(500).json({ error: "Failed to fetch user details." });
  }
});

module.exports = router;
