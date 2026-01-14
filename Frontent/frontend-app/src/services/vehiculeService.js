
import { apiClient } from './auth'; // Import apiClient from auth.js

const API_BASE_URL = '/vehicules/'; // Base endpoint for this model, ensuring trailing slash

// Fetch all Vehicules
export const getAllVehicules = async () => {
  try {
    const response = await apiClient.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching all Vehicules:', error);
    throw error;
  }
};

// Fetch a single Vehicule by ID
export const getVehiculeById = async (id) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}${id}/`); // Use { } to escape in f-string
    return response.data;
  } catch (error) {
    console.error('Error fetching Vehicule by ID:', error);
    throw error;
  }
};

// Create a new Vehicule
export const createVehicule = async (data) => {
  try {
    const response = await apiClient.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating Vehicule:', error);
    throw error;
  }
};

// Update an existing Vehicule
export const updateVehicule = async (id, data) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating Vehicule:', error);
    throw error;
  }
};

// Delete a Vehicule
export const deleteVehicule = async (id) => {
  try {
    const response = await apiClient.delete(`${API_BASE_URL}${id}/`);
    return response.status;
  } catch (error) {
    console.error('Error deleting Vehicule:', error);
    throw error;
  }
};
