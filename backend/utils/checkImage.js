// Checks a picture sent by the browser (a service picture or a stylist photo).
// The browser already shrinks it, but never trust the browser:
// it must be a JPEG picture saved as text, and not too long.
// Returns true when the picture is NOT acceptable.
const isBadImage = (image) => {

    return (
        typeof image !== "string" ||
        !image.startsWith("data:image/jpeg;base64,") ||
        image.length > 90000
    );

};

module.exports = isBadImage;
