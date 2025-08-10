import axios from 'axios';

interface Filter {
  field: string;
  operation: string;
  value: string | number;
}

interface SaveFilterPayload {
  user_id: string;
  email_id: string;
  frequency: string;
  filter_name: string;
  filters: string;
  is_alerting: boolean;
}

interface UpdateFilterPayload {
  filter_id?: string;
  filter_name?: string;
  is_alerting?: boolean;
  frequency?: string;
  filters?: Filter[];
  email_id?: string;
}

const API_BASE_URL = 'https://api.wheelstrategyoptions.com';

export const screenerService = {
  saveFilter: async (payload: SaveFilterPayload) => {
    try {
      // Ensure the payload matches the exact format expected by the API
      const formattedPayload = {
        user_id: payload.user_id,
        email_id: payload.email_id,
        frequency: payload.frequency,
        filter_name: payload.filter_name,
        filters: payload.filters,
        is_alerting: payload.is_alerting
      };
  
      const response = await axios.post(`${API_BASE_URL}/wheelstrat/saveFilter`, payload);
      return response.data;
    } catch (error) {
      console.error('Error saving filter:', error);
      throw error;
    }
  },

  updateFilter: async (payload: UpdateFilterPayload) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/wheelstrat/updateFilter`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating filter:', error);
      throw error;
    }
  },

  fetchFilter: async (params: { filter_id?: string; user_id?: string }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.filter_id) queryParams.append('filter_id', params.filter_id);
      if (params.user_id) queryParams.append('user_id', params.user_id);

      const response = await axios.get(`${API_BASE_URL}/wheelstrat/fetchFilter?${queryParams.toString()}`);
      return response.data.filter((r: { is_deleted: any; }) => !r.is_deleted);
    } catch (error) {
      console.error('Error fetching filter:', error);
      throw error;
    }
  },

  deleteFilter: async (filter_id: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wheelstrat/deleteFilter?filter_id=${filter_id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting filter:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },
}; 