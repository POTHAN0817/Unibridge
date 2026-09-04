import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { AppLayout } from "../components/layout/AppLayout";

// Public Pages
import Landing from "../pages/public/Landing";
import RoleSelect from "../pages/public/RoleSelect";
import NotFound from "../pages/public/NotFound";
import Unauthorized from "../pages/public/Unauthorized";

// Auth Pages
import CitizenLogin from "../pages/auth/CitizenLogin";
import CitizenRegister from "../pages/auth/CitizenRegister";
import UniversityLogin from "../pages/auth/UniversityLogin";
import UniversityRegister from "../pages/auth/UniversityRegister";
import IndustryLogin from "../pages/auth/IndustryLogin";
import IndustryRegister from "../pages/auth/IndustryRegister";
import GovernmentLogin from "../pages/auth/GovernmentLogin";
import GovernmentRegister from "../pages/auth/GovernmentRegister";

// Citizen Pages
import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import ReportChallenge from "../pages/citizen/ReportChallenge";
import CitizenChallenges from "../pages/citizen/CitizenChallenges";
import CitizenChallengeDetails from "../pages/citizen/CitizenChallengeDetails";
import CitizenImpact from "../pages/citizen/CitizenImpact";
import CitizenProfile from "../pages/citizen/CitizenProfile";

// University Pages
import UniversityDashboard from "../pages/university/UniversityDashboard";
import RecommendedChallenges from "../pages/university/RecommendedChallenges";
import UniversityChallengeDetails from "../pages/university/UniversityChallengeDetails";
import UniversityProjects from "../pages/university/UniversityProjects";
import UniversityProjectWorkspace from "../pages/university/UniversityProjectWorkspace";
import UniversityTeams from "../pages/university/UniversityTeams";
import UniversityFaculty from "../pages/university/UniversityFaculty";
import UniversityStudents from "../pages/university/UniversityStudents";
import UniversityImpact from "../pages/university/UniversityImpact";
import UniversityProfile from "../pages/university/UniversityProfile";

// Industry Pages
import IndustryDashboard from "../pages/industry/IndustryDashboard";
import IndustryChallenges from "../pages/industry/IndustryChallenges";
import IndustryChallengeDetails from "../pages/industry/IndustryChallengeDetails";
import IndustryProjects from "../pages/industry/IndustryProjects";
import IndustryProjectWorkspace from "../pages/industry/IndustryProjectWorkspace";
import IndustryMentorship from "../pages/industry/IndustryMentorship";
import IndustryFunding from "../pages/industry/IndustryFunding";
import IndustryTechnology from "../pages/industry/IndustryTechnology";
import IndustryImpact from "../pages/industry/IndustryImpact";
import IndustryProfile from "../pages/industry/IndustryProfile";

