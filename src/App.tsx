import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Tuner from "./pages/Tuner/Tuner";
import SheetList from "./pages/SheetList/SheetList";
import MyPage from "./pages/MyPage";
import MetronomePractice from "./pages/Metronome/MetronomePractice";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/tuner" element={<Tuner />} />
          <Route path="/sheetList" element={<SheetList />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/metronome-practice" element={<MetronomePractice />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
