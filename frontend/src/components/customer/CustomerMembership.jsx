import { useEffect, useState } from "react";
import axios from "axios";

function CustomerMembership() {

    const [user, setUser] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        getUser();
    }, []);


    // ================= MY DETAILS =================

    const getUser = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/user/me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setUser(response.data.user);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load membership"
            );

        }

    };


    if (!user) {
        return null;
    }

    // Discount each membership gives when paying
    let discountText = "No membership discount";

    if (user.membership === "silver") {
        discountText = "5% off every service";
    }

    if (user.membership === "gold") {
        discountText = "10% off every service";
    }


    return (
        <section className="px-6 md:px-20 pb-16">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <div className="border border-[#c9aa91] bg-[#efe2d5] p-6">

                    <p className="text-xs tracking-[2px] text-[#9a7b62]">
                        WELCOME
                    </p>

                    <p className="mt-3 text-2xl text-[#5a182b]">
                        {user.name}
                    </p>

                </div>

                <div className="border border-[#c9aa91] bg-[#efe2d5] p-6">

                    <p className="text-xs tracking-[2px] text-[#9a7b62]">
                        MEMBERSHIP
                    </p>

                    <p className="mt-3 text-2xl uppercase text-[#5a182b]">
                        {user.membership}
                    </p>

                    <p className="mt-2 text-sm text-[#6e5545]">
                        {discountText}
                    </p>

                </div>

                <div className="border border-[#c9aa91] bg-[#efe2d5] p-6">

                    <p className="text-xs tracking-[2px] text-[#9a7b62]">
                        LOYALTY POINTS
                    </p>

                    <p className="mt-3 text-2xl text-[#5a182b]">
                        {user.loyaltyPoints}
                    </p>

                    <p className="mt-2 text-sm text-[#6e5545]">
                        Earn 1 point for every ₹100 you pay
                    </p>

                </div>

            </div>

        </section>
    );

}

export default CustomerMembership;
