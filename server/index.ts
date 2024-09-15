const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");
const sequelize = require("./database");
const path = require("path");

const { ComicsViews } = require("./models/ComicsViews");
const { LatestComic } = require("./models/LatestComic");

const LATEST_STR = "latest";
const port = process.env.PORT || 5000;

(async () => {
  await sequelize.authenticate();
})();
sequelize.sync({ force: true }).then(async () => {
  console.log("Database synced");
});

const test = async () => {
  try {
    const entry = await LatestComic.create({ num: 100 });
    console.log("🚀TCL ~ test ~ entry:", entry);
  } catch (e) {
    console.log("error", e);
  }
};

test();

app.use(cors());
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("/api/comic/:id?", async (req, res) => {
  const comicId = req.params.id || LATEST_STR;
  console.log("🚀TCL ~ app.get ~ comicId:", comicId);
  try {
    const response = await getComic(comicId);
    const latestComicNum = await getLatestComicNum();
    const viewCount = getComicViewCount(response.data.num);
    res.json({
      ...response.data,
      max_num: 2000,
      //   view_count: viewCount,
    });
    // await incrementViewCount(response.data.num);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch comic" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const getComic = async (comicId) => {
  const url =
    comicId === LATEST_STR
      ? "https://xkcd.com/info.0.json"
      : `https://xkcd.com/${comicId}/info.0.json`;

  return await axios.get(url);
};

// const updateLatestComicNum = async (latestNum) => {
//   const latestComicRepo = getRepository(LatestComicModel);
//   const [latestComic, created] = await latestComicRepo.update({
//     num: latestNum,
//   });
//   return latestComic.num;
// };

const getLatestComicNum = async () => {
  let latestComic = await LatestComic.findOne();
  console.log("🚀TCL GETTING LATEST:");
  //   console.log("🚀TCL ~ getLatestComicNum ~ latestComic:", latestComic);
  if (!latestComic) {
    try {
      const response = await getComic(LATEST_STR);
      const latestComicNum = response.data.num;

      await LatestComic.upsert({ num: latestComicNum });
      return latestComicNum;
    } catch (error) {
      console.log("🚀TCL ~ getLatestComicNum ~ error:", error);
      throw new Error("Unable to fetch the latest comic number from XKCD");
    }
  }

  return latestComic.num;
};
const incrementViewCount = async (num) => {
  const comic = await ComicsViews.findOne({
    where: { num },
  }).then((resp) => {
    if (resp) {
      resp.update({ view_count: resp.view_count + 1 });
    }
  });
};

const getComicViewCount = async (num) => {
  const comic = await ComicsViews.findOne({
    where: { num },
  });
  if (comic) {
    return comic.view_count;
  }
  return 0;
};
