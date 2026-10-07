import { useEffect } from "react";

// A small message box in the top right corner. Replaces the browser alert().
//
// How to use it in a component:
//   const [message, setMessage] = useState(null);
//   setMessage({ type: "success", text: "Saved." });
//   setMessage({ type: "error", text: "Something went wrong." });
//   <Message message={message} onClose={() => setMessage(null)} />

function Message({ message, onClose }) {

    // Hide the message by itself after 4 seconds
    useEffect(() => {

        if (!message) {
            return;
        }

        const timer = setTimeout(onClose, 4000);

        // Stop the old timer if a new message arrives first
        return () => clearTimeout(timer);

    }, [message]);


    if (!message) {
        return null;
    }

    let colorClass = "border-green-700 text-green-800";

    if (message.type === "error") {
        colorClass = "border-red-700 text-red-800";
    }

    return (
        <div
            role="alert"
            className={`fixed top-5 right-5 z-50 flex max-w-sm items-start gap-4 border-l-4 bg-white p-4 shadow-lg ${colorClass}`}
        >

            <p className="text-sm leading-6">
                {message.text}
            </p>

            <button
                onClick={onClose}
                aria-label="Close message"
                className="text-lg leading-none text-[#6e5545] hover:text-[#321d1d]"
            >
                ×
            </button>

        </div>
    );

}

export default Message;
