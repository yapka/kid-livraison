
import { apiClient } from './auth'; // Import apiClient from auth.js

const API_BASE_URL = '/zones-livraison/'; // Base endpoint for this model, ensuring trailing slash

// Fetch all ZoneLivraisons
export const getAllZoneLivraisons = async () => {
  try {
    const response = await apiClient.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching all ZoneLivraisons:', error);
    throw error;
  }
};

// Fetch a single ZoneLivraison by ID
export const getZoneLivraisonById = async (id) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}${id}/`); // Use { } to escape in f-string
    return response.data;
  } catch (error) {
    console.error('Error fetching ZoneLivraison by ID:', error);
    throw error;
  }
};

// Create a new ZoneLivraison
export const createZoneLivraison = async (data) => {
  try {
    const response = await apiClient.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating ZoneLivraison:', error);
    throw error;
  }
};

// Update an existing ZoneLivraison
export const updateZoneLivraison = async (id, data) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating ZoneLivraison:', error);
    throw error;
  }
};

// Delete a ZoneLivraison
export const deleteZoneLivraison = async (id) => {
  try {
    const response = await apiClient.delete(`${API_BASE_URL}${id}/`);
    return response.status;
  } catch (error) {
    console.error('Error deleting ZoneLivraison:', error);
    throw error;
  }
};
