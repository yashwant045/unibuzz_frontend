import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Events from "@/pages/Events";
import StudentProfile from "@/pages/StudentProfile";

import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import FacultyProfile from "@/pages/dashboard/FacultyProfile";
import MyEvents from "@/pages/dashboard/MyEvents";
import UpcomingEvents from "@/pages/dashboard/UpcomingEvents";
import Certificates from "@/pages/dashboard/Certificates";
import EventHistory from "@/pages/dashboard/EventHistory";
import CreateEvent from "@/pages/faculty/CreateEvent";
import StudentDashboard from "@/pages/student/StudentDashboard";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/events" element={<Events />} />

        {/* 🔒 Protected Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["STUDENT", "FACULTY"]}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        {/* 🔒 Dashboard Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["FACULTY", "STUDENT"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="student" element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="faculty" element={<FacultyProfile />} />
          <Route path="my-events" element={<MyEvents />} />
          <Route path="upcoming" element={<UpcomingEvents />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="history" element={<EventHistory />} />
          <Route path="create-event" element={<CreateEvent />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}