
import { apiClient } from './auth'; // Import apiClient from auth.js
import { extractErrorMessage } from '../utils/errorHandler';

const API_BASE_URL = '/colis/'; // Base endpoint for this model, ensuring trailing slash

// Fetch all Colis
export const getAllColis = async () => {
  try {
    const response = await apiClient.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    const errorInfo = extractErrorMessage(error);
    console.error('[getAllColis] Error:', errorInfo);
    // Enrichir l'erreur avant de la relancer
    error.userMessage = errorInfo.message;
    error.userDetails = errorInfo.details;
    throw error;
  }
};

// Fetch a single Colis by ID
export const getColisById = async (id) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}${id}/`); // Use { } to escape in f-string
    return response.data;
  } catch (error) {
    const errorInfo = extractErrorMessage(error);
    console.error('[getColisById] Error:', errorInfo);
    error.userMessage = errorInfo.message;
    error.userDetails = errorInfo.details;
    throw error;
  }
};

// Create a new Colis
export const createColis = async (data) => {
  try {
    const response = await apiClient.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    const errorInfo = extractErrorMessage(error);
    console.error('[createColis] Error:', errorInfo);
    error.userMessage = errorInfo.message;
    error.userDetails = errorInfo.details;
    throw error;
  }
};

// Update an existing Colis
export const updateColis = async (id, data) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    const errorInfo = extractErrorMessage(error);
    console.error('[updateColis] Error:', errorInfo);
    error.userMessage = errorInfo.message;
    error.userDetails = errorInfo.details;
    throw error;
  }
};

// Partial update of a Colis (PATCH)
export const patchColis = async (id, data) => {
  try {
    const response = await apiClient.patch(`${API_BASE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    const errorInfo = extractErrorMessage(error);
    console.error('[patchColis] Error:', errorInfo);
    error.userMessage = errorInfo.message;
    error.userDetails = errorInfo.details;
    throw error;
  }
};

// Delete a Colis
export const deleteColis = async (id) => {
  try {
    const response = await apiClient.delete(`${API_BASE_URL}${id}/`);
    return response.status;
  } catch (error) {
    const errorInfo = extractErrorMessage(error);
    console.error('[deleteColis] Error:', errorInfo);
    error.userMessage = errorInfo.message;
    error.userDetails = errorInfo.details;
    throw error;
  }
};

