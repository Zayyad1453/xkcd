const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const sequelize = require("./database");
const ComicViewCount = require("./models/ComicViewCount");
const LatestComic = require("./models/LatestComic");

const LATEST_STR = "latest";
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "../client/build")));

// Database initialization
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log(
      "Connection to the database has been established successfully."
    );
    await sequelize.sync({ force: true });
    console.log("Database synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to or synchronize the database:", error);
  }
}

// Helper functions
const getComic = async (comicId) => {
  const url =
    comicId === LATEST_STR
      ? "https://xkcd.com/info.0.json"
      : `https://xkcd.com/${comicId}/info.0.json`;
  return await axios.get(url);
};

const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const getLatestComicNum = async () => {
  let latestComic = await LatestComic.findOne();

  if (!latestComic || !isToday(latestComic.last_updated)) {
    try {
      const response = await getComic(LATEST_STR);
      const latestComicNum = response.data.num;

      await LatestComic.upsert({
        num: latestComicNum,
        last_updated: new Date(),
      });

      return latestComicNum;
    } catch (error) {
      console.error(
        "Unable to fetch the latest comic number from XKCD:",
        error
      );
      throw new Error("Unable to fetch the latest comic number from XKCD");
    }
  }

  return latestComic.num;
};

const incrementViewCount = async (num) => {
  try {
    const [comic] = await ComicViewCount.findOrCreate({
      where: { num },
      defaults: { view_count: 0 },
    });
    await comic.increment("view_count");
  } catch (error) {
    console.error("Error incrementing view count:", error);
  }
};

const getComicViewCount = async (num) => {
  const comic = await ComicViewCount.findOne({ where: { num } });
  return comic ? comic.view_count : 0;
};

// Routes
app.get("/api/comic/:id?", async (req, res) => {
  const comicId = req.params.id || LATEST_STR;
  try {
    const response = await getComic(comicId);
    const latestComicNum = await getLatestComicNum();
    await incrementViewCount(response.data.num);
    const viewCount = await getComicViewCount(response.data.num);

    res.json({
      ...response.data,
      max_num: latestComicNum,
      view_count: viewCount,
    });
  } catch (error) {
    console.error("Error fetching comic:", error);
    res.status(500).json({ error: "Unable to fetch comic" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Start server
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
