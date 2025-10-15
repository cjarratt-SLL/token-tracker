import React, { useState, useEffect } from "react";
import { createTransaction, fetchResidents, fetchGoals } from "./api";

const TransactionForm = ({ onTransactionAdded }) => {
  const [residents, setResidents] = useState([]);
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({
    resident_id: "",
    goal_id: "",
    points: 0,
    staff_name: "",
    note: "",
  });

  // Load residents and goals when the component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const [resData, goalData] = await Promise.all([
          fetchResidents(),
          fetchGoals(),
        ]);
        setResidents(resData);
        setGoals(goalData);
      } catch (err) {
        console.error("Error loading residents or goals:", err);
      }
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTransaction({
        ...formData,
        points: Number(formData.points),
      });
      setFormData({
        resident_id: "",
        goal_id: "",
        points: 0,
        staff_name: "",
        note: "",
      });
      if (onTransactionAdded) onTransactionAdded();
    } catch (err) {
      console.error("Error creating transaction:", err);
      alert("Failed to record transaction. Check console for details.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <h2>Record Token Transaction</h2>

      <label>Resident:</label>
      <select
        name="resident_id"
        value={formData.resident_id}
        onChange={handleChange}
        required
      >
        <option value="">Select Resident</option>
        {residents.map((r) => (
          <option key={r.id} value={r.id}>
            {r.display_name}
          </option>
        ))}
      </select>

      <label>Goal (optional):</label>
      <select
        name="goal_id"
        value={formData.goal_id}
        onChange={handleChange}
      >
        <option value="">None</option>
        {goals.map((g) => (
          <option key={g.id} value={g.id}>
            {g.title}
          </option>
        ))}
      </select>

      <label>Points (positive or negative):</label>
      <input
        type="number"
        name="points"
        value={formData.points}
        onChange={handleChange}
        required
      />

      <label>Staff Name:</label>
      <input
        type="text"
        name="staff_name"
        value={formData.staff_name}
        onChange={handleChange}
      />

      <label>Note (optional):</label>
      <input
        type="text"
        name="note"
        value={formData.note}
        onChange={handleChange}
      />

      <button type="submit">Submit Transaction</button>
    </form>
  );
};

export default TransactionForm;
