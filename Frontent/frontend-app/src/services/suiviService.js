
import { apiClient } from './auth'; // Import apiClient from auth.js
import { extractErrorMessage } from '../utils/errorHandler';

const API_BASE_URL = '/suivis/'; // Base endpoint for this model, ensuring trailing slash

// Fetch all Suivis
export const getAllSuivis = async () => {
  try {
    const response = await apiClient.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    const errorInfo = extractErrorMessage(error);
    console.error('[getAllSuivis] Error:', errorInfo);
    error.userMessage = errorInfo.message;
    error.userDetails = errorInfo.details;
    throw error;
  }
};

// Fetch a single Suivi by ID
export const getSuiviById = async (id) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}${id}/`); // Use { } to escape in f-string
    return response.data;
  } catch (error) {
    const errorInfo = extractErrorMessage(error);
    console.error('[getSuiviById] Error:', errorInfo);
    error.userMessage = errorInfo.message;
    error.userDetails = errorInfo.details;
    throw error;
  }
};

// Create a new Suivi
export const createSuivi = async (data) => {
  try {
    const response = await apiClient.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    const errorInfo = extractErrorMessage(error);
    console.error('[createSuivi] Error:', errorInfo);
    error.userMessage = errorInfo.message;
    error.userDetails = errorInfo.details;
    throw error;
  }
};

// Update an existing Suivi
export const updateSuivi = async (id, data) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating Suivi:', error);
    throw error;
  }
};

// Delete a Suivi
export const deleteSuivi = async (id) => {
  try {
    const response = await apiClient.delete(`${API_BASE_URL}${id}/`);
    return response.status;
  } catch (error) {
    console.error('Error deleting Suivi:', error);
    throw error;
  }
};
