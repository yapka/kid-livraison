
import { apiClient } from './auth'; // Import apiClient from auth.js

const API_BASE_URL = '/factures/'; // Base endpoint for this model, ensuring trailing slash

// Fetch all Factures
export const getAllFactures = async () => {
  try {
    const response = await apiClient.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching all Factures:', error);
    throw error;
  }
};

// Fetch a single Facture by ID
export const getFactureById = async (id) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}${id}/`); // Use { } to escape in f-string
    return response.data;
  } catch (error) {
    console.error('Error fetching Facture by ID:', error);
    throw error;
  }
};

// Create a new Facture
export const createFacture = async (data) => {
  try {
    const response = await apiClient.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating Facture:', error);
    throw error;
  }
};

// Update an existing Facture
export const updateFacture = async (id, data) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating Facture:', error);
    throw error;
  }
};

// Delete a Facture
export const deleteFacture = async (id) => {
  try {
    const response = await apiClient.delete(`${API_BASE_URL}${id}/`);
    return response.status;
  } catch (error) {
    console.error('Error deleting Facture:', error);
    throw error;
  }
};
