
import { apiClient } from './auth'; // Import apiClient from auth.js

const API_BASE_URL = '/expediteurs/'; // Base endpoint for this model, ensuring trailing slash

// Fetch all Expediteurs
export const getAllExpediteurs = async () => {
  try {
    const response = await apiClient.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching all Expediteurs:', error);
    throw error;
  }
};

// Fetch a single Expediteur by ID
export const getExpediteurById = async (id) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}${id}/`); // Use { } to escape in f-string
    return response.data;
  } catch (error) {
    console.error('Error fetching Expediteur by ID:', error);
    throw error;
  }
};

// Create a new Expediteur
export const createExpediteur = async (data) => {
  try {
    const response = await apiClient.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating Expediteur:', error);
    throw error;
  }
};

// Update an existing Expediteur
export const updateExpediteur = async (id, data) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating Expediteur:', error);
    throw error;
  }
};

// Delete a Expediteur
export const deleteExpediteur = async (id) => {
  try {
    const response = await apiClient.delete(`${API_BASE_URL}${id}/`);
    return response.status;
  } catch (error) {
    console.error('Error deleting Expediteur:', error);
    throw error;
  }
};
