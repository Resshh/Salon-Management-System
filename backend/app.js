const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;


const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const stylistRoutes = require("./routes/stylistRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const notificationRoutes = require("./routes/notificationRoutes")
const feedbackRoutes = require("./routes/feedbackRoutes");
const serviceHistoryRoutes = require("./routes/serviceHistoryRoutes");


const db = require('./connection');
db();


app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/stylist", stylistRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/history", serviceHistoryRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})

