"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InvoicesPage() {
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("bgvUser");
    if (!stored) {
      router.replace("/");
      return;
    }

    const user = JSON.parse(stored);
    const role = user.role?.toUpperCase();

    // ❌ SUPER_ADMIN_HELPER cannot access invoices
    if (role === "SUPER_ADMIN_HELPER") {
      router.replace("/superadmin/dashboard");
    }
  }, []);

  /* -----------------------------------------------------------
   INVOICES STATE
  ----------------------------------------------------------- */
  const [invoices, setInvoices] = useState([
    {
      id: "INV001",
      org: "ABC Corp",
      amount: 5000,
      discount: 0,
      referral: "John Doe",
      status: "Paid",
      date: "2025-09-25",
    },
    {
      id: "INV002",
      org: "XYZ Ltd",
      amount: 8000,
      discount: 0,
      referral: "",
      status: "Pending",
      date: "2025-09-26",
    },
    {
      id: "INV003",
      org: "DEF Pvt",
      amount: 6000,
      discount: 10,
      referral: "Nisha Patel",
      status: "Overdue",
      date: "2025-09-20",
    },
  ]);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [discountValue, setDiscountValue] = useState("");
  const [referralName, setReferralName] = useState("");

  /* -----------------------------------------------------------
   REFERRAL INVOICE MODAL STATE
  ----------------------------------------------------------- */
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralInvoiceData, setReferralInvoiceData] = useState({
    referral: "",
    org: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    status: "Pending",
    remarks: "",
  });

  /* -----------------------------------------------------------
   HANDLERS
  ----------------------------------------------------------- */
  const handleMarkPaid = (id) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "Paid" } : inv))
    );
  };

  const handleApplyDiscount = (id) => {
    if (discountValue === "" || isNaN(discountValue) || discountValue < 0) {
      alert("Enter a valid discount percentage (0-100)");
      return;
    }
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              discount: Number(discountValue),
              amount: Math.round(inv.amount * (1 - discountValue / 100)),
            }
          : inv
      )
    );
    setDiscountValue("");
    setSelectedInvoice(null);
  };

  const handleAddReferral = (id) => {
    if (!referralName.trim()) {
      alert("Enter referral name");
      return;
    }
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, referral: referralName } : inv
      )
    );

    // Open Referral Invoice Modal
    const thisInvoice = invoices.find((i) => i.id === id);

    setReferralInvoiceData({
      referral: referralName,
      org: thisInvoice.org,
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      status: "Pending",
      remarks: "",
    });

    setShowReferralModal(true);

    setReferralName("");
    setSelectedInvoice(null);
  };

  /* -----------------------------------------------------------
   AUTO-INVOICE ID GENERATOR
  ----------------------------------------------------------- */
  const generateInvoiceId = () => {
    const number = invoices.length + 1;
    return "INV" + String(number).padStart(3, "0");
  };

  /* -----------------------------------------------------------
   SAVE NEW REFERRAL INVOICE
  ----------------------------------------------------------- */
  const handleCreateReferralInvoice = () => {
    if (!referralInvoiceData.amount || isNaN(referralInvoiceData.amount)) {
      alert("Enter valid invoice amount");
      return;
    }

    const newInvoice = {
      id: generateInvoiceId(),
      org: referralInvoiceData.org,
      referral: referralInvoiceData.referral,
      amount: Number(referralInvoiceData.amount),
      discount: 0,
      status: referralInvoiceData.status,
      date: referralInvoiceData.date,
      remarks: referralInvoiceData.remarks,
    };

    setInvoices((prev) => [...prev, newInvoice]); // add at bottom (Option B)

    setShowReferralModal(false);
  };

  /* -----------------------------------------------------------
   UI START
  ----------------------------------------------------------- */
  return (
    <div className="p-4 md:p-8 space-y-10 text-black">
      <h1 className="text-3xl font-bold text-[#ff004f]">Invoices</h1>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-white p-6 rounded-xl shadow-lg border border-red-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-red-50 text-red-800 border-b border-red-200">
              <th className="p-3">Invoice ID</th>
              <th className="p-3">Organization</th>
              <th className="p-3">Referral</th>
              <th className="p-3">Discount (%)</th>
              <th className="p-3">Final Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b hover:bg-red-50 transition">
                <td className="p-3">{inv.id}</td>
                <td className="p-3 font-semibold">{inv.org}</td>
                <td className="p-3 text-green-700">
                  {inv.referral || (
                    <span className="text-black/60 italic">—</span>
                  )}
                </td>
                <td className="p-3">
                  {inv.discount ? `${inv.discount}%` : "—"}
                </td>
                <td className="p-3 font-semibold">
                  ₹{inv.amount.toLocaleString()}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-white text-sm ${
                      inv.status === "Paid"
                        ? "bg-green-600"
                        : inv.status === "Pending"
                        ? "bg-yellow-500"
                        : "bg-red-600"
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>

                <td className="p-3">{inv.date}</td>

                <td className="p-3 space-y-2 flex flex-col">
                  {inv.status !== "Paid" && (
                    <button
                      onClick={() => handleMarkPaid(inv.id)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                    >
                      Mark Paid
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedInvoice(inv.id)}
                    className="w-full border border-red-600 text-red-700 hover:bg-red-600 hover:text-white px-3 py-1 rounded transition"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-4">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="bg-white p-4 rounded-xl shadow-lg border border-red-200 space-y-2"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{inv.org}</h3>
              <span
                className={`px-2 py-1 rounded text-white text-sm ${
                  inv.status === "Paid"
                    ? "bg-green-600"
                    : inv.status === "Pending"
                    ? "bg-yellow-500"
                    : "bg-red-600"
                }`}
              >
                {inv.status}
              </span>
            </div>

            <p>
              <b>Invoice ID:</b> {inv.id}
            </p>
            <p>
              <b>Referral:</b> {inv.referral || "—"}
            </p>
            <p>
              <b>Discount:</b> {inv.discount ? `${inv.discount}%` : "—"}
            </p>
            <p>
              <b>Final Amount:</b> ₹{inv.amount.toLocaleString()}
            </p>
            <p>
              <b>Date:</b> {inv.date}
            </p>

            <div className="flex gap-2 mt-2">
              {inv.status !== "Paid" && (
                <button
                  onClick={() => handleMarkPaid(inv.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                >
                  Mark Paid
                </button>
              )}

              <button
                onClick={() => setSelectedInvoice(inv.id)}
                className="flex-1 border border-red-600 text-red-700 hover:bg-red-600 hover:text-white px-3 py-1 rounded transition"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= EDIT INVOICE MODAL ================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 md:p-0">
          <div className="bg-white w-full max-w-md p-5 md:p-6 rounded-xl shadow-xl space-y-5 border border-red-300">
            <h2 className="text-xl md:text-2xl font-bold text-red-700">
              Edit Invoice – {selectedInvoice}
            </h2>

            <div className="space-y-4">
              {/* REFERRAL */}
              <div>
                <label className="text-sm font-semibold text-black">
                  Add Referral
                </label>
                <input
                  value={referralName}
                  onChange={(e) => setReferralName(e.target.value)}
                  className="w-full mt-1 p-2 border border-black/20 rounded"
                  placeholder="Referred by"
                />

                <button
                  onClick={() => handleAddReferral(selectedInvoice)}
                  className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                >
                  Save + Create Referral Invoice
                </button>
              </div>

              {/* DISCOUNT */}
              <div>
                <label className="text-sm font-semibold text-black">
                  Discount (%)
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full mt-1 p-2 border border-black/20 rounded"
                  placeholder="Enter discount"
                />

                <button
                  onClick={() => handleApplyDiscount(selectedInvoice)}
                  className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
                >
                  Apply Discount
                </button>
              </div>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-black py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= REFERRAL INVOICE MODAL ================= */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-xl space-y-6 border border-red-300">
            <h2 className="text-2xl font-bold text-red-700 mb-2">
              Create Referral Invoice
            </h2>

            <div className="space-y-4">
              {/* Referral */}
              <div>
                <label className="font-semibold text-sm">Referral Name</label>
                <input
                  value={referralInvoiceData.referral}
                  disabled
                  className="w-full mt-1 p-2 border rounded bg-gray-100"
                />
              </div>

              {/* Organization */}
              <div>
                <label className="font-semibold text-sm">Organization</label>
                <input
                  value={referralInvoiceData.org}
                  disabled
                  className="w-full mt-1 p-2 border rounded bg-gray-100"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="font-semibold text-sm">
                  Invoice Amount (₹)
                </label>
                <input
                  type="number"
                  value={referralInvoiceData.amount}
                  onChange={(e) =>
                    setReferralInvoiceData((p) => ({
                      ...p,
                      amount: e.target.value,
                    }))
                  }
                  className="w-full mt-1 p-2 border rounded"
                  placeholder="Enter amount"
                />
              </div>

              {/* Date */}
              <div>
                <label className="font-semibold text-sm">Invoice Date</label>
                <input
                  type="date"
                  value={referralInvoiceData.date}
                  onChange={(e) =>
                    setReferralInvoiceData((p) => ({
                      ...p,
                      date: e.target.value,
                    }))
                  }
                  className="w-full mt-1 p-2 border rounded"
                />
              </div>

              {/* Status */}
              <div>
                <label className="font-semibold text-sm">Status</label>
                <select
                  value={referralInvoiceData.status}
                  onChange={(e) =>
                    setReferralInvoiceData((p) => ({
                      ...p,
                      status: e.target.value,
                    }))
                  }
                  className="w-full mt-1 p-2 border rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="font-semibold text-sm">
                  Remarks (optional)
                </label>
                <textarea
                  rows={3}
                  value={referralInvoiceData.remarks}
                  onChange={(e) =>
                    setReferralInvoiceData((p) => ({
                      ...p,
                      remarks: e.target.value,
                    }))
                  }
                  className="w-full mt-1 p-2 border rounded"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCreateReferralInvoice}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
                >
                  Create Invoice
                </button>

                <button
                  onClick={() => setShowReferralModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-black py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
