import React, { useEffect, useState } from "react";
import { fetchTransactions } from "./api";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    try {
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (err) {
      console.error("Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  if (loading) return <p>Loading transactions...</p>;
  if (transactions.length === 0) return <p>No transactions recorded yet.</p>;

  return (
    <div className="transactions-list" style={{ marginTop: "30px" }}>
      <h2>Transaction History</h2>
      <table
        border="1"
        cellPadding="6"
        style={{
          margin: "auto",
          borderCollapse: "collapse",
          minWidth: "80%",
          fontFamily: "Segoe UI, Arial, sans-serif",
        }}
      >
        <thead>
          <tr style={{ background: "#f3f3f3" }}>
            <th>Resident</th>
            <th>Goal</th>
            <th>Points</th>
            <th>Note</th>
            <th>Staff</th>
            <th>Timestamp (UTC)</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.resident_display_name || "Unknown Resident"}</td>
              <td>{tx.goal_title || "—"}</td>
              <td
                style={{
                  color: tx.points >= 0 ? "green" : "red",
                  fontWeight: tx.override_points ? "bold" : "normal",
                }}
              >
                {tx.points} pts {tx.override_points ? "(override)" : ""}
              </td>
              <td>{tx.note || "—"}</td>
              <td>{tx.staff_name || "—"}</td>
              <td>
                {new Date(tx.timestamp).toLocaleString("en-US", {
                  timeZone: "UTC",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
