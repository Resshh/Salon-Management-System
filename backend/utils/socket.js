const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

// The Socket.IO server. It is created once, when the app starts.
let io = null;


// Called from app.js with the HTTP server
const initSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    // Runs before a browser is allowed to connect:
    // the browser must send the same JWT it uses for the API
    io.use((socket, next) => {

        try {

            const decoded = jwt.verify(
                socket.handshake.auth.token,
                process.env.JWT_SECRET
            );

            socket.userId = decoded.userId;

            next();

        } catch (error) {

            next(new Error("Invalid or expired token"));

        }

    });

    io.on("connection", (socket) => {

        // Every user joins a "room" named after their own user id.
        // To reach one user, we send a message to that room.
        socket.join(socket.userId);

    });

};


// Send a new notification to one user, if they are online
const sendToUser = (userId, notification) => {

    if (!io) {
        return;
    }

    io.to(userId.toString()).emit("notification", notification);

};


module.exports = {
    initSocket,
    sendToUser
};
