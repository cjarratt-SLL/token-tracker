import React, { useEffect, useState } from "react";
import { fetchTransactions, fetchResidents, fetchGoals } from "./api";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    try {
      const [txData, residentData, goalData] = await Promise.all([
        fetchTransactions(),
        fetchResidents(),
        fetchGoals(),
      ]);

      const residentMap = {};
      residentData.forEach((r) => {
        residentMap[r.id] = r.display_name || r.name || "Unknown Resident";
      });

      const goalMap = {};
      goalData.forEach((g) => {
        goalMap[g.id] = g.title || "—";
      });

      const sortedTx = txData
        .map((tx) => ({
          ...tx,
          resident_display_name:
            tx.resident_display_name ||
            residentMap[tx.resident_id] ||
            "Unknown Resident",
          goal_title: tx.goal_title || goalMap[tx.goal_id] || "—",
          staff_name: tx.staff_name || "—",
        }))
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

      setTransactions(sortedTx);
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
          <tr
            style={{
              backgroundColor: "#2f3b52", // darker header background
              color: "white",              // white text for contrast
            }}
          >
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
              <td>{tx.resident_display_name}</td>
              <td>{tx.goal_title}</td>
              <td
                style={{
                  color: tx.points >= 0 ? "green" : "red",
                  fontWeight: tx.override_points ? "bold" : "normal",
                }}
              >
                {tx.points} pts {tx.override_points ? "(override)" : ""}
              </td>
              <td>{tx.note || "—"}</td>
              <td>{tx.staff_name}</td>
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