// Government Pages
import GovCommandCenter from "../pages/government/GovCommandCenter";
import GovernmentChallenges from "../pages/government/GovernmentChallenges";
import GovernmentChallengeDetails from "../pages/government/GovernmentChallengeDetails";
import GovernmentValidation from "../pages/government/GovernmentValidation";
import GovernmentProjects from "../pages/government/GovernmentProjects";
import GovernmentProjectMonitoring from "../pages/government/GovernmentProjectMonitoring";
import GovernmentUniversities from "../pages/government/GovernmentUniversities";
import GovernmentIndustry from "../pages/government/GovernmentIndustry";
import GovernmentAnalytics from "../pages/government/GovernmentAnalytics";
import GovernmentImpact from "../pages/government/GovernmentImpact";
import GovernmentProfile from "../pages/government/GovernmentProfile";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Shell Layout with Navigation Header */}
      <Route element={<AppLayout />}>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/roles" element={<RoleSelect />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* AUTH ROUTES */}
        <Route path="/auth/citizen/login" element={<CitizenLogin />} />
        <Route path="/auth/citizen/register" element={<CitizenRegister />} />
        <Route path="/auth/university/login" element={<UniversityLogin />} />
        <Route path="/auth/university/register" element={<UniversityRegister />} />
        <Route path="/auth/industry/login" element={<IndustryLogin />} />
        <Route path="/auth/industry/register" element={<IndustryRegister />} />
        <Route path="/auth/government/login" element={<GovernmentLogin />} />
        <Route path="/auth/government/register" element={<GovernmentRegister />} />

        {/* CITIZEN PROTECTED ROUTES */}
        <Route
          path="/citizen/dashboard"
          element={
            <ProtectedRoute allowedRoles={["citizen"]}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/report"
          element={
            <ProtectedRoute allowedRoles={["citizen"]}>
              <ReportChallenge />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/challenges"
          element={
            <ProtectedRoute allowedRoles={["citizen"]}>
              <CitizenChallenges />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/challenges/:challengeId"
          element={
            <ProtectedRoute allowedRoles={["citizen"]}>
              <CitizenChallengeDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/impact"
          element={
            <ProtectedRoute allowedRoles={["citizen"]}>
              <CitizenImpact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/profile"
          element={
            <ProtectedRoute allowedRoles={["citizen"]}>
              <CitizenProfile />
            </ProtectedRoute>
          }
        />

        {/* UNIVERSITY PROTECTED ROUTES */}
        <Route
          path="/university/dashboard"
          element={
            <ProtectedRoute allowedRoles={["university"]}>
              <UniversityDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/university/challenges"
          element={
            <ProtectedRoute allowedRoles={["university"]}>
              <RecommendedChallenges />
            </ProtectedRoute>
          }
        />
        <Route
          path="/university/challenges/:challengeId"
          element={
            <ProtectedRoute allowedRoles={["university"]}>
              <UniversityChallengeDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/university/projects"
          element={
            <ProtectedRoute allowedRoles={["university"]}>
              <UniversityProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/university/projects/:projectId"
          element={
            <ProtectedRoute allowedRoles={["university"]}>
              <UniversityProjectWorkspace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/university/teams"
          element={
            <ProtectedRoute allowedRoles={["university"]}>
              <UniversityTeams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/university/faculty"
          element={
            <ProtectedRoute allowedRoles={["university"]}>
              <UniversityFaculty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/university/students"
          element={
            <ProtectedRoute allowedRoles={["university"]}>
              <UniversityStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/university/impact"
          element={
            <ProtectedRoute allowedRoles={["university"]}>
              <UniversityImpact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/university/profile"
          element={
            <ProtectedRoute allowedRoles={["university"]}>
              <UniversityProfile />
            </ProtectedRoute>
          }
        />

        {/* INDUSTRY PROTECTED ROUTES */}
        <Route
          path="/industry/dashboard"
          element={
            <ProtectedRoute allowedRoles={["industry"]}>
              <IndustryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/industry/challenges"
          element={
            <ProtectedRoute allowedRoles={["industry"]}>
              <IndustryChallenges />
            </ProtectedRoute>
          }
        />
        <Route
          path="/industry/challenges/:challengeId"
          element={
            <ProtectedRoute allowedRoles={["industry"]}>
              <IndustryChallengeDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/industry/projects"
          element={
            <ProtectedRoute allowedRoles={["industry"]}>
              <IndustryProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/industry/projects/:projectId"
          element={
            <ProtectedRoute allowedRoles={["industry"]}>
              <IndustryProjectWorkspace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/industry/mentorship"
          element={
            <ProtectedRoute allowedRoles={["industry"]}>
              <IndustryMentorship />
            </ProtectedRoute>
          }
        />
        <Route
          path="/industry/funding"
          element={
            <ProtectedRoute allowedRoles={["industry"]}>
              <IndustryFunding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/industry/technology"
          element={
            <ProtectedRoute allowedRoles={["industry"]}>
              <IndustryTechnology />
            </ProtectedRoute>
          }
        />
        <Route
          path="/industry/impact"
          element={
            <ProtectedRoute allowedRoles={["industry"]}>
              <IndustryImpact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/industry/profile"
          element={
            <ProtectedRoute allowedRoles={["industry"]}>
              <IndustryProfile />
            </ProtectedRoute>
          }
        />

        {/* GOVERNMENT PROTECTED ROUTES */}
        <Route
          path="/government/dashboard"
          element={
            <ProtectedRoute allowedRoles={["government"]}>
              <GovCommandCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/government/challenges"
          element={
            <ProtectedRoute allowedRoles={["government"]}>
              <GovernmentChallenges />
            </ProtectedRoute>
          }
        />
        <Route
          path="/government/challenges/:challengeId"
          element={
            <ProtectedRoute allowedRoles={["government"]}>
              <GovernmentChallengeDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/government/validation"
          element={
            <ProtectedRoute allowedRoles={["government"]}>
              <GovernmentValidation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/government/projects"
          element={
            <ProtectedRoute allowedRoles={["government"]}>
              <GovernmentProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/government/projects/:projectId"
          element={
            <ProtectedRoute allowedRoles={["government"]}>
              <GovernmentProjectMonitoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="/government/universities"
          element={
            <ProtectedRoute allowedRoles={["government"]}>
              <GovernmentUniversities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/government/industry"
          element={
            <ProtectedRoute allowedRoles={["government"]}>
              <GovernmentIndustry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/government/analytics"
          element={
            <ProtectedRoute allowedRoles={["government"]}>
              <GovernmentAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/government/impact"
          element={
            <ProtectedRoute allowedRoles={["government"]}>
              <GovernmentImpact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/government/profile"
          element={
            <ProtectedRoute allowedRoles={["government"]}>
              <GovernmentProfile />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
