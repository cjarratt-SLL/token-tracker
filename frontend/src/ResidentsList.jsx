import React, { useEffect, useState } from "react";
import { fetchResidents, fetchTransactions, fetchGoals } from "./api";
import ResidentModal from "./ResidentModal";

const ResidentsList = () => {
  const [residents, setResidents] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);
  const [residentTransactions, setResidentTransactions] = useState([]);
  const [residentGoals, setResidentGoals] = useState([]);

  // Load all residents
  useEffect(() => {
    const loadResidents = async () => {
      try {
        const data = await fetchResidents();
        setResidents(data);
      } catch (err) {
        console.error("Error loading residents:", err);
      }
    };
    loadResidents();
  }, []);

  // Handle resident click
  const handleResidentClick = async (resident) => {
    try {
      const [transactions, goals] = await Promise.all([
        fetchTransactions(resident.id),
        fetchGoals(),
      ]);
      setResidentTransactions(
        transactions.filter((tx) => tx.resident_id === resident.id)
      );
      setResidentGoals(goals);
      setSelectedResident(resident);
    } catch (err) {
      console.error("Error loading resident data:", err);
    }
  };

  // Close modal
  const handleClose = () => {
    setSelectedResident(null);
  };

  return (
    <div className="residents-grid" style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
      {residents.map((resident) => (
        <div
          key={resident.id}
          className="resident-card"
          style={{
            border: "2px solid #4f46e5",
            borderRadius: "10px",
            padding: "1rem",
            cursor: "pointer",
            textAlign: "center",
            width: "200px",
          }}
          onClick={() => handleResidentClick(resident)}
        >
          <h3>{resident.display_name}</h3>
          <p>Tokens: {resident.token_balance}</p>
        </div>
      ))}

      {selectedResident && (
        <ResidentModal
          resident={selectedResident}
          transactions={residentTransactions}
          goals={residentGoals}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default ResidentsList;
