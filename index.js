const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = 5100; // Choose an available port

app.use(cors()); // This enables CORS for all routes

app.get("/fetch-headlines", async (req, res) => {
    try {
        const apiKey = "2fd444b95efb46ca99e7ea2a4cef970d"; // Put your API key here
        const country = req.query.country || "us"; // Default to 'us' if no country provided

        const response = await axios.get(
            "https://newsapi.org/v2/top-headlines?" +
            "country=us&" +
            "apiKey=2fd444b95efb46ca99e7ea2a4cef970d",
            {
                params: {
                    country,
                    apiKey,
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
