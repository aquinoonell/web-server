const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const port = 5100;
app.use(cors());

// Dev.to Articles Endpoint
app.get("/fetch-articles", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        
        // Fetch articles from Dev.to
        const response = await axios.get("https://dev.to/api/articles", {
            params: {
                page: page,
                per_page: pageSize,
                top: 1000  // Fetch top articles
            }
        });
        
        // Transform Dev.to articles to match existing structure
        const articles = response.data.map(article => ({
            title: article.title,
            description: article.description || 'Technology article from Dev.to',
            url: article.url,
            urlToImage: article.cover_image || article.social_image || `https://via.placeholder.com/400x250.png?text=Dev.to+Article`,
            publishedAt: article.published_at,
            source: {
                name: "Dev.to"
            },
            author: article.user.name || article.user.username
        }));
        
        res.json({
            articles,
            totalResults: 1000,  // Dev.to top articles limit
            currentPage: page,
            pageSize: pageSize
        });
    } catch (error) {
        console.error("Error fetching Dev.to articles:", error.message);
        res.status(500).json({ 
            error: "Failed to fetch articles", 
            details: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
