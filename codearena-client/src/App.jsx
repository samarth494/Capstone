import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FrontPage from "./pages/FrontPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PracticePage from "./pages/PracticePage";
import BattleLobbyPage from "./pages/BattleLobbyPage";
import ProblemSolverPage from "./pages/ProblemSolverPage";
import BattleArenaPage from "./pages/BattleArenaPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import ReplayPage from "./pages/ReplayPage";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FrontPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/lobby" element={<BattleLobbyPage />} />
          <Route path="/problem/:problemId" element={<ProblemSolverPage />} />
          <Route path="/battle/:roomId" element={<BattleArenaPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/replay/:battleId" element={<ReplayPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
