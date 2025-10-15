import React, { useEffect, useState } from "react";
import ResidentsList from "./ResidentsList";
import ResidentForm from "./ResidentForm";
import GoalList from "./GoalList";
import GoalForm from "./GoalForm";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import ResidentDashboard from "./ResidentDashboard";
import { fetchResidents, fetchGoals } from "./api";
import ResidentPopup from "./ResidentPopup";
import "./App.css";


function App() {
  const [residents, setResidents] = useState([]);
  const [reloadGoals, setReloadGoals] = useState(false);
  const [reloadResidents, setReloadResidents] = useState(false);

  // --- Load residents ---
  const loadResidents = async () => {
    try {
      const data = await fetchResidents();
      setResidents(data);
    } catch (err) {
      console.error("Error loading residents:", err);
    }
  };

  // --- Reload after adding new goals ---
  const handleGoalAdded = () => {
    setReloadGoals((prev) => !prev);
  };

  // --- Reload after adding transactions ---
  const handleTransactionAdded = () => {
    // Refresh residents to update token counts
    setReloadResidents((prev) => !prev);
  };

  useEffect(() => {
    loadResidents();
  }, [reloadResidents]);

  return (
    <div className="App">
      <h1>🏠 Token Tracker Dashboard</h1>

      {/* Add new resident */}
      <ResidentForm onResidentAdded={loadResidents} />

      {/* Residents list */}
      <ResidentsList residents={residents} />

      {/* Add new goal */}
      <GoalForm onGoalAdded={handleGoalAdded} />

      {/* List all goals */}
      <GoalList key={reloadGoals} />

      {/* Record transactions (award/deduct tokens) */}
      <TransactionForm onTransactionAdded={handleTransactionAdded} />

      {/* View transaction history */}
      <TransactionList onTransactionAdded={handleTransactionAdded} />

      {/* Popup demo for testing */}
      <div style={{ marginTop: "40px" }}>
        <h2>Resident Popups (Preview)</h2>
        <ResidentPopup residentId={5} />
        <ResidentPopup residentId={6} />
      </div>

      {/* Resident Dashboard */}
      <ResidentDashboard />
    </div>
  );
}

export default App;
