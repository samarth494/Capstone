import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FrontPage from "./pages/FrontPage";
import AboutPage from "./pages/AboutPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import PracticePage from "./pages/PracticePage";
import ProblemSolverPage from "./pages/ProblemSolverPage";
import BattleArenaPage from "./pages/BattleArenaPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import ReplayPage from "./pages/ReplayPage";
import DataStructureBattlePage from "./pages/DataStructureBattlePage";
import EventsPage from "./pages/EventsPage";
import EventShowcasePage from "./pages/EventShowcasePage";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import BattleLobbyPage from "./pages/BattleLobbyPage";
import CompetitionLobbyPage from "./pages/CompetitionLobbyPage";


function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<FrontPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />
        <Route path="/battle/data-structures" element={<DataStructureBattlePage />} />
        <Route path="/events" element={<EventShowcasePage />} />
        <Route path="/about" element={<AboutPage />} />


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
          <Route path="/dashboard/events" element={<EventsPage />} />
          <Route path="/competition/:eventId/lobby" element={<CompetitionLobbyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
