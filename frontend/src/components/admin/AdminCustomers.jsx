import { useEffect, useState } from "react";
import axios from "axios";

function AdminCustomers() {

    const [customers, setCustomers] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {
        getCustomers();
    }, []);


    // ================= GET CUSTOMERS =================

    const getCustomers = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/admin/customers",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setCustomers(response.data.customers || []);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load customers"
            );

        }

    };


    // ================= UPDATE CUSTOMER =================

    // data can be { name, phone }, { membership } or { loyaltyPoints }
    const updateCustomer = async (id, data) => {

        try {

            await axios.put(
                `http://localhost:5000/api/admin/users/${id}`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            getCustomers();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to update customer"
            );

        }

    };


    // ================= EDIT NAME AND PHONE =================

    const editCustomer = (customer) => {

        const newName = window.prompt(
            "Customer name:",
            customer.name
        );

        if (!newName) {
            return;
        }

        const newPhone = window.prompt(
            "Phone number:",
            customer.phone
        );

        if (!newPhone) {
            return;
        }

        updateCustomer(customer._id, {
            name: newName,
            phone: newPhone
        });

    };


    // ================= EDIT LOYALTY POINTS =================

    const editPoints = (customer) => {

        const points = window.prompt(
            "Loyalty points:",
            customer.loyaltyPoints
        );

        // Stop if cancelled, empty, not a number or negative
        if (
            points === null ||
            points.trim() === "" ||
            isNaN(points) ||
            Number(points) < 0
        ) {
            return;
        }

        updateCustomer(customer._id, {
            loyaltyPoints: Number(points)
        });

    };


    // ================= DELETE CUSTOMER =================

    const deleteCustomer = async (customer) => {

        const confirmDelete = window.confirm(
            `Delete customer ${customer.name}? This cannot be undone.`
        );

        if (!confirmDelete) {
            return;
        }

        try {

            await axios.delete(
                `http://localhost:5000/api/admin/users/${customer._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            getCustomers();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to delete customer"
            );

        }

    };


    return (
        <section
            id="customers"
            className="bg-[#efe2d5] px-6 md:px-20 py-16 md:py-20"
        >

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                YOUR CLIENTS
            </p>

            <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                Customers
            </h2>

            {customers.length > 0 ? (

                <div className="mt-8 overflow-x-auto border border-[#c9aa91] bg-[#f7efe5]">

                    <table className="w-full text-left text-sm">

                        <thead>
                            <tr className="border-b border-[#c9aa91] text-xs tracking-[2px] text-[#9a7b62]">
                                <th className="p-4 font-normal">NAME</th>
                                <th className="p-4 font-normal">EMAIL</th>
                                <th className="p-4 font-normal">PHONE</th>
                                <th className="p-4 font-normal">MEMBERSHIP</th>
                                <th className="p-4 font-normal">POINTS</th>
                                <th className="p-4 font-normal">JOINED</th>
                                <th className="p-4 font-normal">ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody>

                            {customers.map((customer) => (

                                <tr
                                    key={customer._id}
                                    className="border-b border-[#d8c6b6] text-[#6e5545]"
                                >
                                    <td className="p-4 text-[#321d1d]">
                                        {customer.name}
                                    </td>
                                    <td className="p-4">
                                        {customer.email}
                                    </td>
                                    <td className="p-4">
                                        {customer.phone}
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={customer.membership || "none"}
                                            onChange={(e) =>
                                                updateCustomer(customer._id, {
                                                    membership: e.target.value
                                                })
                                            }
                                            className="border border-[#c9aa91] bg-[#f7efe5] p-2 text-[#321d1d] outline-none"
                                        >
                                            <option value="none">None</option>
                                            <option value="silver">Silver (5% off)</option>
                                            <option value="gold">Gold (10% off)</option>
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        {customer.loyaltyPoints || 0}{" "}
                                        <button
                                            onClick={() => editPoints(customer)}
                                            className="ml-2 text-[#5a182b] underline"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        {new Date(
                                            customer.createdAt
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => editCustomer(customer)}
                                            className="text-[#5a182b] underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteCustomer(customer)}
                                            className="ml-3 text-[#5a182b] underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            ) : (

                <p className="mt-8 text-[#6e5545]">
                    No customers yet.
                </p>

            )}

        </section>
    );

}

export default AdminCustomers;
