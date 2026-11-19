import axios from "axios";
import API_BASE_URL from "./api";
import type {
  WorkerProfile,
  WorkerSearchParams,
} from "../types/worker";

const API_URL = `${API_BASE_URL}/api/workers`;

// Get JWT token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login to continue.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

// Get all workers
export const getAllWorkers = async (): Promise<WorkerProfile[]> => {
  const response = await axios.get<WorkerProfile[]>(
    API_URL,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

// Search workers using filters
export const searchWorkers = async (
  params: WorkerSearchParams
): Promise<WorkerProfile[]> => {
  const response = await axios.get<WorkerProfile[]>(
    `${API_URL}/search`,
    {
      headers: getAuthHeaders(),
      params,
    }
  );

  return response.data;
};

// Get worker by ID
export const getWorkerById = async (
  id: number
): Promise<WorkerProfile> => {
  const response = await axios.get<WorkerProfile>(
    `${API_URL}/${id}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};
