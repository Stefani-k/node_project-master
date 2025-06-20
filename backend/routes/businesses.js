const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getPromise();

/* הוספת עסק חדש */
router.post("/", async (req, res) => {
  let {
    name,
    category,
    description,
    location,
    phone,
    photos = "[]",
    schedule = null, // ברירת מחדל: null
    email = null, // ברירת מחדל: null
    owner_id = null,
  } = req.body;

  // אם נשלח ריק – תהפוך ל־null (כדי למנוע שגיאת constraint)
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
    // תחזיר ללקוח את כל הנתונים של העסק החדש (אפשר גם לשלוף אותו מחדש)
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
    console.error("DB error creating business:", err);
    res.status(500).json({ error: "Failed to create business." });
  }
});

/* שליפת כל העסקים */
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM businesses");
    res.json(rows);
  } catch (err) {
    console.error("DB error fetching businesses:", err);
    res.status(500).json({ error: "Failed to fetch businesses." });
  }
});

/* שליפת עסק בודד לפי מזהה */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM businesses WHERE business_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("DB error fetching business:", err);
    res.status(500).json({ error: "Failed to fetch business." });
  }
});

// עדכון עסק קיים
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
    owner_id // ייתכן ולא נשלח בכלל!
  } = req.body;

  // שלוף את הערך הקיים מה־DB
  let existingBusiness;
  try {
    const [rows] = await db.query("SELECT * FROM businesses WHERE business_id = ?", [businessId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Business not found" });
    }
    existingBusiness = rows[0];
  } catch (err) {
    console.error("DB error fetching business:", err);
    return res.status(500).json({ error: "Failed to fetch business." });
  }

  // שמור על owner_id קיים אם לא הגיע מהקליינט
  if (!owner_id) {
    owner_id = existingBusiness.owner_id;
  }

  // בדיקת schedule/email – אם ריק, הפוך ל־null
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
      return res.status(404).json({ error: "Business not found" });
    }
    res.json({ message: "Business updated successfully" });
  } catch (err) {
    console.error("DB error updating business:", err);
    res.status(500).json({ error: "Failed to update business." });
  }
});



/* מחיקת עסק */
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM businesses WHERE business_id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "עסק לא נמצא" });
    }
    res.json({ message: "העסק נמחק בהצלחה" });
  } catch (err) {
    console.error("DB error deleting business:", err);
    res.status(500).json({ error: "שגיאה במחיקת עסק" });
  }
});

module.exports = router;
