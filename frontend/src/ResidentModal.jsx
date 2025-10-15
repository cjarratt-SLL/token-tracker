import React from "react";
import "./ResidentModal.css";

const ResidentModal = ({ resident, transactions, goals, onClose }) => {
  if (!resident) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h2>{resident.display_name}</h2>
        <p>
          <strong>Token Balance:</strong> {resident.token_balance}
        </p>

        <h3>Recent Transactions</h3>
        {transactions.length > 0 ? (
          <ul>
            {transactions.map((tx) => (
              <li key={tx.id}>
                {tx.points > 0 ? "+" : ""}
                {tx.points} points – {tx.staff_name || "Staff"}{" "}
                <em>
                  ({new Date(tx.timestamp).toLocaleString("en-US", {
                    timeZone: "UTC",
                  })})
                </em>
              </li>
            ))}
          </ul>
        ) : (
          <p>No transactions yet.</p>
        )}

        <h3>Goals</h3>
        {goals.length > 0 ? (
          <ul>
            {goals.map((goal) => (
              <li key={goal.id}>
                {goal.title} ({goal.points} pts)
              </li>
            ))}
          </ul>
        ) : (
          <p>No goals assigned.</p>
        )}

        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ResidentModal;
