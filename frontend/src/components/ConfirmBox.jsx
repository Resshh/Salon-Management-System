import Modal from "./Modal";

// A yes / no question. Replaces the browser confirm().
//
// How to use it in a component:
//   const [confirmBox, setConfirmBox] = useState(null);
//
//   setConfirmBox({
//       text: "Delete this service?",
//       onYes: () => deleteService(id)
//   });
//
//   <ConfirmBox confirmBox={confirmBox} onClose={() => setConfirmBox(null)} />

function ConfirmBox({ confirmBox, onClose }) {

    if (!confirmBox) {
        return null;
    }

    const clickYes = () => {

        // Close the box first, then run the action
        onClose();
        confirmBox.onYes();

    };

    return (
        <Modal
            title="Please confirm"
            onClose={onClose}
        >

            <p className="text-[#6e5545]">
                {confirmBox.text}
            </p>

            <div className="mt-6 flex gap-3">

                <button
                    type="button"
                    onClick={clickYes}
                    className="bg-[#5a182b] px-6 py-3 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                >
                    YES
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    className="border border-[#5a182b] px-6 py-3 text-sm tracking-[2px] text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                >
                    NO
                </button>

            </div>

        </Modal>
    );

}

export default ConfirmBox;
