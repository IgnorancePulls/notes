import axios from 'axios';

import { API_BASE_URL,SESSION_ID } from '@/constants/config';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/${SESSION_ID}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
