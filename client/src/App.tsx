import { BrowserRouter, Route, Routes } from "react-router-dom";
import ComicPage from "./components/ComicPage";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<ComicPage />} />
          <Route path="/comic/:id" element={<ComicPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
