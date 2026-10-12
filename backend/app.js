const express = require('express');
const http = require('http');
const app = express();
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;


const userRoutes = require("./routes/userRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const stylistRoutes = require("./routes/stylistRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const notificationRoutes = require("./routes/notificationRoutes")
const feedbackRoutes = require("./routes/feedbackRoutes");
const serviceHistoryRoutes = require("./routes/serviceHistoryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const couponRoutes = require("./routes/couponRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const { initSocket } = require('./utils/socket');

const db = require('./connection');
db();


app.set('trust proxy', 1);

app.use(cors({
    origin: require('./utils/allowedOrigin')
}));


app.use(express.json({
    verify: (req, res, buffer) => {
        req.rawBody = buffer;
    }
}));
app.use(express.urlencoded({ extended: true }))

app.use("/api/user", userRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/stylist", stylistRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/history", serviceHistoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/complaint", complaintRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/attendance", attendanceRoutes);

const server = http.createServer(app);

initSocket(server);

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})

