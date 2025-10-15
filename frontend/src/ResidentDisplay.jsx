import React, { useState, useEffect } from "react";
import { fetchResidents, fetchTransactions } from "./api";
import { useParams } from "react-router-dom";

const useIsEmbed = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("embed") === "1";
};

const ResidentDisplay = () => {
  const [residents, setResidents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id: routeID } = useParams();
  const selectedId = routeID ? Number(routeID) : null;
  const isEmbed = useIsEmbed();

  // Fetch data from backend
  const loadData = async () => {
    try {
      const [resData, txData] = await Promise.all([
        fetchResidents(),
        fetchTransactions(),
      ]);
      setResidents(resData);
      setTransactions(txData);
    } catch (err) {
      console.error("Error loading resident data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const selectedResident = residents.find((r) => r.id === selectedId);
  const residentTransactions = transactions
    .filter((tx) => tx.resident_id === selectedId)
    .slice(-10)
    .reverse();

  if (loading) return <p>Loading resident data...</p>;

  const wrapStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    background: "white",
    padding: "15px",
    fontFamily: "system-ui, Segoe UI, Roboto, Arial, sans-serif",
    height: "fit-content",
    minHeight: "100%",
    boxSizing: "border-box",
  };

  const cardStyle = {
    maxWidth: "500px",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
  };

  return (
    <div style={wrapStyle}>
      {isEmbed ? (
        selectedResident ? (
          <div style={cardStyle}>
            <h2 style={{ color: "#333", fontSize: "1.8em", marginBottom: "0.2em" }}>
              {selectedResident.display_name}
            </h2>
            <p style={{ fontSize: "1.4em", color: "#444", margin: "0.5em 0" }}>
              <strong>Tokens:</strong> {selectedResident.token_balance}
            </p>

            <h3 style={{ marginTop: "1.5em", color: "#555" }}>Recent Activity</h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                marginTop: "0.5em",
                textAlign: "left",
              }}
            >
              {residentTransactions.map((tx) => (
                <li
                  key={tx.id}
                  style={{
                    fontSize: "1.1em",
                    color: tx.points >= 0 ? "green" : "red",
                    marginBottom: "0.5em",
                  }}
                >
                  {tx.points >= 0 ? "➕" : "➖"} {tx.points} pts —{" "}
                  <span style={{ color: "#333" }}>{tx.note || "No note"}</span>
                </li>
              ))}
              {residentTransactions.length === 0 && (
                <p style={{ color: "#666" }}>No recent activity.</p>
              )}
            </ul>
          </div>
        ) : (
          <p>Resident not found.</p>
        )
      ) : (
        <>
          <h1 style={{ color: "#3b37ff", marginBottom: "20px" }}>
            Resident Token Display
          </h1>
          <p>Select a resident or open in embed mode.</p>
        </>
      )}
    </div>
  );
};

export default ResidentDisplay;
