import { useEffect, useState } from "react";
import axios from "axios";
import Message from "../Message";
import Modal from "../Modal";
import ConfirmBox from "../ConfirmBox";

function AdminCustomers() {

    // Success / error message shown at the top right
    const [message, setMessage] = useState(null);

    // Customer being edited (null = box hidden)
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editPoints, setEditPoints] = useState("");

    // Yes / no question box (null = hidden)
    const [confirmBox, setConfirmBox] = useState(null);

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

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to update customer"
            });

        }

    };


    // ================= EDIT CUSTOMER =================

    const editCustomer = (customer) => {

        // Open the edit box with the current values filled in
        setEditName(customer.name);
        setEditPhone(customer.phone);
        setEditPoints(customer.loyaltyPoints || 0);
        setEditingCustomer(customer);

    };


    // ================= SAVE CUSTOMER =================

    const saveCustomer = (e) => {

        e.preventDefault();

        if (!editName.trim() || !editPhone.trim()) {
            setMessage({
                type: "error",
                text: "Please enter a name and a phone number."
            });
            return;
        }

        if (editPoints === "" || Number(editPoints) < 0) {
            setMessage({
                type: "error",
                text: "Loyalty points must be 0 or more."
            });
            return;
        }

        updateCustomer(editingCustomer._id, {
            name: editName,
            phone: editPhone,
            loyaltyPoints: Number(editPoints)
        });

        setEditingCustomer(null);

    };


    // ================= DELETE CUSTOMER =================

    const deleteCustomer = (customer) => {

        // Ask first. The real work happens only after the user clicks YES.
        setConfirmBox({
            text: `Delete customer ${customer.name}? This cannot be undone.`,
            onYes: () => deleteCustomerConfirmed(customer)
        });

    };


    const deleteCustomerConfirmed = async (customer) => {

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

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to delete customer"
            });

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
                                        {customer.loyaltyPoints || 0}
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

            {/* ================= EDIT BOX ================= */}

            {editingCustomer && (

                <Modal
                    title="Edit customer"
                    onClose={() => setEditingCustomer(null)}
                >

                    <form onSubmit={saveCustomer}>

                        <label className="text-sm text-[#6e5545]">
                            Name
                        </label>

                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                        />

                        <label className="mt-4 block text-sm text-[#6e5545]">
                            Phone
                        </label>

                        <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                        />

                        <label className="mt-4 block text-sm text-[#6e5545]">
                            Loyalty points
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={editPoints}
                            onChange={(e) => setEditPoints(e.target.value)}
                            className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                        />

                        <button
                            type="submit"
                            className="mt-6 bg-[#5a182b] px-6 py-3 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                        >
                            SAVE CUSTOMER
                        </button>

                    </form>

                </Modal>

            )}

            <Message
                message={message}
                onClose={() => setMessage(null)}
            />

            <ConfirmBox
                confirmBox={confirmBox}
                onClose={() => setConfirmBox(null)}
            />

        </section>
    );

}

export default AdminCustomers;
