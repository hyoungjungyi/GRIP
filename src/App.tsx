import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Tuner from "./pages/Tuner/Tuner";
import SheetList from "./pages/SheetList";
import MyPage from "./pages/MyPage";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/tuner" element={<Tuner />} />
          <Route path="/sheetList" element={<SheetList />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
