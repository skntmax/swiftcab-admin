
import axios from 'axios';
class ApiClient {
  constructor(baseURL, timeout = 5000) {
    this.client = axios.create({
      baseURL,
      timeout,
    });
  }

  // GET Request
  async get(endpoint, params = {}, headers = {}) {
    try {
      const response = await this.client.get(endpoint, { params, headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // POST Request
  async post(endpoint, data = {}, headers = {}) {
    try {
        console.log("endpoint",endpoint , data , headers)
      const response = await this.client.post(endpoint, data,  headers );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // PUT Request
  async put(endpoint, data = {}, headers = {}) {
    try {
      const response = await this.client.put(endpoint, data, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // DELETE Request
  async delete(endpoint, headers = {}) {
    try {
      const response = await this.client.delete(endpoint, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Handle Errors
  handleError(error) {

    
    if (error.response) {
      console.error(`API Error: ${error.response.status} - ${error.response.data}`);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request error:', error.message);
    }
    throw error;
  }
}

// Example Usage
export const useAxios = new ApiClient(process.env.NEXT_PUBLIC_API_URL);

