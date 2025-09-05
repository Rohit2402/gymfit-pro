import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./client/pages/Home";
import Login from "./client/pages/Login";
import Register from "./client/pages/Register";
import DashboardPage from "./client/pages/DashboardPage";
import ContactUs from "./client/pages/ContactUs";
import WorkoutsPage from "./client/pages/WorkoutsPage";
import WorkoutDetailPage from "./client/pages/WorkoutDetailPage";
import ExercisesPage from "./client/pages/ExercisesPage";
import ExerciseDetailsPage from "./client/pages/ExerciseDetailsPage";
import ProfilePage from "./client/pages/ProfilePage";
import TrainerDashboard from "./client/pages/TrainerDashboard";
import ManageMembers from "./client/pages/ManageMembers";
import CreateWorkout from "./client/pages/CreateWorkout";
import CreateDietPlan from "./client/pages/CreateDietPlan";
import ForgotPassword from "./client/pages/ForgotPassword";
import ResetPassword from "./client/pages/ResetPassword";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/exercises/:id" element={<ExerciseDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Password Reset Routes */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Trainer Routes */}
          <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
          <Route path="/trainer/manage-members" element={<ManageMembers />} />
          <Route path="/trainer/create-workout" element={<CreateWorkout />} />
          <Route
            path="/trainer/create-diet-plan"
            element={<CreateDietPlan />}
          />

          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
