
import { apiClient } from './auth'; // Import apiClient from auth.js

const API_BASE_URL = '/notifications/'; // Base endpoint for this model, ensuring trailing slash

// Fetch all Notifications
export const getAllNotifications = async () => {
  try {
    const response = await apiClient.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching all Notifications:', error);
    throw error;
  }
};

// Fetch a single Notification by ID
export const getNotificationById = async (id) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}${id}/`); // Use { } to escape in f-string
    return response.data;
  } catch (error) {
    console.error('Error fetching Notification by ID:', error);
    throw error;
  }
};

// Create a new Notification
export const createNotification = async (data) => {
  try {
    const response = await apiClient.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating Notification:', error);
    throw error;
  }
};

// Update an existing Notification
export const updateNotification = async (id, data) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating Notification:', error);
    throw error;
  }
};

// Delete a Notification
export const deleteNotification = async (id) => {
  try {
    const response = await apiClient.delete(`${API_BASE_URL}${id}/`);
    return response.status;
  } catch (error) {
    console.error('Error deleting Notification:', error);
    throw error;
  }
};
