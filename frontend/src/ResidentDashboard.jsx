import React, { useState, useEffect } from "react";
import { fetchResidents, fetchTransactions } from "./api";

const ResidentDashboard = () => {
  const [residents, setResidents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [resData, txData] = await Promise.all([
        fetchResidents(),
        fetchTransactions(),
      ]);
      setResidents(resData);
      setTransactions(txData);
    } catch (error) {
      console.error("Error loading resident dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // auto-refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading resident dashboard...</p>;

    return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2 style={{ color: "#333", marginBottom: "20px" }}>Resident Dashboard</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "25px",
          padding: "10px",
        }}
      >
        {residents.map((res) => (
          <div
            key={res.id}
            style={{
              border: "2px solid #ddd",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "#f9f9ff",
              color: "#222",
              boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
              textAlign: "left",
              transition: "transform 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
          >
            <h3 style={{ color: "#4a3aff", marginBottom: "8px" }}>{res.display_name}</h3>
            <p style={{ fontSize: "1.1em", marginBottom: "10px" }}>
              <strong>Tokens:</strong> {res.token_balance}
            </p>

            <h4 style={{ fontSize: "1em", marginBottom: "6px", color: "#333" }}>Recent Activity</h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                maxHeight: "100px",
                overflowY: "auto",
              }}
            >
              {transactions
                .filter((tx) => tx.resident_id === res.id)
                .slice(-3)
                .reverse()
                .map((tx) => (
                  <li key={tx.id} style={{ marginBottom: "6px" }}>
                    <span
                      style={{
                        color: tx.points >= 0 ? "green" : "red",
                        fontWeight: "bold",
                        marginRight: "5px",
                      }}
                    >
                      {tx.points >= 0 ? "➕" : "➖"}
                    </span>
                    {tx.points} pts —{" "}
                    <span style={{ color: "#555" }}>{tx.note || "No note"}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      </div>
    );
  };
  
  export default ResidentDashboard;
