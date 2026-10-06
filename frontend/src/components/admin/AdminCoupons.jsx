import { useEffect, useState } from "react";
import axios from "axios";

function AdminCoupons() {

    const [coupons, setCoupons] = useState([]);

    const [code, setCode] = useState("");
    const [discountPercent, setDiscountPercent] = useState("");
    const [expiryDate, setExpiryDate] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        getCoupons();
    }, []);


    // ================= GET COUPONS =================

    const getCoupons = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/coupon/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setCoupons(response.data.coupons || []);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load coupons"
            );

        }

    };


    // ================= ADD COUPON =================

    const addCoupon = async (e) => {

        e.preventDefault();

        if (!code || !discountPercent || !expiryDate) {
            alert("Please fill all coupon details.");
            return;
        }

        try {

            await axios.post(
                "http://localhost:5000/api/coupon/",
                {
                    code: code,
                    discountPercent: Number(discountPercent),
                    expiryDate: expiryDate
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setCode("");
            setDiscountPercent("");
            setExpiryDate("");

            getCoupons();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to add coupon"
            );

        }

    };


    // ================= TURN COUPON ON / OFF =================

    const toggleCoupon = async (coupon) => {

        try {

            await axios.put(
                `http://localhost:5000/api/coupon/${coupon._id}`,
                {
                    active: !coupon.active
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            getCoupons();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to update coupon"
            );

        }

    };


    // ================= DELETE COUPON =================

    const deleteCoupon = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this coupon?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            await axios.delete(
                `http://localhost:5000/api/coupon/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            getCoupons();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to delete coupon"
            );

        }

    };


    const inputClass =
        "border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none";


    return (
        <section
            id="coupons"
            className="px-6 md:px-20 py-16 md:py-20"
        >

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                OFFERS
            </p>

            <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                Coupons &amp; Discounts
            </h2>

            <p className="mt-4 max-w-xl text-[#6e5545]">
                Customers enter the coupon code when they pay for an appointment.
            </p>


            {/* ================= ADD COUPON ================= */}

            <form
                onSubmit={addCoupon}
                className="mt-8 flex flex-col md:flex-row gap-3 border border-[#c9aa91] bg-[#efe2d5] p-8"
            >

                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Code, example WELCOME10"
                    className={`flex-1 uppercase ${inputClass}`}
                />

                <input
                    type="number"
                    min="1"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="Discount %"
                    className={inputClass}
                />

                <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className={inputClass}
                />

                <button
                    type="submit"
                    className="bg-[#5a182b] px-7 py-3 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                >
                    ADD COUPON
                </button>

            </form>


            {/* ================= COUPON LIST ================= */}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">

                {coupons.length > 0 ? (

                    coupons.map((coupon) => (

                        <div
                            key={coupon._id}
                            className="border border-[#d8c6b6] bg-[#efe2d5] p-6"
                        >

                            <h3 className="text-2xl text-[#5a182b]">
                                {coupon.code}
                            </h3>

                            <p className="mt-3 text-[#6e5545]">
                                {coupon.discountPercent}% off
                            </p>

                            <p className="mt-1 text-sm text-[#6e5545]">
                                Valid until{" "}
                                {new Date(
                                    coupon.expiryDate
                                ).toLocaleDateString()}
                            </p>

                            <p className="mt-1 text-sm text-[#8b6d57]">
                                {coupon.active ? "Active" : "Turned off"}
                            </p>

                            <div className="mt-5 flex gap-3">

                                <button
                                    onClick={() => toggleCoupon(coupon)}
                                    className="border border-[#5a182b] px-4 py-2 text-sm text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                                >
                                    {coupon.active ? "TURN OFF" : "TURN ON"}
                                </button>

                                <button
                                    onClick={() => deleteCoupon(coupon._id)}
                                    className="border border-[#5a182b] px-4 py-2 text-sm text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                                >
                                    DELETE
                                </button>

                            </div>

                        </div>

                    ))

                ) : (

                    <p className="text-[#6e5545]">
                        No coupons yet.
                    </p>

                )}

            </div>

        </section>
    );

}

export default AdminCoupons;
