// oleg bergin stefani kazmirchuk
const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getPromise();

// הוספת עסק חדש
// Add a new business
router.post("/", async (req, res) => {
  let {
    name,
    category,
    description,
    location,
    phone,
    photos = "[]",
    schedule = null, // ברירת מחדל: null
    email = null, // default: null
    owner_id = null,
  } = req.body;

  // אם נשלח ריק – תהפוך ל־null (כדי למנוע שגיאת constraint)
  // If sent as empty string, set to null (to avoid constraint error)
  if (!schedule || schedule === "") schedule = null;
  if (!email || email === "") email = null;

  const sql = `
    INSERT INTO businesses (name, category, description, location, phone, photos, schedule, email, owner_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    name,
    category,
    description,
    location,
    phone,
    photos,
    schedule,
    email,
    owner_id,
  ];

  try {
    const [result] = await db.query(sql, params);
    // מחזיר ללקוח את פרטי העסק החדש
    // Return new business data to client
    res.status(201).json({
      business_id: result.insertId,
      name,
      category,
      description,
      location,
      phone,
      photos,
      schedule,
      email,
      owner_id,
      message: "Business created",
    });
  } catch (err) {
    // שגיאה ביצירת עסק
    // Error creating business
    console.error("DB error creating business:", err);
    res.status(500).json({ error: "Failed to create business." });
  }
});

// שליפת כל העסקים
// Get all businesses
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM businesses");
    res.json(rows);
  } catch (err) {
    // שגיאה בשליפת עסקים
    // Error fetching businesses
    console.error("DB error fetching businesses:", err);
    res.status(500).json({ error: "Failed to fetch businesses." });
  }
});

// שליפת עסק בודד לפי מזהה
// Get a single business by ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM businesses WHERE business_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      // עסק לא נמצא
      // Business not found
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    // שגיאה בשליפת עסק
    // Error fetching business
    console.error("DB error fetching business:", err);
    res.status(500).json({ error: "Failed to fetch business." });
  }
});

// עדכון עסק קיים
// Update existing business
router.put("/:id", async (req, res) => {
  const businessId = req.params.id;
  let {
    name,
    category,
    description,
    location,
    phone,
    photos = "[]",
    schedule = null,
    email = null,
    owner_id, // ייתכן ולא נשלח בכלל!
  } = req.body;

  // שליפת עסק קיים
  // Fetch existing business
  let existingBusiness;
  try {
    const [rows] = await db.query(
      "SELECT * FROM businesses WHERE business_id = ?",
      [businessId]
    );
    if (rows.length === 0) {
      // עסק לא נמצא
      // Business not found
      return res.status(404).json({ error: "Business not found" });
    }
    existingBusiness = rows[0];
  } catch (err) {
    // שגיאה בשליפת עסק
    // Error fetching business
    console.error("DB error fetching business:", err);
    return res.status(500).json({ error: "Failed to fetch business." });
  }

  // שמור על owner_id קיים אם לא הגיע מהקליינט
  // Keep the existing owner_id if not sent from client
  if (!owner_id) {
    owner_id = existingBusiness.owner_id;
  }

  // אם schedule/email ריק, הפוך ל־null
  // If schedule/email empty, set to null
  if (!schedule || schedule === "") schedule = null;
  if (!email || email === "") email = null;

  const sql = `
    UPDATE businesses
    SET name = ?, category = ?, description = ?, location = ?, phone = ?, photos = ?, schedule = ?, email = ?, owner_id = ?
    WHERE business_id = ?
  `;
  const params = [
    name,
    category,
    description,
    location,
    phone,
    photos,
    schedule,
    email,
    owner_id,
    businessId,
  ];

  try {
    const [result] = await db.query(sql, params);
    if (result.affectedRows === 0) {
      // עסק לא נמצא
      // Business not found
      return res.status(404).json({ error: "Business not found" });
    }
    // עדכון בוצע בהצלחה
    // Update successful
    res.json({ message: "Business updated successfully" });
  } catch (err) {
    // שגיאה בעדכון עסק
    // Error updating business
    console.error("DB error updating business:", err);
    res.status(500).json({ error: "Failed to update business." });
  }
});

// מחיקת עסק
// Delete a business
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM businesses WHERE business_id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      // עסק לא נמצא
      // Business not found
      return res.status(404).json({ error: "עסק לא נמצא" });
    }
    // מחיקת עסק בוצעה בהצלחה
    // Business deleted successfully
    res.json({ message: "העסק נמחק בהצלחה" });
  } catch (err) {
    // שגיאה במחיקת עסק
    // Error deleting business
    console.error("DB error deleting business:", err);
    res.status(500).json({ error: "שגיאה במחיקת עסק" });
  }
});

// ייצוא הראוטר לקובץ הראשי
// Export router for main app
module.exports = router;
