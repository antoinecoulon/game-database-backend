import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API key not found in environment variables.");
}

const app = express();

const corsOptions = {
    origin: process.env.CLIENT_DOMAIN,
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});

// Apply rate limiting to all API requests
app.use(limiter);

app.get("/api/games", async (req, res) => {
    const { search: searchQuery } = req.query;

    try {
        const response = await fetch(
            `https://api.rawg.io/api/games?key=${API_KEY}&search=${searchQuery}`,
            {
                method: "GET",
                headers: {
                    // Authorization: `Bearer ${API_KEY}`, some APIs requires using the authorization header but not this one
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            return res.status(500).json({ error: "Failed to fetch data from external API"});
        }

        const data = await response.json();
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch data from external API" });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});