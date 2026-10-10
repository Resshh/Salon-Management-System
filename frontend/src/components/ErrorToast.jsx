import { useEffect, useState } from "react";
import Message from "./Message";

// Shows the errors sent by showError() in api.js.
// It is placed once in App.jsx, so every page can show an error
// without having its own message state.

function ErrorToast() {

    const [message, setMessage] = useState(null);

    useEffect(() => {

        // event.detail is the text passed to showError()
        const onError = (event) => {
            setMessage({ type: "error", text: event.detail });
        };

        window.addEventListener("app-error", onError);

        // Stop listening when the component is removed
        return () => window.removeEventListener("app-error", onError);

    }, []);

    return (
        <Message message={message} onClose={() => setMessage(null)} />
    );

}

export default ErrorToast;
