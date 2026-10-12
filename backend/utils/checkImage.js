const isBadImage = (image) => {

    return (
        typeof image !== "string" ||
        !image.startsWith("data:image/jpeg;base64,") ||
        image.length > 90000
    );

};

module.exports = isBadImage;
