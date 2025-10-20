import React, { useState, useEffect, useMemo } from "react";
import { createTransaction, fetchResidents, fetchGoals } from "./api";

const TransactionForm = ({ onSuccess }) => {
  const [residents, setResidents] = useState([]);
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({
    resident_id: "",
    goal_id: "",
    staff_name: "",
    note: "",
    points: "", // empty until a goal is chosen
  });
  const [pointsModified, setPointsModified] = useState(false);

  // Load residents & goals
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

  // Find the selected goal
  const selectedGoal = useMemo(() => {
    if (!formData.goal_id) return null;
    const gid = Number(formData.goal_id);
    return goals.find((g) => Number(g.id) === gid) || null;
  }, [formData.goal_id, goals]);

  // When goal changes, auto-fill its points and mark unmodified
  useEffect(() => {
    if (selectedGoal) {
      setFormData((prev) => ({ ...prev, points: String(selectedGoal.points ?? "") }));
      setPointsModified(false);
    } else {
      setFormData((prev) => ({ ...prev, points: "" }));
      setPointsModified(false);
    }
  }, [selectedGoal]);

  // Generic change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Points change handler — detects override
  const handlePointsChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, points: value }));

    if (selectedGoal && value !== "") {
      const numeric = Number(value);
      const defaultPts = Number(selectedGoal.points ?? 0);
      setPointsModified(numeric !== defaultPts);
    } else {
      setPointsModified(false);
    }
  };

  // Submit transaction
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      resident_id: Number(formData.resident_id),
      goal_id: formData.goal_id ? Number(formData.goal_id) : null,
      staff_name: formData.staff_name,
      note: formData.note?.trim() || "",
    };

    // Only send points if user modified them
    if (pointsModified && formData.points !== "") {
      payload.points = Number(formData.points);
    }

    try {
      await createTransaction(payload);
      alert("✅ Transaction successfully recorded!");

      // Reset form
      setFormData({
        resident_id: "",
        goal_id: "",
        staff_name: "",
        note: "",
        points: "",
      });
      setPointsModified(false);
      onSuccess?.();
    } catch (err) {
      console.error("❌ Error creating transaction:", err);
      alert("Failed to record transaction. Check console for details.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
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

      <label>Goal:</label>
      <select
        name="goal_id"
        value={formData.goal_id}
        onChange={handleChange}
        required
      >
        <option value="">Select Goal</option>
        {goals.map((g) => (
          <option key={g.id} value={g.id}>
            {g.title} ({g.points} pts)
          </option>
        ))}
      </select>

      <label>Points:</label>
      <input
        type="number"
        name="points"
        value={formData.points}
        onChange={handlePointsChange}
        disabled={!selectedGoal}
        placeholder={
          selectedGoal
            ? `Default: ${selectedGoal.points}`
            : "Select a goal first"
        }
      />
      <small style={{ color: "#777" }}>
        {!selectedGoal
          ? "Points will auto-fill when a goal is selected."
          : pointsModified
          ? `Modified by staff (default was ${selectedGoal.points})`
          : `Using goal default: ${selectedGoal.points}`}
      </small>

      <label>Staff Name:</label>
      <input
        type="text"
        name="staff_name"
        value={formData.staff_name}
        onChange={handleChange}
        required
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
