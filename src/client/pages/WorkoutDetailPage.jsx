import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Sample detailed workout data - In production, this would come from your database
const workoutDetailsData = {
  1: {
    id: 1,
    name: "Push Day Power",
    description:
      "Build upper body strength with compound pushing movements. This workout focuses on developing power and muscle mass in your chest, shoulders, and triceps through progressive overload and compound movements.",
    duration: 45,
    difficulty: "Intermediate",
    category: "Strength",
    muscleGroup: "Chest",
    image: "/api/placeholder/600/400",
    equipment: ["Barbell", "Dumbbells", "Bench", "Incline Bench"],
    targetMuscles: ["Chest", "Shoulders", "Triceps", "Core"],
    caloriesBurned: "300-400",
    exercises: [
      {
        name: "Barbell Bench Press",
        sets: 4,
        reps: "8-10",
        rest: "2-3 min",
        instructions: [
          "Lie flat on bench with feet firmly on the ground",
          "Grip the bar slightly wider than shoulder-width",
          "Lower the bar to your chest with control",
          "Press the bar up explosively while maintaining form",
          "Keep your core tight throughout the movement",
        ],
        tips: "Focus on squeezing your chest at the top of the movement",
      },
      {
        name: "Overhead Press",
        sets: 3,
        reps: "10-12",
        rest: "90 sec",
        instructions: [
          "Stand with feet shoulder-width apart",
          "Hold the bar at shoulder level with palms facing forward",
          "Press the bar straight up overhead",
          "Lower with control back to starting position",
          "Keep your core engaged throughout",
        ],
        tips: "Don't arch your back excessively during the press",
      },
      {
        name: "Incline Dumbbell Press",
        sets: 3,
        reps: "10-12",
        rest: "90 sec",
        instructions: [
          "Set bench to 30-45 degree incline",
          "Hold dumbbells at chest level",
          "Press dumbbells up and slightly inward",
          "Lower with control to starting position",
          "Maintain tension in your chest throughout",
        ],
        tips: "Focus on the upper chest contraction",
      },
      {
        name: "Dips",
        sets: 3,
        reps: "12-15",
        rest: "60 sec",
        instructions: [
          "Grip parallel bars with arms straight",
          "Lower your body by bending your elbows",
          "Descend until shoulders are below elbows",
          "Push back up to starting position",
          "Keep your body upright throughout",
        ],
        tips: "Lean slightly forward to target chest more",
      },
      {
        name: "Push-ups",
        sets: 2,
        reps: "15-20",
        rest: "45 sec",
        instructions: [
          "Start in plank position with hands under shoulders",
          "Lower your body until chest nearly touches ground",
          "Push back up to starting position",
          "Keep your body in straight line throughout",
          "Engage your core and glutes",
        ],
        tips: "Modify on knees if needed to maintain proper form",
      },
    ],
    warmUp: [
      "5 minutes light cardio (treadmill or bike)",
      "Arm circles - 10 forward, 10 backward",
      "Shoulder shrugs - 15 reps",
      "Push-ups - 10 easy reps",
      "Band pull-aparts - 15 reps",
    ],
    coolDown: [
      "Chest doorway stretch - 30 seconds each arm",
      "Shoulder cross-body stretch - 30 seconds each arm",
      "Tricep overhead stretch - 30 seconds each arm",
      "Cat-cow stretch - 10 reps",
      "Deep breathing - 2 minutes",
    ],
    notes: [
      "Focus on proper form over heavy weight",
      "Increase weight gradually as you get stronger",
      "Rest 48-72 hours before training chest again",
      "Stay hydrated throughout the workout",
      "Listen to your body and adjust intensity as needed",
    ],
  },
  2: {
    id: 2,
    name: "HIIT Cardio Blast",
    description:
      "High-intensity interval training designed to maximize calorie burn and improve cardiovascular fitness in minimal time.",
    duration: 30,
    difficulty: "Advanced",
    category: "Cardio",
    muscleGroup: "Full Body",
    image: "/api/placeholder/600/400",
    equipment: ["None"],
    targetMuscles: ["Full Body", "Cardiovascular System"],
    caloriesBurned: "250-350",
    exercises: [
      {
        name: "Burpees",
        sets: 4,
        reps: "30 sec work, 30 sec rest",
        rest: "30 sec",
        instructions: [
          "Start standing with feet shoulder-width apart",
          "Drop into squat position and place hands on ground",
          "Jump feet back into plank position",
          "Perform a push-up (optional)",
          "Jump feet back to squat position and jump up with arms overhead",
        ],
        tips: "Maintain steady pace, don't rush the movement",
      },
    ],
    warmUp: [
      "Marching in place - 2 minutes",
      "Arm swings - 30 seconds",
      "Leg swings - 30 seconds",
      "Jumping jacks - 30 seconds",
      "High knees - 30 seconds",
    ],
    coolDown: [
      "Walking in place - 3 minutes",
      "Forward fold stretch - 30 seconds",
      "Quad stretch - 30 seconds each leg",
      "Calf stretch - 30 seconds each leg",
      "Deep breathing - 2 minutes",
    ],
    notes: [
      "Work at 80-90% maximum effort during work intervals",
      "Use rest periods for active recovery",
      "Modify exercises if needed to maintain intensity",
      "Stay hydrated throughout",
      "Stop if you feel dizzy or unwell",
    ],
  },
  // Add more workout details as needed
};

const WorkoutDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [completedExercises, setCompletedExercises] = useState(new Set());

  useEffect(() => {
    const workoutData = workoutDetailsData[parseInt(id)];
    if (workoutData) {
      setWorkout(workoutData);
    } else {
      // If workout not found, redirect to workouts page
      navigate("/workouts");
    }
  }, [id, navigate]);

  const toggleExerciseComplete = (exerciseIndex) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(exerciseIndex)) {
      newCompleted.delete(exerciseIndex);
    } else {
      newCompleted.add(exerciseIndex);
    }
    setCompletedExercises(newCompleted);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!workout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              to="/workouts"
              className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium">
              <svg
                className="mr-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Workouts
            </Link>
          </div>

          {/* Workout Header */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="relative h-64 bg-gradient-to-br from-orange-400 to-red-500">
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center space-x-3 mb-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                      workout.difficulty
                    )}`}>
                    {workout.difficulty}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-90 text-gray-800">
                    {workout.duration} min
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-90 text-gray-800">
                    {workout.category}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {workout.name}
                </h1>
                <p className="text-white text-opacity-90 text-lg">
                  {workout.muscleGroup} • {workout.caloriesBurned} calories
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-lg mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "exercises", label: "Exercises" },
                  { id: "warmup", label: "Warm-up" },
                  { id: "cooldown", label: "Cool-down" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Description
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {workout.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Equipment Needed
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {workout.equipment.map((item, index) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Target Muscles
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {workout.targetMuscles.map((muscle, index) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {muscle}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {workout.notes && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Important Notes
                      </h3>
                      <ul className="space-y-2">
                        {workout.notes.map((note, index) => (
                          <li key={index} className="flex items-start">
                            <svg
                              className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-gray-600">{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Exercises Tab */}
              {activeTab === "exercises" && (
                <div className="space-y-6">
                  {workout.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {exercise.name}
                        </h3>
                        <button
                          onClick={() => toggleExerciseComplete(index)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            completedExercises.has(index)
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}>
                          {completedExercises.has(index)
                            ? "✓ Completed"
                            : "Mark Complete"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-900">
                            {exercise.sets}
                          </div>
                          <div className="text-sm text-gray-600">Sets</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-900">
                            {exercise.reps}
                          </div>
                          <div className="text-sm text-gray-600">Reps</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-900">
                            {exercise.rest}
                          </div>
                          <div className="text-sm text-gray-600">Rest</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Instructions:
                        </h4>
                        <ol className="list-decimal list-inside space-y-1">
                          {exercise.instructions.map((instruction, idx) => (
                            <li key={idx} className="text-gray-600">
                              {instruction}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {exercise.tips && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="flex items-start">
                            <svg
                              className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <div>
                              <div className="font-medium text-orange-800">
                                Pro Tip:
                              </div>
                              <div className="text-orange-700">
                                {exercise.tips}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Warm-up Tab */}
              {activeTab === "warmup" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Warm-up Routine
                  </h3>
                  <div className="space-y-3">
                    {workout.warmUp.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cool-down Tab */}
              {activeTab === "cooldown" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Cool-down Routine
                  </h3>
                  <div className="space-y-3">
                    {workout.coolDown.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg">
              Start Workout
            </button>
            <button className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold py-3 px-8 rounded-lg transition duration-300">
              Add to Favorites
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WorkoutDetailPage;
