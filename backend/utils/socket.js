const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const allowedOrigin = require("./allowedOrigin");

let io = null;
const initSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: allowedOrigin
        }
    });

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
        socket.join(socket.userId);

    });

};

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
