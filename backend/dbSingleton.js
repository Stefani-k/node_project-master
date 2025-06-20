// oleg bergin stefani kazmirchuk
// dbSingleton.js
const mysql = require("mysql2");

let connection; // Variable for storing the single connection

// Function to handle creating/recreating the connection
function handleConnect() {
  // Create a connection only if one doesn't exist
  connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "pronode_db",
    charset: "utf8mb4",
  });

  // Connect to the database
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to database:", err);
      // In case of a connection error, try to reconnect after 2 seconds
      setTimeout(handleConnect, 2000);
      return;
    }
    console.log("Successfully connected to MySQL!");
  });

  // Handle connection errors after the initial connection
  connection.on("error", (err) => {
    console.error("Database connection error:", err);
    // If the connection is lost, try to reconnect
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("Reconnecting to the database...");
      handleConnect();
    } else {
      throw err;
    }
  });
}

// Initial call to connect
handleConnect();

// The singleton object that we export
const dbSingleton = {
  getConnection: () => {
    // This function will simply return the existing connection object
    return connection;
  },
  // This gives us a "promisified" version of the connection, perfect for async/await
  getPromise: () => {
    return connection.promise();
  },
};

module.exports = dbSingleton;
