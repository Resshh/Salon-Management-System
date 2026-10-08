import { useState } from "react";
import CustomerFeedback from "./CustomerFeedback";
import CustomerComplaints from "./CustomerComplaints";

// One section with two tabs: Feedback and Complaints.
// Only the chosen tab is shown.

function CustomerFeedbackComplaints() {

    // "feedback" or "complaints"
    const [tab, setTab] = useState("feedback");

    const activeClass =
        "border-b-2 border-[#5a182b] pb-2 text-[#5a182b]";

    const normalClass =
        "border-b-2 border-transparent pb-2 text-[#6e5545] hover:text-[#5a182b]";

    return (
        <div id="support">

            {/* ================= TABS ================= */}

            <div className="flex gap-8 border-b border-[#d8c6b6] px-6 md:px-20 pt-16 text-sm tracking-[2px]">

                <button
                    type="button"
                    onClick={() => setTab("feedback")}
                    className={tab === "feedback" ? activeClass : normalClass}
                >
                    RATE A VISIT
                </button>

                <button
                    type="button"
                    onClick={() => setTab("complaints")}
                    className={tab === "complaints" ? activeClass : normalClass}
                >
                    RAISE A COMPLAINT
                </button>

            </div>


            {/* ================= CHOSEN TAB ================= */}

            {tab === "feedback"
                ? <CustomerFeedback />
                : <CustomerComplaints />}

        </div>
    );

}

export default CustomerFeedbackComplaints;
