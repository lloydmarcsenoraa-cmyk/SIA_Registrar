
require("dotenv").config();

const db = require("./db");

async function testDatabase() {
  try {
    const [rows] = await db.query(
      "SELECT DATABASE() AS databaseName"
    );

    console.log("MySQL connected successfully!");
    console.log("Database:", rows[0].databaseName);

    const [tables] = await db.query("SHOW TABLES");

    console.log("Tables found:", tables.length);

    tables.forEach((table) => {
      console.log("-", Object.values(table)[0]);
    });
  } catch (error) {
    console.error("Database connection failed!");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

testDatabase();
