
import { apiClient } from './auth'; // Import apiClient from auth.js

const API_BASE_URL = '/tarifs/'; // Base endpoint for this model, ensuring trailing slash

// Fetch all Tarifs
export const getAllTarifs = async () => {
  try {
    const response = await apiClient.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching all Tarifs:', error);
    throw error;
  }
};

// Fetch a single Tarif by ID
export const getTarifById = async (id) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}${id}/`); // Use { } to escape in f-string
    return response.data;
  } catch (error) {
    console.error('Error fetching Tarif by ID:', error);
    throw error;
  }
};

// Create a new Tarif
export const createTarif = async (data) => {
  try {
    const response = await apiClient.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating Tarif:', error);
    throw error;
  }
};

// Update an existing Tarif
export const updateTarif = async (id, data) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating Tarif:', error);
    throw error;
  }
};

// Delete a Tarif
export const deleteTarif = async (id) => {
  try {
    const response = await apiClient.delete(`${API_BASE_URL}${id}/`);
    return response.status;
  } catch (error) {
    console.error('Error deleting Tarif:', error);
    throw error;
  }
};
