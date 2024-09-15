import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { NavButtons } from "./NavButtons";
import { useNavigate, useParams } from "react-router-dom";
import { parseTranscript } from "../utils/parseTranscript";
import { ErrorFallback } from "./ErrorFallback";

type comicIdType = number | null;
type comic = {
  month: string;
  num: number;
  link: string;
  year: string;
  news: string;
  safe_title: string;
  transcript: string;
  alt: string;
  img: string;
  title: string;
  day: string;
} | null;

function ComicPage() {
  const [comic, setComic] = useState<comic>(null);
  const [hasError, setHasError] = useState(false);
  console.log("🚀TCL ~ App ~ comic:", comic);
  const [maxComicNum, setComicMaxNum] = useState(0);
  const { id: pathId } = useParams();
  const navigate = useNavigate();

  const parsePathId = useCallback(() => {
    if (pathId) {
      const pathIdInt = parseInt(pathId);
      return isNaN(pathIdInt) ? null : pathIdInt;
    }
    return null;
  }, [pathId]);

  const fetchComic = async (id: comicIdType) => {
    try {
      setHasError(false);
      const response = await axios.get(
        `http://localhost:5000/api/comic/${id || "latest"}`
      );
      setComic(response.data);
      setComicMaxNum(response.data.max_num);
    } catch (error) {
      setHasError(true);
      console.error("Error fetching comic data:", error);
    }
  };

  useEffect(() => {
    console.log("In here");
    fetchComic(parsePathId());
  }, [pathId, parsePathId]);

  const handleNav = (comicId: comicIdType) => {
    // fetchComic(comicId);
    navigate(`/comic/${comicId}`);
  };
  const goToHome = () => {
    navigate(`/`);
  };

  const handleRandom = async () => {
    console.log("🚀TCL ~ handleRandom ~ maxComicNum:", maxComicNum);
    navigate(`/comic/${Math.floor(Math.random() * maxComicNum)}`);
  };

  const getDateCreated = useCallback(() => {
    if (comic) {
      return new Date(`${comic.month}/${comic.day}/${comic.year}`).toString();
    }
  }, [comic]);

  const getComicTranscript = useCallback(() => {
    if (comic?.transcript?.trim()) {
      return parseTranscript(comic.transcript);
    }
    return "No transcript provided.";
  }, [comic]);

  const createdDate = getDateCreated();
  const comicTranscript = getComicTranscript();
  return (
    <div className="container">
      <div className="comic-headers">
        <h1 className="link" onClick={goToHome}>
          XKCD Comics
        </h1>
        {comic && <h2>{comic.title}</h2>}
      </div>
      {hasError ? (
        <ErrorFallback goToHome={goToHome} handleRandom={handleRandom} />
      ) : (
        comic && (
          <div>
            <NavButtons
              handleNav={handleNav}
              handleRandom={handleRandom}
              currentComicId={comic.num}
            />
            <div className="comic-img-container">
              <img src={comic.img} alt={comic.alt} />
            </div>
            <NavButtons
              handleNav={handleNav}
              handleRandom={handleRandom}
              currentComicId={comic.num}
            />
            <p>Date Created: {createdDate}</p>
            <div className="transcript">
              <h3 className="heading">Transcript:</h3>
              <p dangerouslySetInnerHTML={{ __html: comicTranscript }} />
            </div>
            {/* <p>Views: {views}</p> */}
          </div>
        )
      )}
    </div>
  );
}

export default ComicPage;
