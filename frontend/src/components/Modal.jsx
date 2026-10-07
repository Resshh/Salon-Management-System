// A box in the middle of the screen with a dark background behind it.
// Whatever is written between <Modal> and </Modal> is shown inside the box.
// React passes that content in the special prop called "children".
//
// How to use it:
//   {showBox && (
//       <Modal title="Reschedule" onClose={() => setShowBox(false)}>
//           ...form goes here...
//       </Modal>
//   )}

function Modal({ title, children, onClose }) {

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">

            <div
                role="dialog"
                aria-label={title}
                className="w-full max-w-md border border-[#c9aa91] bg-[#f7efe5] p-8"
            >

                <div className="flex items-start justify-between gap-4">

                    <h3 className="text-2xl text-[#5a182b]">
                        {title}
                    </h3>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-2xl leading-none text-[#6e5545] hover:text-[#321d1d]"
                    >
                        ×
                    </button>

                </div>

                <div className="mt-5">
                    {children}
                </div>

            </div>

        </div>
    );

}

export default Modal;
