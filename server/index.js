var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield sequelize.authenticate();
            console.log("Connection to the database has been established successfully.");
            yield sequelize.sync({ force: true });
            console.log("Database synchronized successfully.");
        }
        catch (error) {
            console.error("Unable to connect to or synchronize the database:", error);
        }
    });
}
// Helper functions
const getComic = (comicId) => __awaiter(this, void 0, void 0, function* () {
    const url = comicId === LATEST_STR
        ? "https://xkcd.com/info.0.json"
        : `https://xkcd.com/${comicId}/info.0.json`;
    return yield axios.get(url);
});
const isToday = (date) => {
    const today = new Date();
    return (date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear());
};
const getLatestComicNum = () => __awaiter(this, void 0, void 0, function* () {
    let latestComic = yield LatestComic.findOne();
    if (!latestComic || !isToday(latestComic.last_updated)) {
        try {
            const response = yield getComic(LATEST_STR);
            const latestComicNum = response.data.num;
            yield LatestComic.upsert({
                num: latestComicNum,
                last_updated: new Date(),
            });
            return latestComicNum;
        }
        catch (error) {
            console.error("Unable to fetch the latest comic number from XKCD:", error);
            throw new Error("Unable to fetch the latest comic number from XKCD");
        }
    }
    return latestComic.num;
});
const incrementViewCount = (num) => __awaiter(this, void 0, void 0, function* () {
    try {
        const [comic] = yield ComicViewCount.findOrCreate({
            where: { num },
            defaults: { view_count: 0 },
        });
        yield comic.increment("view_count");
    }
    catch (error) {
        console.error("Error incrementing view count:", error);
    }
});
const getComicViewCount = (num) => __awaiter(this, void 0, void 0, function* () {
    const comic = yield ComicViewCount.findOne({ where: { num } });
    return comic ? comic.view_count : 0;
});
// Routes
app.get("/api/comic/:id?", (req, res) => __awaiter(this, void 0, void 0, function* () {
    const comicId = req.params.id || LATEST_STR;
    try {
        const response = yield getComic(comicId);
        const latestComicNum = yield getLatestComicNum();
        yield incrementViewCount(response.data.num);
        const viewCount = yield getComicViewCount(response.data.num);
        res.json(Object.assign(Object.assign({}, response.data), { max_num: latestComicNum, view_count: viewCount }));
    }
    catch (error) {
        console.error("Error fetching comic:", error);
        res.status(500).json({ error: "Unable to fetch comic" });
    }
}));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});
// Start server
initializeDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});
