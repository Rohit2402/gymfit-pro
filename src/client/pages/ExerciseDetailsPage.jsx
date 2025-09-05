import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Detailed exercise data - In production, this would come from your database
const exerciseDetailsData = {
  1: {
    id: 1,
    name: "Push-ups",
    category: "Chest",
    muscleGroups: ["Chest", "Shoulders", "Triceps", "Core"],
    difficulty: "Beginner",
    description:
      "Push-ups are a fundamental bodyweight exercise that builds upper body strength and endurance. They're perfect for beginners and can be modified to increase difficulty as you progress.",
    equipment: ["None"],
    instructions: [
      "Start in a plank position with your hands slightly wider than shoulder-width apart",
      "Keep your body in a straight line from head to heels",
      "Lower your body until your chest nearly touches the floor",
      "Push back up to the starting position, fully extending your arms",
      "Keep your core engaged throughout the movement",
      "Breathe in as you lower down, breathe out as you push up",
    ],
    tips: [
      "Keep your body straight - avoid sagging hips or raised buttocks",
      "Start with knee push-ups if standard push-ups are too difficult",
      "Focus on controlled movement rather than speed",
      "If you can't do a full push-up, try incline push-ups against a wall or bench",
    ],
    benefits: [
      "Builds chest, shoulder, and tricep strength",
      "Improves core stability",
      "Can be done anywhere with no equipment",
      "Great for functional strength development",
    ],
    variations: [
      "Knee Push-ups (easier)",
      "Incline Push-ups (easier)",
      "Diamond Push-ups (harder)",
      "Decline Push-ups (harder)",
      "One-arm Push-ups (advanced)",
    ],
    safetyTips: [
      "Warm up before exercising",
      "Stop if you feel sharp pain",
      "Maintain proper form throughout",
      "Progress gradually",
    ],
  },
  2: {
    id: 2,
    name: "Bench Press",
    category: "Chest",
    muscleGroups: ["Chest", "Shoulders", "Triceps"],
    difficulty: "Intermediate",
    description:
      "The bench press is a fundamental barbell exercise for building chest strength and mass. It's one of the three main powerlifting movements and excellent for upper body development.",
    equipment: ["Barbell", "Bench", "Weight Plates"],
    instructions: [
      "Lie flat on the bench with your feet firmly on the ground",
      "Grip the barbell slightly wider than shoulder-width",
      "Unrack the bar and position it over your chest",
      "Lower the bar to your chest with control",
      "Press the bar up explosively while maintaining form",
      "Keep your shoulder blades squeezed together",
      "Maintain a slight arch in your back",
    ],
    tips: [
      "Always use a spotter when lifting heavy weights",
      "Keep your feet planted on the ground",
      "Focus on squeezing your chest at the top",
      "Control the negative (lowering) portion",
    ],
    benefits: [
      "Builds significant chest strength and mass",
      "Improves pressing power",
      "Develops tricep and shoulder strength",
      "Functional movement for daily activities",
    ],
    variations: [
      "Incline Bench Press",
      "Decline Bench Press",
      "Dumbbell Bench Press",
      "Close-Grip Bench Press",
    ],
    safetyTips: [
      "Always use a spotter or safety bars",
      "Warm up thoroughly before heavy lifting",
      "Don't bounce the bar off your chest",
      "Use proper weight progression",
    ],
  },
  5: {
    id: 5,
    name: "Pull-ups",
    category: "Back",
    muscleGroups: ["Lats", "Rhomboids", "Biceps", "Rear Delts"],
    difficulty: "Intermediate",
    description:
      "Pull-ups are one of the best bodyweight exercises for building back strength and width. They target multiple muscle groups and are excellent for developing functional pulling strength.",
    equipment: ["Pull-up Bar"],
    instructions: [
      "Hang from a pull-up bar with an overhand grip, hands shoulder-width apart",
      "Start from a dead hang with arms fully extended",
      "Pull your body up until your chin clears the bar",
      "Lower yourself back down with control",
      "Keep your core engaged throughout the movement",
      "Avoid swinging or using momentum",
    ],
    tips: [
      "Focus on pulling with your back muscles, not just your arms",
      "Start with assisted pull-ups if you can't do a full one",
      "Keep your shoulders down and back",
      "Aim for full range of motion",
    ],
    benefits: [
      "Builds impressive back width and strength",
      "Improves grip strength",
      "Develops bicep and rear delt strength",
      "Excellent for functional pulling movements",
    ],
    variations: [
      "Assisted Pull-ups (easier)",
      "Chin-ups (slightly easier)",
      "Wide-Grip Pull-ups",
      "Weighted Pull-ups (advanced)",
      "L-sit Pull-ups (advanced)",
    ],
    safetyTips: [
      "Ensure the pull-up bar is secure",
      "Warm up your shoulders before starting",
      "Don't drop from the bar suddenly",
      "Progress gradually to avoid injury",
    ],
  },
  9: {
    id: 9,
    name: "Squats",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
    difficulty: "Intermediate",
    description:
      "Squats are the king of leg exercises, targeting multiple muscle groups simultaneously. They're essential for building lower body strength, power, and functional movement patterns.",
    equipment: ["Barbell", "Squat Rack"],
    instructions: [
      "Stand with feet shoulder-width apart under the barbell",
      "Unrack the bar and step back from the rack",
      "Keep your chest up and core engaged",
      "Initiate the movement by pushing your hips back",
      "Lower down as if sitting back into a chair",
      "Descend until your hip crease is below your knee",
      "Drive through your heels to return to standing",
    ],
    tips: [
      "Keep your knees in line with your toes",
      "Maintain a neutral spine throughout",
      "Focus on sitting back rather than down",
      "Keep your weight on your heels",
    ],
    benefits: [
      "Builds massive leg strength and power",
      "Improves core stability",
      "Enhances athletic performance",
      "Burns significant calories",
    ],
    variations: [
      "Bodyweight Squats (easier)",
      "Goblet Squats (easier)",
      "Front Squats",
      "Bulgarian Split Squats",
      "Jump Squats",
    ],
    safetyTips: [
      "Always use safety bars in a squat rack",
      "Warm up thoroughly",
      "Don't let your knees cave inward",
      "Use proper weight progression",
    ],
  },
  21: {
    id: 21,
    name: "Plank",
    category: "Abs",
    muscleGroups: ["Core", "Shoulders", "Glutes"],
    difficulty: "Beginner",
    description:
      "The plank is an isometric core exercise that builds stability and endurance. It's excellent for developing a strong foundation and can be performed anywhere.",
    equipment: ["None"],
    instructions: [
      "Start in a push-up position",
      "Lower down to your forearms",
      "Keep your body in a straight line from head to heels",
      "Engage your core muscles",
      "Hold this position while breathing normally",
      "Keep your hips level - don't let them sag or rise",
    ],
    tips: [
      "Focus on quality over duration",
      "Keep your breathing steady",
      "Engage your glutes to help maintain position",
      "Start with shorter holds and build up time",
    ],
    benefits: [
      "Builds core stability and strength",
      "Improves posture",
      "Reduces risk of back injury",
      "Can be done anywhere",
    ],
    variations: [
      "Knee Plank (easier)",
      "Wall Plank (easier)",
      "Side Plank",
      "Plank with Leg Lifts",
      "Plank to Push-up",
    ],
    safetyTips: [
      "Don't hold your breath",
      "Stop if you feel lower back pain",
      "Maintain proper form over duration",
      "Build up time gradually",
    ],
  },
};

const ExerciseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [activeTab, setActiveTab] = useState("instructions");

  useEffect(() => {
    const exerciseData = exerciseDetailsData[parseInt(id)];
    if (exerciseData) {
      setExercise(exerciseData);
    } else {
      // If exercise not found, redirect to exercises page
      navigate("/exercises");
    }
  }, [id, navigate]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Chest":
        return "from-red-400 to-red-600";
      case "Back":
        return "from-blue-400 to-blue-600";
      case "Legs":
        return "from-green-400 to-green-600";
      case "Arms":
        return "from-purple-400 to-purple-600";
      case "Shoulders":
        return "from-yellow-400 to-yellow-600";
      case "Abs":
        return "from-orange-400 to-orange-600";
      case "Cardio":
        return "from-pink-400 to-pink-600";
      case "Full Body":
        return "from-indigo-400 to-indigo-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercise...</p>
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
              to="/exercises"
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
              Back to Exercises
            </Link>
          </div>

          {/* Exercise Header */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div
              className={`relative h-64 bg-gradient-to-br ${getCategoryColor(
                exercise.category
              )}`}>
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center space-x-3 mb-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(
                      exercise.difficulty
                    )}`}>
                    {exercise.difficulty}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-90 text-gray-800">
                    {exercise.category}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {exercise.name}
                </h1>
                <p className="text-white text-opacity-90 text-lg">
                  Equipment: {exercise.equipment.join(", ")}
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-lg mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: "instructions", label: "Instructions" },
                  { id: "tips", label: "Tips & Form" },
                  { id: "benefits", label: "Benefits" },
                  { id: "variations", label: "Variations" },
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
              {/* Instructions Tab */}
              {activeTab === "instructions" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Description
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {exercise.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Target Muscles
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {exercise.muscleGroups.map((muscle, index) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {muscle}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Equipment Needed
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {exercise.equipment.map((item, index) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Step-by-Step Instructions
                    </h3>
                    <ol className="space-y-3">
                      {exercise.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-gray-700 leading-relaxed">
                            {instruction}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              {/* Tips Tab */}
              {activeTab === "tips" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Form Tips
                    </h3>
                    <ul className="space-y-3">
                      {exercise.tips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <svg
                            className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
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
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Safety Tips
                    </h3>
                    <ul className="space-y-3">
                      {exercise.safetyTips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <svg
                            className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Benefits Tab */}
              {activeTab === "benefits" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Exercise Benefits
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exercise.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-start p-4 bg-blue-50 rounded-lg">
                        <svg
                          className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Variations Tab */}
              {activeTab === "variations" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Exercise Variations
                  </h3>
                  <div className="space-y-3">
                    {exercise.variations.map((variation, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </div>
                        <span className="text-gray-700 font-medium">
                          {variation}
                        </span>
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
              Add to Workout
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

export default ExerciseDetailsPage;
