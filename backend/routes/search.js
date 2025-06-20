// routes/search.js (new, simplified version)
const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getPromise(); // Use our new method!

router.get("/businesses", async (req, res) => {
  // <-- Add async
  try {
    // --- Step 1: Build the WHERE clauses and parameters just ONCE ---
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

    // Combine clauses into a string, e.g., "WHERE (b.name LIKE ...) AND b.category = ?"
    const whereSql =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // --- Step 2: Build the query for counting total items ---
    let countSql = `SELECT COUNT(DISTINCT b.business_id) as total FROM businesses b ${whereSql}`;

    // --- Step 3: Build the main query for getting the page results ---
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

    const resultsParams = [...params]; // Copy params for the results query

    if (req.query.min_rating && parseFloat(req.query.min_rating) > 0) {
      resultsSql += ` HAVING average_rating >= ?`; // Use the alias here
      resultsParams.push(parseFloat(req.query.min_rating));
    }

    // Handle ordering
    const orderBy = req.query.orderBy || 'name';
    switch (orderBy) {
      case 'category':
        resultsSql += ` ORDER BY b.category ASC, b.name ASC`;
        break;
      case 'rating':
        resultsSql += ` ORDER BY average_rating DESC, b.name ASC`;
        break;
      case 'newest':
        resultsSql += ` ORDER BY b.business_id DESC`;
        break;
      default: // 'name'
        resultsSql += ` ORDER BY b.name ASC`;
        break;
    }

    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    resultsSql += ` LIMIT ? OFFSET ?`;
    resultsParams.push(limit, offset);

    // --- Step 4: Execute both queries at the same time ---
    // Promise.all runs both queries in parallel, which is more efficient.
    const [
      [countResult], // The result from the first query (count)
      [results], // The result from the second query (data)
    ] = await Promise.all([
      db.query(countSql, params),
      db.query(resultsSql, resultsParams),
    ]);

    // --- Step 5: Send the combined response ---
    res.json({
      results: results,
      total: countResult[0].total,
    });
  } catch (err) {
    console.error("Error in /search/businesses:", err);
    res.status(500).json({ error: "Database query failed." });
  }
});

module.exports = router;
