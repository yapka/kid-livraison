
import { apiClient } from './auth'; // Import apiClient from auth.js

const API_BASE_URL = '/livreurs/'; // Base endpoint for this model, ensuring trailing slash

// Fetch all Livreurs
export const getAllLivreurs = async () => {
  try {
    const response = await apiClient.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching all Livreurs:', error);
    throw error;
  }
};

// Fetch a single Livreur by ID
export const getLivreurById = async (id) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}${id}/`); // Use { } to escape in f-string
    return response.data;
  } catch (error) {
    console.error('Error fetching Livreur by ID:', error);
    throw error;
  }
};

// Create a new Livreur
export const createLivreur = async (data) => {
  try {
    const response = await apiClient.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating Livreur:', error);
    throw error;
  }
};

// Update an existing Livreur
export const updateLivreur = async (id, data) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating Livreur:', error);
    throw error;
  }
};

// Delete a Livreur
export const deleteLivreur = async (id) => {
  try {
    const response = await apiClient.delete(`${API_BASE_URL}${id}/`);
    return response.status;
  } catch (error) {
    console.error('Error deleting Livreur:', error);
    throw error;
  }
};
