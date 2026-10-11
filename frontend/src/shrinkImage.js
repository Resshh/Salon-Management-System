// Shrinks a picture file in the browser before it is sent to the backend.
// A camera picture is several MB, far too big to save in the database.
//
// How to use it in a component:
//   import shrinkImage from "../../shrinkImage";
//   shrinkImage(file, 480, 360, setImage, () => setMessage({ ... }));
//
//   file          = the file from <input type="file">
//   width, height = the size of the small picture
//   onDone        = called with the small picture as text ("data:image/jpeg;base64,...")
//   onError       = called when the file is not a picture

function shrinkImage(file, width, height, onDone, onError) {

    const picture = new Image();

    // Runs once the browser has finished reading the picture
    picture.onload = () => {

        // A canvas is an invisible drawing board
        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        // Cut the biggest piece of the wanted shape out of the middle of the picture
        const cropWidth = Math.min(picture.width, picture.height * width / height);
        const cropHeight = cropWidth * height / width;
        const left = (picture.width - cropWidth) / 2;
        const top = (picture.height - cropHeight) / 2;

        // Draw that piece onto the canvas, scaled down to the small size
        canvas
            .getContext("2d")
            .drawImage(picture, left, top, cropWidth, cropHeight, 0, 0, width, height);

        // Turn the drawing into text and hand it back
        onDone(canvas.toDataURL("image/jpeg", 0.7));

        // Free the memory of the temporary address
        URL.revokeObjectURL(picture.src);

    };

    // Runs when the file is not a picture
    picture.onerror = onError;

    // A temporary address that points at the chosen file
    picture.src = URL.createObjectURL(file);

}

export default shrinkImage;
