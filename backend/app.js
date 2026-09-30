const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;


const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");


const db = require('./connection');
db();


app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})

