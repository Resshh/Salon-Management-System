# BEAUTÉ — Salon Management & Booking System

A full-stack salon booking application built with the MERN stack (MongoDB, Express, React, Node.js).
Customers book appointments with stylists, stylists manage their schedule and bookings, and the admin runs the salon.

## Features

### Customer
- Register and log in
- Browse services (price, duration) and stylist profiles
- Book an appointment: choose a stylist, one of their services, a date and a free time slot
- Cancel or reschedule an appointment
- Pay online with Razorpay (coupons and membership discounts), or pay at the salon
- Automatic refund when a paid appointment is cancelled
- Service history, ratings and feedback, complaints
- Membership tier and loyalty points
- Live notifications in the navbar, plus email notifications

### Stylist
- Manage profile, offered services, working days and hours
- Accept or reject appointment requests
- Mark appointments as completed or no-show, record cash payments
- Filter appointments: today, next 7 days, upcoming
- View a customer's previous services, add service notes
- View ratings, completed services and earnings

### Admin
- Dashboard statistics
- Add, edit and delete stylists and customers
- Add, edit, delete, hide and show services
- View, approve, reschedule and cancel any appointment
- Salon working hours, weekly days off and holidays
- Memberships, loyalty points, coupons
- View feedback, respond to complaints
- Send notifications and offers to all customers

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Axios, Tailwind CSS |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens (JWT), bcrypt password hashing, role-based access |
| Payments | Razorpay (orders, signature verification, refunds, webhook) |
| Real time | Socket.IO (live notifications) |
| Email | Nodemailer (Gmail) |

## Project structure

```
backend/
  app.js            entry point: Express app, database connection, routes, Socket.IO
  connection.js     MongoDB connection
  createAdmin.js    creates the admin account
  routes/           URL → middleware → controller
  middleware/       authMiddleware (JWT), roleMiddleware (customer / stylist / admin)
  controllers/      logic for each endpoint
  models/           Mongoose schemas
  utils/            email, notifications, Socket.IO

frontend/src/
  App.jsx           page routes and role guards
  components/
    Login.jsx, Register.jsx
    Message.jsx, ConfirmBox.jsx, Modal.jsx, NotificationBell.jsx   (shared)
    customer/       customer dashboard sections
    stylist/        stylist dashboard sections
    admin/          admin dashboard sections
```

## Getting started

### Requirements
- Node.js 18 or newer
- A MongoDB database (local or MongoDB Atlas)
- A Gmail account with an app password (for emails)
- A Razorpay account in test mode (for payments)

### 1. Backend

```bash
cd backend
npm install
```

Create a file named `.env` inside `backend/`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_long_random_text
EMAIL_USER=your_gmail_address
EMAIL_PASSWORD=your_gmail_app_password
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=choose_a_strong_password
CLIENT_URL=https://your-frontend-address
```

`RAZORPAY_WEBHOOK_SECRET` is only needed if you set up the Razorpay webhook.
`ADMIN_EMAIL` and `ADMIN_PASSWORD` are used once, by `createAdmin.js`.
`CLIENT_URL` is only needed when the frontend is hosted; pages on `localhost` are always allowed.

Create the admin account, then start the server:

```bash
node createAdmin.js
npm run dev
```

The API runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## How an appointment works

| Step | Who | Appointment status | Payment |
|---|---|---|---|
| 1. Book a free slot | Customer | pending | unpaid |
| 2. Accept or reject | Stylist | approved / rejected | unpaid |
| 3. Pay online, or pay cash at the salon | Customer / Stylist | approved | paid |
| 4. Finish the service | Stylist | completed / no-show | paid |

A booking is accepted only if the salon is open, the stylist is working at that time, and the stylist has no
overlapping appointment. If a paid appointment is cancelled, an online payment is refunded in full.

## How payment works

1. The backend creates a Razorpay order. The amount is always calculated on the server from the service price,
   the customer's membership discount and any coupon.
2. The browser opens Razorpay Checkout.
3. Razorpay returns a payment id and a signature. The backend verifies the signature with HMAC-SHA256 before
   marking the appointment as paid.
4. A Razorpay webhook (`POST /api/payment/webhook`) records the payment as a backup if the browser closes early.

## Scripts

| Folder | Command | What it does |
|---|---|---|
| backend | `npm run dev` | Start the API with auto reload |
| backend | `npm start` | Start the API |
| frontend | `npm run dev` | Start the React app |
| frontend | `npm run build` | Build for production |
| frontend | `npm run lint` | Run ESLint |

## Author

Reshma Ann Thomas
