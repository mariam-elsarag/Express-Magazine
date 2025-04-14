import axios from "axios";
import asyncWraper from "../../utils/asyncWraper.js";

// footbal news api
export const footbalNewsApi = asyncWraper(async (req, res, next) => {
  const response = await axios.get("https://newsapi.org/v2/everything", {
    params: {
      q: "football",
      language: "en",
      sortBy: "publishedAt",
      apiKey: process.env.NEWS_API_KEY,
    },
  });
  res.status(200).json(response.data);
});
