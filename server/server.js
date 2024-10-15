const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
const port = 9000;
const pastebinKey = 'l6ccuOpobsa5IisYMP37Epqsb9kP2ZuK'; 

app.use(
  cors({
    origin: "*",
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

app.post('/notes', async (req, res) => {
  try {
    const { api_paste_name, api_paste_code } = req.body;
    if (!api_paste_name || !api_paste_code) {
      console.error('Error: Missing note title or content');
      return res.status(400).send({ error: 'Missing note title or content' });
    }

    const data = new URLSearchParams();
    data.append('api_dev_key', pastebinKey);
    data.append('api_option', 'paste');
    data.append('api_paste_code', api_paste_code);
    data.append('api_paste_name', api_paste_name);
    data.append('api_paste_private', '1'); // 0=public, 1=unlisted, 2=private

    const response = await axios.post('https://pastebin.com/api/api_post.php', data.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response || !response.data) {
      console.error('Error: Missing response data');
      return res.status(500).send({ error: 'Missing response data' });
    }

    res.send({ url: response.data });
  } catch (error) {
    console.error('Failed to save note:', error);
    res.status(500).send({ error: 'Error saving note: ' + error.message });
  }
});

// Endpoint to fetch saved notes
app.get('/favorites', async (req, res) => {
  try {
    const userKey = req.query.api_user_key;
    // if (!userKey) {
    //   console.error('Error: Missing user key');
    //   return res.status(400).send({ error: 'Missing user key' });
    // }

    const response = await axios.get('https://pastebin.com/api/api_list.php', {
      params: {
        api_dev_key: pastebinKey,
        api_user_key: userKey
      }
    });

    const notes = [];
    response.data.forEach(note => {
      const noteTitle = note.title;
      notes.push({url: note.key, title: noteTitle});
    });
    res.send(notes);
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    res.status(500).send({ error: 'Error fetching notes: ' + error.message });
  }
});

app.get("/api/search", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send({ error: "No URL provided" });
  }
  try {
    const response = await axios.get(
      `https://api.trace.moe/search?url=${encodeURIComponent(url)}`
      
    );
    const resData = response.data;

    if (!resData || !resData.result || resData.result.length === 0) {
      return res.status(404).send({ error: "No data found" });
    }
    const anime = resData.result;
    // Send response back to client
    res.status(200).json(anime);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to retrieve data" });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

