const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio"); // For scraping article content
const cors = require("cors"); // To handle CORS

const app = express();
const port = 5100;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// API route to fetch and scrape article
app.get("/fetch-article", async (req, res) => {
    const { url } = req.query; // Get URL from query parameter

    console.log("Received URL:", url); // Debug log

    // Check if URL is provided
    if (!url) {
        return res.status(400).json({ error: "No URL provided" });
    }

    try {
        // Fetch the HTML of the given article URL
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Improved selectors to fetch article content
        const articleContent =
            $(".article-body").text() ||
            $(".post-content").text() ||
            $("main").find("p").text() || // Look for paragraphs in main
            $("article").find("p").text(); // Look for paragraphs in article

        // If no article content found, return an error
        if (!articleContent) {
            return res.status(404).json({ error: "Article content not found" });
        }

        // Send the article content back to the frontend
        res.json({ article: articleContent });
    } catch (error) {
        // Log any errors and respond with a 500 status
        console.error("Error fetching article:", error);
        res.status(500).json({ error: "Failed to fetch article" });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

