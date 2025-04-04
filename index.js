const express = require("express");
const axios = require("axios");
const app = express();
const serverless = require("serverless-http");

// Note: We removed CORS to reduce dependencies
// If you need CORS, make sure to include it in the deployment package

// Simple in-memory cache
let articlesCache = {
  data: null,
  timestamp: null,
  expiresIn: 5 * 60 * 1000 // 5 minutes
};

// Fallback data in case Dev.to API is unresponsive
const getFallbackArticles = (page = 1, pageSize = 10) => {
  return {
    articles: Array(pageSize).fill().map((_, i) => ({
      title: `Fallback Article ${i + 1}`,
      description: "This is a fallback article when Dev.to API is unavailable",
      url: "https://dev.to/",
      urlToImage: `https://via.placeholder.com/400x250.png?text=Fallback+Article+${i+1}`,
      publishedAt: new Date().toISOString(),
      source: { name: "Dev.to (Fallback)" },
      author: "System"
    })),
    totalResults: pageSize,
    currentPage: page,
    pageSize: pageSize,
    isFallback: true
  };
};

// Dev.to Articles Endpoint
app.get("/", async (req, res) => {
  // Enable CORS manually to avoid dependency
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  // Check cache first
  if (articlesCache.data && 
      articlesCache.timestamp && 
      (Date.now() - articlesCache.timestamp < articlesCache.expiresIn)) {
    console.log("Serving from cache");
    return res.json(articlesCache.data);
  }

  try {
    // Use Promise with timeout for faster response
    const fetchWithTimeout = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      try {
        const response = await axios.get("https://dev.to/api/articles", {
          signal: controller.signal,
          params: {
            page: page,
            per_page: pageSize,
            top: 1000
          }
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    const result = await fetchWithTimeout();
    
    // Transform Dev.to articles
    const articles = result.data.map(article => ({
      title: article.title || "Untitled Article",
      description: article.description || 'Technology article from Dev.to',
      url: article.url || "https://dev.to",
      urlToImage: article.cover_image || article.social_image || `https://via.placeholder.com/400x250.png?text=Dev.to+Article`,
      publishedAt: article.published_at || new Date().toISOString(),
      source: { name: "Dev.to" },
      author: article.user?.name || article.user?.username || "Unknown"
    }));

    const responseData = {
      articles,
      totalResults: 1000,
      currentPage: page,
      pageSize: pageSize
    };

    // Update cache
    articlesCache.data = responseData;
    articlesCache.timestamp = Date.now();
    
    res.json(responseData);
  } catch (error) {
    console.error("Error fetching Dev.to articles:", error.message);
    
    // Use fallback data
    res.json(getFallbackArticles(page, pageSize));
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

module.exports.handler = serverless(app);
