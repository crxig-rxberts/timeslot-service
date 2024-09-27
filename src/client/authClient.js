const axios = require('axios');

const authClient = axios.create({
  baseURL: 'http://localhost:3000/api/auth',
  timeout: 5000, // 5 seconds timeout
});

const verifyToken = async (token) => {
  const response = await authClient.get('/verify-token', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

module.exports = {
  verifyToken
};
