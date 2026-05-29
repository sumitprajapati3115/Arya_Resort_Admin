
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://arya-resort-b.onrender.com/api';


const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem("adminToken");
  const headers = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
  return headers;
};

export const apiService = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, { method: 'GET', headers: getHeaders() });
      return await response.json();
    } catch (error) {
      console.error(`Error in GET ${endpoint}:`, error);
      throw error;
    }
  },

  post: async (endpoint, data, isFormData = false) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, { method: 'POST', headers: getHeaders(isFormData), body: isFormData ? data : JSON.stringify(data) });
      return await response.json();
    } catch (error) {
      console.error(`Error in POST ${endpoint}:`, error);
      throw error;
    }
  },

  put: async (endpoint, data, isFormData = false) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, { method: 'PUT', headers: getHeaders(isFormData), body: isFormData ? data : JSON.stringify(data) });
      return await response.json();
    } catch (error) {
      console.error(`Error in PUT ${endpoint}:`, error);
      throw error;
    }
  },

  delete: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, { method: 'DELETE', headers: getHeaders() });
      return await response.json();
    } catch (error) {
      console.error(`Error in DELETE ${endpoint}:`, error);
      throw error;
    }
  }
};
