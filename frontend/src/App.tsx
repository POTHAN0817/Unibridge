import { useState } from "react";
import type { Page, Role } from "./types";
import Nav from "./components/Nav";
import Landing from "./pages/Landing";
import RoleSelect from "./pages/RoleSelect";
import CitizenDashboard from "./pages/CitizenDashboard";
import ReportChallenge from "./pages/ReportChallenge";
import AIAnalysis from "./pages/AIAnalysis";
import GovCommandCenter from "./pages/GovCommandCenter";
import UniversityDashboard from "./pages/UniversityDashboard";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import Impact from "./pages/Impact";

export default function App() {
  const [pageHistory, setPageHistory] = useState<Page[]>(["landing"]);
  const [role, setRole] = useState<Role | null>(null);

  const currentPage = pageHistory[pageHistory.length - 1] || "landing";

  const navigate = (p: Page) => {
    if (p !== currentPage) {
      setPageHistory((prev) => [...prev, p]);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (pageHistory.length > 1) {
      setPageHistory((prev) => prev.slice(0, prev.length - 1));
    } else {
      setPageHistory(["landing"]);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRoleSelect = (r: Role, p: Page) => {
    setRole(r);
    navigate(p);
  };

  return (
    <div className="size-full bg-white text-navy">
      <Nav currentPage={currentPage} role={role} onNavigate={navigate} onBack={handleBack} canGoBack={pageHistory.length > 1} />

      {currentPage === "landing" && <Landing onNavigate={navigate} />}
      {currentPage === "role-select" && <RoleSelect onSelect={handleRoleSelect} onBack={handleBack} />}
      {currentPage === "citizen-dashboard" && <CitizenDashboard onNavigate={navigate} onBack={handleBack} />}
      {currentPage === "report-challenge" && <ReportChallenge onNavigate={navigate} onBack={handleBack} />}
      {currentPage === "ai-analysis" && <AIAnalysis onNavigate={navigate} onBack={handleBack} />}
      {currentPage === "gov-command" && <GovCommandCenter onNavigate={navigate} onBack={handleBack} />}
      {currentPage === "university-dashboard" && <UniversityDashboard onNavigate={navigate} onBack={handleBack} />}
      {currentPage === "project-workspace" && <ProjectWorkspace onBack={handleBack} />}
      {currentPage === "impact" && <Impact onNavigate={navigate} onBack={handleBack} />}
    </div>
  );
}
