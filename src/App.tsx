import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Tuner from "./pages/Tuner/Tuner";
import MyPage from "./pages/MyPage/MyPage";
import MetronomePractice from "./pages/Metronome/MetronomePractice";
import SheetView from "./pages/SheetView/SheetView";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/tuner" element={<Tuner />} />
          <Route path="/sheetView" element={<SheetView />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/metronome-practice" element={<MetronomePractice />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
