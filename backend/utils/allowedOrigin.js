const allowedOrigin = (origin, callback) => {

    // Tools like Postman or Razorpay's server send no "origin" at all
    if (!origin) {
        return callback(null, true);
    }

    const isLocal =
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

    if (isLocal || origin === process.env.CLIENT_URL) {
        return callback(null, true);
    }

    // Not allowed: the browser gets no permission header and blocks the response
    callback(null, false);

};

module.exports = allowedOrigin;
