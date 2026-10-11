const allowedOrigin = (origin, callback) => {

    if (!origin) {
        return callback(null, true);
    }

    const isLocal =
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

    if (isLocal || origin === process.env.CLIENT_URL) {
        return callback(null, true);
    }

    callback(null, false);

};

module.exports = allowedOrigin;
