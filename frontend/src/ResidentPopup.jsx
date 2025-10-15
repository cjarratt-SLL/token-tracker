import React, { useState } from "react";

const ResidentPopup = ({ residentId }) => {
  const [open, setOpen] = useState(false);

  const openPopup = () => setOpen(true);
  const closePopup = () => setOpen(false);

  return (
    <div style={{ display: "inline-block", margin: "10px" }}>
      {/* Resident preview button or image */}
      <button
        onClick={openPopup}
        style={{
          border: "none",
          background: "none",
          cursor: "pointer",
          fontSize: "1.2em",
          color: "#3b37ff",
          textDecoration: "underline",
        }}
      >
        View Resident {residentId}
      </button>

      {/* Overlay popup */}
      {open && (
        <div
          onClick={closePopup}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              overflow: "hidden",
              width: "90%",
              maxWidth: "900px",
              height: "80%",
            }}
          >
            <iframe
              src={`http://localhost:5173/resident-display/${residentId}?embed=1`}
              width="100%"
              height="100%"
              style={{ border: "none" }}
              title={`Resident ${residentId}`}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentPopup;
