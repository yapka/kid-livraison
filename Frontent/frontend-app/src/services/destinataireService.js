
import { apiClient } from './auth'; // Import apiClient from auth.js

const API_BASE_URL = '/destinataires/'; // Base endpoint for this model, ensuring trailing slash

// Fetch all Destinataires
export const getAllDestinataires = async () => {
  try {
    const response = await apiClient.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching all Destinataires:', error);
    throw error;
  }
};

// Fetch a single Destinataire by ID
export const getDestinataireById = async (id) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}${id}/`); // Use { } to escape in f-string
    return response.data;
  } catch (error) {
    console.error('Error fetching Destinataire by ID:', error);
    throw error;
  }
};

// Create a new Destinataire
export const createDestinataire = async (data) => {
  try {
    const response = await apiClient.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating Destinataire:', error);
    throw error;
  }
};

// Update an existing Destinataire
export const updateDestinataire = async (id, data) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating Destinataire:', error);
    throw error;
  }
};

// Delete a Destinataire
export const deleteDestinataire = async (id) => {
  try {
    const response = await apiClient.delete(`${API_BASE_URL}${id}/`);
    return response.status;
  } catch (error) {
    console.error('Error deleting Destinataire:', error);
    throw error;
  }
};
