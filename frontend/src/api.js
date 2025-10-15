import axios from "axios";

const API_BASE = "http://localhost:8000"; // FastAPI backend

// ✅ Fetch all residents
export const fetchResidents = async () => {
  const response = await axios.get(`${API_BASE}/residents/`);
  return response.data;
};

// ✅ Create a new resident
export const createResident = async (residentData) => {
  const response = await axios.post(`${API_BASE}/residents/`, residentData);
  return response.data;
};

// ✅ Fetch all goals
export const fetchGoals = async () => {
  const response = await axios.get(`${API_BASE}/goals/`);
  return response.data;
};

// ✅ Create a new goal
export const createGoal = async (goalData) => {
  const response = await axios.post(`${API_BASE}/goals/`, goalData);
  return response.data;
};

// ✅ Fetch all transactions
export const fetchTransactions = async () => {
  const response = await axios.get(`${API_BASE}/transactions/`);
  return response.data;
};

// ✅ Create a new transaction
// tx should look like:
// { resident_id: number, goal_id?: number, points: number, note?: string, staff_name?: string, timestamp?: string }
// If timestamp is omitted, the backend will set it to UTC automatically.
// If you include it, use: new Date().toISOString()  // includes the trailing 'Z'
export const createTransaction = async (tx) => {
  const payload = {
    ...tx,
    // If a timestamp is provided as a Date, convert to ISO with Z
    ...(tx.timestamp instanceof Date
      ? { timestamp: tx.timestamp.toISOString() }
      : {}),
  };
  const response = await axios.post(`${API_BASE}/transactions/`, payload);
  return response.data;
};
