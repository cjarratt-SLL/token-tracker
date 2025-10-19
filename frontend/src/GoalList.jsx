import React, { useEffect, useState } from "react";
import { fetchGoals } from "./api";

const GoalList = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGoals = async () => {
    try {
      const data = await fetchGoals();
      setGoals(data);
    } catch (err) {
      console.error("Error loading goals:", err);
      setError("Failed to load goals. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  if (loading) return <p>Loading goals...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (goals.length === 0) {
    return <p>No goals found.</p>;
  }

  return (
    <div className="goals-list">
      <ul>
        {goals.map((goal) => (
          <li key={goal.id}>
            <strong>{goal.title}</strong> — {goal.description || "No description"}  
            | Points: {goal.points}  
            | Status: {goal.active ? "Active" : "Inactive"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoalList;
