const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = 5100; // Choose an available port

app.use(cors()); // This enables CORS for all routes

app.get("/fetch-headlines", async (req, res) => {
  try {
    const apiKey = "f62b853dd63c43cda65a8610807f5f8e"; // Put your API key here
    const country = req.query.country || "us"; // Default to 'us' if no country provided
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 20;

    const response = await axios.get(
      "https://newsapi.org/v2/everything?domains=techcrunch.com,thenextweb.com" +
        "country=us&" +
        "apiKey=f62b853dd63c43cda65a8610807f5f8e",
      {
        params: {
          apiKey,
          page,
          pageSize,
        },
      },
    );

    res.json(response.data); // Send the data from the API response to the frontend
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch news");
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
