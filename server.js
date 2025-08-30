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
app.post("/customers", async (req, res) => {
  const { Name, Email, Phone, Address } = req.body;
  try {
    let pool = await sql.connect(dbConfig);
    await pool.request()
      .input("Name", sql.VarChar, Name)
      .input("Email", sql.VarChar, Email)
      .input("Phone", sql.VarChar, Phone)
      .input("Address", sql.VarChar, Address)
      .query("INSERT INTO dbo.Customers (Name, Email, Phone, Address) VALUES (@Name, @Email, @Phone, @Address)");
    res.status(201).send({ message: "User added successfully" });
  } catch (err) {
    console.error("❌ Error inserting user:", err);
    res.status(500).send(err.message);
  }
});

// ✅ Get All Users (READ)
app.get("/customers", async (req, res) => {
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
app.put("/customers", async (req, res) => {
  const { id } = req.params;
  const { Name, Email, Phone, Address } = req.body;
  try {
    let pool = await sql.connect(dbConfig);
    await pool.request()
      .input("CustomerID", sql.Int, id)
      .input("Name", sql.VarChar, Name)
      .input("Email", sql.VarChar, Email)
      .input("Phone", sql.VarChar, Phone)
      .input("Address", sql.VarChar, Address)
      .query("UPDATE dbo.Customers SET Name=@Name, Email=@Email, Phone=@Phone, Address=@Address WHERE CustomerID=@CustomerID");
    res.send({ message: "User updated successfully" });
  } catch (err) {
    console.error("❌ Error updating user:", err);
    res.status(500).send(err.message);
  }
});

// ✅ Delete User (DELETE)
app.delete("/customers", async (req, res) => {
  const { id } = req.params;
  try {
    let pool = await sql.connect(dbConfig);
    await pool.request()
      .input("CustomerID", sql.Int, id)
      .query("DELETE FROM dbo.Customers WHERE CustomerID=@CustomerID");
    res.send({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).send(err.message);
  }
});

// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
