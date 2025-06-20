// oleg bergin stefani kazmirchuk
// routes/search.js (new, simplified version)
const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getPromise(); // שימוש בשיטת ה-Promise החדשה
// Use the new Promise method for db access

// חיפוש עסקים עם סינון, מיון, ומידע על דירוגים
// Search businesses with filtering, sorting, and rating info
router.get("/businesses", async (req, res) => {
  try {
    // יצירת WHERE ופרמטרים מתאימים לפי בקשת המשתמש
    // Build WHERE clause and params based on client query
    const whereClauses = [];
    const params = [];

    if (req.query.searchTerm) {
      whereClauses.push(`(b.name LIKE ? OR b.description LIKE ?)`);
      const searchTerm = `%${req.query.searchTerm.trim()}%`;
      params.push(searchTerm, searchTerm);
    }
    if (req.query.category) {
      whereClauses.push(`b.category = ?`);
      params.push(req.query.category.trim());
    }

    // בניית משפט WHERE ל-SQL
    // Build WHERE SQL string
    const whereSql =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // שאילתה לספירת כמות העסקים התואמים
    // Query for counting total matching businesses
    let countSql = `SELECT COUNT(DISTINCT b.business_id) as total FROM businesses b ${whereSql}`;

    // שאילתה עיקרית לקבלת תוצאות העמוד
    // Main query for getting paginated results
    let resultsSql = `
      SELECT 
        b.business_id, b.name, b.category, b.description, b.location, b.photos, b.phone,
        COALESCE(AVG(r.rating), 0) as average_rating, 
        COUNT(r.review_id) as review_count
      FROM businesses b
      LEFT JOIN reviews r ON b.business_id = r.business_id
      ${whereSql}
      GROUP BY b.business_id
    `;

    const resultsParams = [...params]; // העתקת הפרמטרים לשאילתה העיקרית
    // Copy params for main results query

    // סינון לפי דירוג מינימלי אם נדרש
    // Filter by min rating if needed
    if (req.query.min_rating && parseFloat(req.query.min_rating) > 0) {
      resultsSql += ` HAVING average_rating >= ?`;
      resultsParams.push(parseFloat(req.query.min_rating));
    }

    // מיון לפי בקשת המשתמש (ברירת מחדל - שם)
    // Sort by client orderBy (default: name)
    const orderBy = req.query.orderBy || "name";
    switch (orderBy) {
      case "category":
        resultsSql += ` ORDER BY b.category ASC, b.name ASC`;
        break;
      case "rating":
        resultsSql += ` ORDER BY average_rating DESC, b.name ASC`;
        break;
      case "newest":
        resultsSql += ` ORDER BY b.business_id DESC`;
        break;
      default: // 'name'
        resultsSql += ` ORDER BY b.name ASC`;
        break;
    }

    // הגבלת תוצאות והזזה (pagination)
    // Pagination: limit and offset
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    resultsSql += ` LIMIT ? OFFSET ?`;
    resultsParams.push(limit, offset);

    // הרצת שתי השאילתות במקביל
    // Run both queries in parallel
    const [
      [countResult], // תוצאה של כמות העסקים
      [results], // תוצאות העסקים עצמם
    ] = await Promise.all([
      db.query(countSql, params),
      db.query(resultsSql, resultsParams),
    ]);

    // החזרת התוצאות והכמות ללקוח
    // Send total and results to client
    res.json({
      results: results,
      total: countResult[0].total,
    });
  } catch (err) {
    // שגיאה בשאילתת עסקים
    // Error in business query
    console.error("Error in /search/businesses:", err);
    res.status(500).json({ error: "Database query failed." });
  }
});

module.exports = router;
