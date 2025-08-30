const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json()); // built-in JSON parser

// === Serve index.html directly from root ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ Azure SQL Config (updated)
const dbConfig = {
  user: "ben",                        // your SQL login username
  password: "Connect@1234",            // your SQL login password
  database: "sqldboneben",             // your DB name
  server: "sqlserveroneben.database.windows.net", // full Azure SQL server name
  options: {
    encrypt: true,                     // required for Azure SQL
    trustServerCertificate: false
  }
};

sql.connect(dbConfig)
   .then(() => console.log("✅ DB Connected Successfully"))
   .catch(err => console.error("❌ DB Connection Failed:", err));

// ✅ Add User (CREATE)
app.post("/api/users", async (req, res) => {
  const { name, email, age } = req.body;
  try {
    let pool = await sql.connect(dbConfig);
    await pool.request()
      .input("name", sql.NVarChar, name)
      .input("email", sql.NVarChar, email)
      .input("age", sql.Int, age)
      .query("INSERT INTO dbo.Customers (name, email, phone, address) VALUES (@name, @email, @age)");
    res.send({ message: "User added successfully" });
  } catch (err) {
    console.error("❌ Error inserting user:", err);
    res.status(500).send(err.message);
  }
});

// ✅ Get All Users (READ)
app.get("/api/users", async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query("SELECT * FROM dbo.Customers");
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).send(err.message);
  }
});

// ✅ Update User (UPDATE)
app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, age } = req.body;
  try {
    let pool = await sql.connect(dbConfig);
    await pool.request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("email", sql.NVarChar, email)
      .input("age", sql.Int, age)
      .query("UPDATE dbo.Customers SET name=@name, email=@email, age=@age WHERE id=@id");
    res.send({ message: "User updated successfully" });
  } catch (err) {
    console.error("❌ Error updating user:", err);
    res.status(500).send(err.message);
  }
});

// ✅ Delete User (DELETE)
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let pool = await sql.connect(dbConfig);
    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Users WHERE id=@id");
    res.send({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).send(err.message);
  }
});

// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
