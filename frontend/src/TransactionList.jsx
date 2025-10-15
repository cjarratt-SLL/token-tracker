import React, { useEffect, useState } from "react";
import { fetchTransactions, fetchResidents, fetchGoals } from "./api";

const TransactionList = ({ onTransactionAdded }) => {
  const [transactions, setTransactions] = useState([]);
  const [residents, setResidents] = useState({});
  const [goals, setGoals] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [txData, resData, goalData] = await Promise.all([
        fetchTransactions(),
        fetchResidents(),
        fetchGoals(),
      ]);

      // Convert arrays to lookup maps for display
      const residentMap = Object.fromEntries(resData.map(r => [r.id, r.display_name]));
      const goalMap = Object.fromEntries(goalData.map(g => [g.id, g.title]));

      setResidents(residentMap);
      setGoals(goalMap);
      setTransactions(txData);
    } catch (err) {
      console.error("Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  // This will run on load
  useEffect(() => {
    loadData();
  }, []);

  // If triggered from App.jsx after posting a new transaction, reload
  useEffect(() => {
    if (onTransactionAdded) {
      loadData();
    }
  }, [onTransactionAdded]);

  if (loading) return <p>Loading transactions...</p>;
  if (transactions.length === 0) return <p>No transactions recorded yet.</p>;

  return (
    <div className="transactions-list">
      <h2>Transaction Log</h2>
      <table border="1" cellPadding="6" style={{ margin: "auto", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Resident</th>
            <th>Goal</th>
            <th>Points</th>
            <th>Staff</th>
            <th>Note</th>
            <th>Timestamp (UTC)</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{residents[tx.resident_id] || tx.resident_id}</td>
              <td>{tx.goal_id ? goals[tx.goal_id] : "—"}</td>
              <td style={{ color: tx.points >= 0 ? "green" : "red" }}>{tx.points}</td>
              <td>{tx.staff_name || "—"}</td>
              <td>{tx.note || "—"}</td>
              <td>{new Date(tx.timestamp).toLocaleString("en-US", { timeZone: "UTC" })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
