import express from 'express';  
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to the Search API Server');
});

// YouTube API Route
app.get('/api/youtube', async (req, res) => {
  const searchTerm = req.query.q;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${searchTerm}&key=${process.env.API_KEY_YOUTUBE}`;

  try {
    // Fetch video details including video IDs
    const searchResponse = await axios.get(url);
    const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');

    if (!videoIds) {
      return res.status(404).json({ error: 'No videos found' });
    }

    // Fetch video statistics (views, likes) using video IDs
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${process.env.API_KEY_YOUTUBE}`;
    const statsResponse = await axios.get(statsUrl);

    res.json(statsResponse.data.items);
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    res.status(500).json({ error: 'Error fetching YouTube data' });
  }
});

// Google Search API Route
app.get('/api/google-search', async (req, res) => {
  const searchTerm = req.query.q;
  const url = `https://www.googleapis.com/customsearch/v1?q=${searchTerm}&key=${process.env.API_KEY_GOOGLE_SEARCH}&cx=${process.env.CX_ID}`;

  try {
    const response = await axios.get(url);
    res.json(response.data.items);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching Google Search data' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
