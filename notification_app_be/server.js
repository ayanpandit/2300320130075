const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const API_URL = 'http://4.224.186.213/evaluation-service/notifications';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

app.get('/api/notifications', async (req, res) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching notifications:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch notifications from core API' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend proxy running on http://localhost:${PORT}`);
});
