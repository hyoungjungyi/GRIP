import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Tuner from "./pages/Tuner/Tuner";
import MyPage from "./pages/MyPage/MyPage";
import MetronomePractice from "./pages/Metronome/MetronomePractice";
import SheetView from "./pages/SheetView/SheetView";
import Archive from "./pages/MyPage/Archive";
import AlbumDetail from "./pages/SheetView/AlbumDetail";
import { TimerProvider } from "./context/TimerContext";
import Timer from "./components/Timer";

function App() {
  return (
    <TimerProvider>
      <div className="app-container">
        <Navbar />
        <Timer />
        <Routes>
          <Route path="/tuner" element={<Tuner />} />
          <Route path="/sheetView" element={<SheetView />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/metronome-practice" element={<MetronomePractice />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/album/:songId" element={<AlbumDetail />} />
        </Routes>
      </div>
    </TimerProvider>
  );
}

export default App;
