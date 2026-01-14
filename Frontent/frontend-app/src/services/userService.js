// Récupérer tous les logs d'activité des agents
export const getAllAgentLogs = async () => {
  try {
    const response = await apiClient.get('/logs/agents/'); // À adapter selon votre endpoint backend
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des logs agents:', error);
    throw error;
  }
};

import { apiClient } from './auth'; // Import apiClient from auth.js

const API_BASE_URL = '/users/'; // Base endpoint for this model, ensuring trailing slash

// Fetch all Users
export const getAllUsers = async () => {
  try {
    const response = await apiClient.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching all Users:', error);
    throw error;
  }
};

// Fetch a single User by ID
export const getUserById = async (id) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}${id}/`); // Use { } to escape in f-string
    return response.data;
  } catch (error) {
    console.error('Error fetching User by ID:', error);
    throw error;
  }
};

// Create a new User
export const createUser = async (data) => {
  try {
    const response = await apiClient.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating User:', error);
    throw error;
  }
};

// Update an existing User
export const updateUser = async (id, data) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating User:', error);
    throw error;
  }
};

// Delete a User
export const deleteUser = async (id) => {
  try {
    const response = await apiClient.delete(`${API_BASE_URL}${id}/`);
    return response.status;
  } catch (error) {
    console.error('Error deleting User:', error);
    throw error;
  }
};
