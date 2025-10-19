import React, { useState } from "react";
import { createGoal } from "./api";

const GoalForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: 1,
    active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createGoal(formData);
      setFormData({ title: "", description: "", points: 1, active: true });
      onSuccess();
    } catch (err) {
      console.error("Error creating goal:", err);
      alert("Failed to create goal. Check console for details.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="goal-form">
      <input
        type="text"
        name="title"
        placeholder="Goal Title"
        value={formData.title}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="description"
        placeholder="Description (optional)"
        value={formData.description}
        onChange={handleChange}
      />
      <input
        type="number"
        name="points"
        placeholder="Points"
        min="1"
        value={formData.points}
        onChange={handleChange}
        required
      />
      <label>
        <input
          type="checkbox"
          name="active"
          checked={formData.active}
          onChange={handleChange}
        />
        Active
      </label>
      <button type="submit">Add Goal</button>
    </form>
  );
};

export default GoalForm;
