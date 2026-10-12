import Modal from "./Modal";

function ConfirmBox({ confirmBox, onClose }) {

    if (!confirmBox) {
        return null;
    }

    const clickYes = () => {

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
