import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import ResidentsList from "./ResidentsList";
import ResidentForm from "./ResidentForm";      // <-- keep your actual filename
import GoalList from "./GoalList";
import GoalForm from "./GoalForm";              // <-- keep your actual filename
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import ResidentDashboard from "./ResidentDashboard";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8080";

export default function App() {
  const [residents, setResidents] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // A monotonic token we bump to force downstream refreshes
  const refreshTick = useRef(0);
  const bump = () => (refreshTick.current += 1);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [r, g, t] = await Promise.all([
        axios.get(`${API_BASE}/resident/`),
        axios.get(`${API_BASE}/goal/`),
        axios.get(`${API_BASE}/transaction/`),
      ]);
      setResidents(r.data || []);
      setGoals(g.data || []);
      // sort newest-first for history
      const tx = Array.isArray(t.data) ? [...t.data] : [];
      tx.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setTransactions(tx);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // initial load
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // refresh on window focus
  useEffect(() => {
    const onFocus = () => fetchAll();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchAll]);

  // light polling (every 20s) to keep lists fresh if others are editing
  useEffect(() => {
    const id = setInterval(fetchAll, 20000);
    return () => clearInterval(id);
  }, [fetchAll]);

  // Unified callback children can call after a successful create/update/delete
  const handleDataChanged = async () => {
    await fetchAll();
    bump();
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Token Tracker</h1>

      {/* Forms row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <h2>Add Resident</h2>
          <ResidentForm onSuccess={handleDataChanged} />
        </div>
        <div>
          <h2>Add Goal</h2>
          <GoalForm onSuccess={handleDataChanged} />
        </div>
      </div>

      <hr style={{ margin: "20px 0" }} />

      {/* Lists row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <h2>Residents</h2>
          <ResidentsList
            key={`residents-${refreshTick.current}`}
            residents={residents}
          />
        </div>
        <div>
          <h2>Goals</h2>
          <GoalList
            key={`goals-${refreshTick.current}`}
            goals={goals}
          />
        </div>
      </div>

      <hr style={{ margin: "20px 0" }} />

      {/* Dashboard + transaction tools */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <h2>Resident Dashboard</h2>
          <ResidentDashboard
            key={`dash-${refreshTick.current}`}
            residents={residents}
            goals={goals}
            transactions={transactions}
            loading={loading}
          />
        </div>
        <div>
          <h2>Post Transaction</h2>
          <TransactionForm
            residents={residents}
            goals={goals}
            onSuccess={handleDataChanged} // ← triggers immediate refresh + keeps history sorted
          />
        </div>
      </div>

      <hr style={{ margin: "20px 0" }} />

      <div>
        <h2>Transaction History</h2>
        <TransactionList
          key={`tx-${refreshTick.current}`}
          transactions={transactions}
          residents={residents}
          goals={goals}
        />
      </div>
    </div>
  );
}
