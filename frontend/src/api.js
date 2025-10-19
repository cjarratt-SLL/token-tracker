import axios from "axios";

// ✅ FastAPI backend base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE;

// =====================
// Residents
// =====================
export const fetchResidents = async () => {
  const response = await axios.get(`${API_BASE_URL}/resident/`);
  return response.data;
};

export const createResident = async (residentData) => {
  const response = await axios.post(`${API_BASE_URL}/resident/`, residentData);
  return response.data;
};

// =====================
// Goals
// =====================
export const fetchGoals = async () => {
  const response = await axios.get(`${API_BASE_URL}/goal/`);
  return response.data;
};

export const createGoal = async (goalData) => {
  const response = await axios.post(`${API_BASE_URL}/goal/`, goalData);
  return response.data;
};

// =====================
// Transactions
// =====================
export const fetchTransactions = async () => {
  const response = await axios.get(`${API_BASE_URL}/transaction/`);
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
  const response = await axios.post(`${API_BASE_URL}/transaction/`, payload);
  return response.data;
};
