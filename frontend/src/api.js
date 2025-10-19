import axios from "axios";

// ✅ FastAPI backend base URL
const API_BASE = "https://token-tracker-backend.onrender.com";
export default API_BASE;

// =====================
// Residents
// =====================
export const fetchResidents = async () => {
  const response = await axios.get(`${API_BASE}/resident/`);
  return response.data;
};

export const createResident = async (residentData) => {
  const response = await axios.post(`${API_BASE}/resident/`, residentData);
  return response.data;
};

// =====================
// Goals
// =====================
export const fetchGoals = async () => {
  const response = await axios.get(`${API_BASE}/goal/`);
  return response.data;
};

export const createGoal = async (goalData) => {
  const response = await axios.post(`${API_BASE}/goal/`, goalData);
  return response.data;
};

// =====================
// Transactions
// =====================
export const fetchTransactions = async () => {
  const response = await axios.get(`${API_BASE}/transaction/`);
  return response.data;
};

export const createTransaction = async (tx) => {
  const payload = {
    ...tx,
    // Normalize timestamp if given
    ...(tx.timestamp instanceof Date
      ? { timestamp: tx.timestamp.toISOString() }
      : {}),
  };
  const response = await axios.post(`${API_BASE}/transaction/`, payload);
  return response.data;
};
