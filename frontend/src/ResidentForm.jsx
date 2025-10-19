import React, { useState } from "react";
import { createResident } from "./api";

const ResidentForm = ({ onResidentAdded }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    display_name: "",
    token_balance: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createResident(formData);
      onResidentAdded(); // Refresh list after adding
      setFormData({ first_name: "", last_name: "", display_name: "", token_balance: 0 });
    } catch (err) {
      console.error("Error creating resident:", err);
      alert("Failed to create resident. Check console for details.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="resident-form">
      <input
        type="text"
        name="first_name"
        placeholder="First Name"
        value={formData.first_name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="last_name"
        placeholder="Last Name"
        value={formData.last_name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="display_name"
        placeholder="Display Name"
        value={formData.display_name}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="token_balance"
        placeholder="Starting Tokens"
        value={formData.token_balance}
        onChange={handleChange}
        min="0"
      />
      <button type="submit">Add Resident</button>
    </form>
  );
};

export default ResidentForm;
