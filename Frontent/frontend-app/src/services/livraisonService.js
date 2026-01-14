
import { apiClient } from './auth'; // Import apiClient from auth.js

const API_BASE_URL = '/livraisons/'; // Base endpoint for this model, ensuring trailing slash

// Fetch all Livraisons
export const getAllLivraisons = async () => {
  try {
    const response = await apiClient.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching all Livraisons:', error);
    throw error;
  }
};

// Fetch a single Livraison by ID
export const getLivraisonById = async (id) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}${id}/`); // Use { } to escape in f-string
    return response.data;
  } catch (error) {
    console.error('Error fetching Livraison by ID:', error);
    throw error;
  }
};

// Create a new Livraison
export const createLivraison = async (data) => {
  try {
    const response = await apiClient.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating Livraison:', error);
    throw error;
  }
};

// Update an existing Livraison
export const updateLivraison = async (id, data) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating Livraison:', error);
    throw error;
  }
};

// Delete a Livraison
export const deleteLivraison = async (id) => {
  try {
    const response = await apiClient.delete(`${API_BASE_URL}${id}/`);
    return response.status;
  } catch (error) {
    console.error('Error deleting Livraison:', error);
    throw error;
  }
};
