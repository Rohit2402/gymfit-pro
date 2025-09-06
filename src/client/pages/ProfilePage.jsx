import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  updateUserProfile,
  getUserProfile,
  uploadProfilePicture,
  getMemberAssignedTrainer,
} from "../../lib/supabase";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [assignedTrainer, setAssignedTrainer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    fitness_goals: "",
    specialization: "",
    bio: "",
    phone: "",
    emergency_contact: "",
    profile_picture_url: "",
  });

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);
    loadUserProfile(userData.id);

    // Load trainer info for members
    if (userData.role === "member") {
      loadAssignedTrainer(userData.id);
    }
  }, [navigate]);

  const loadUserProfile = async (userId) => {
    try {
      const profileData = await getUserProfile(userId);
      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || "",
          age: profileData.age || "",
          gender: profileData.gender || "",
          weight: profileData.weight || "",
          height: profileData.height || "",
          fitness_goals: profileData.fitness_goals || "",
          specialization: profileData.specialization || "",
          bio: profileData.bio || "",
          phone: profileData.phone || "",
          emergency_contact: profileData.emergency_contact || "",
          profile_picture_url: profileData.profile_picture_url || "",
        });
      } else {
        // Create default profile data from user
        setFormData((prev) => ({
          ...prev,
          full_name: user?.full_name || "",
        }));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedTrainer = async (memberId) => {
    try {
      const result = await getMemberAssignedTrainer(memberId);
      if (result.success) {
        setAssignedTrainer(result.data);
      }
    } catch (error) {
      console.error("Error loading assigned trainer:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For numeric fields, ensure only valid numbers or empty strings
    if (name === "age" || name === "weight" || name === "height") {
      if (value !== "" && isNaN(value)) {
        return; // Don't update if it's not a valid number
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Clean the form data - convert empty strings to null for numeric fields
      const cleanedData = {
        ...formData,
        age: formData.age === "" ? null : parseInt(formData.age) || null,
        weight:
          formData.weight === "" ? null : parseFloat(formData.weight) || null,
        height:
          formData.height === "" ? null : parseFloat(formData.height) || null,
      };

      const result = await updateUserProfile(user.id, cleanedData);
      if (result.success) {
        setProfile({ ...profile, ...cleanedData });
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert("Error updating profile: " + result.error);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const result = await uploadProfilePicture(user.id, file);
      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          profile_picture_url: result.url,
        }));
      } else {
        alert("Error uploading image: " + result.error);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Trainer":
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      case "Admin":
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Trainer":
        return "bg-blue-100 text-blue-800";
      case "Admin":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="relative h-32 bg-gradient-to-r from-orange-500 to-red-500">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>

            <div className="relative px-6 pb-6">
              {/* Profile Picture */}
              <div className="flex items-end -mt-16 mb-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-300 overflow-hidden">
                    {formData.profile_picture_url ? (
                      <img
                        src={formData.profile_picture_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg
                          className="h-16 w-16 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="absolute bottom-0 right-0">
                      <label className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full shadow-lg transition duration-300">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                        {uploadingImage ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                <div className="ml-6 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {formData.full_name ||
                          user?.full_name ||
                          "User Profile"}
                      </h1>
                      <div className="flex items-center mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                            user?.role
                          )}`}>
                          {getRoleIcon(user?.role)}
                          <span className="ml-1">{user?.role || "Member"}</span>
                        </span>
                        <span className="ml-3 text-gray-500">
                          {user?.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition duration-300">
                          Edit Profile
                        </button>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition duration-300">
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-300 disabled:opacity-50">
                            {saving ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      )}

                      <button
                        onClick={handleLogout}
                        className="border border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition duration-300">
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personal Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {formData.full_name || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        min="1"
                        max="120"
                        placeholder="Enter your age"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {formData.age || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    {isEditing ? (
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">
                        {formData.gender || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        min="1"
                        max="999"
                        step="0.1"
                        placeholder="Enter weight in kg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {formData.weight
                          ? `${formData.weight} kg`
                          : "Not specified"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height (cm)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        min="50"
                        max="300"
                        step="0.1"
                        placeholder="Enter height in cm"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {formData.height
                          ? `${formData.height} cm`
                          : "Not specified"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {formData.phone || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-900">
                      {formData.bio || "No bio added yet"}
                    </p>
                  )}
                </div>
              </div>

              {/* Role-Specific Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {user?.role === "Trainer"
                    ? "Professional Information"
                    : "Fitness Information"}
                </h2>

                {user?.role === "Trainer" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialization
                    </label>
                    {isEditing ? (
                      <select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                        <option value="">Select Specialization</option>
                        <option value="Strength Training">
                          Strength Training
                        </option>
                        <option value="Cardio Fitness">Cardio Fitness</option>
                        <option value="Yoga">Yoga</option>
                        <option value="Pilates">Pilates</option>
                        <option value="CrossFit">CrossFit</option>
                        <option value="Nutrition">Nutrition</option>
                        <option value="Weight Loss">Weight Loss</option>
                        <option value="Bodybuilding">Bodybuilding</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">
                        {formData.specialization || "Not specified"}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fitness Goals
                    </label>
                    {isEditing ? (
                      <select
                        name="fitness_goals"
                        value={formData.fitness_goals}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                        <option value="">Select Fitness Goal</option>
                        <option value="Weight Loss">Weight Loss</option>
                        <option value="Muscle Gain">Muscle Gain</option>
                        <option value="Strength Building">
                          Strength Building
                        </option>
                        <option value="Endurance">Endurance</option>
                        <option value="General Fitness">General Fitness</option>
                        <option value="Flexibility">Flexibility</option>
                        <option value="Sport Performance">
                          Sport Performance
                        </option>
                      </select>
                    ) : (
                      <p className="text-gray-900">
                        {formData.fitness_goals || "Not specified"}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleInputChange}
                      placeholder="Name and phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {formData.emergency_contact || "Not specified"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats and Quick Info */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "Recently"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Workouts Completed</span>
                    <span className="font-medium text-orange-600">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Streak</span>
                    <span className="font-medium text-green-600">5 days</span>
                  </div>
                  {formData.weight && formData.height && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">BMI</span>
                      <span className="font-medium">
                        {(
                          formData.weight / Math.pow(formData.height / 100, 2)
                        ).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Assigned Trainer (Members Only) */}
              {user?.role === "member" && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    My Trainer
                  </h3>

                  {assignedTrainer ? (
                    <div className="space-y-4">
                      {/* Trainer Profile */}
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {assignedTrainer.trainer.profile_picture_url ? (
                            <img
                              src={assignedTrainer.trainer.profile_picture_url}
                              alt={assignedTrainer.trainer.full_name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-orange-200"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-orange-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            {assignedTrainer.trainer.full_name}
                          </h4>
                          <p className="text-sm text-orange-600 font-medium">
                            Personal Trainer
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Assigned on{" "}
                            {new Date(
                              assignedTrainer.assigned_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Trainer Bio */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                          Your dedicated personal trainer is here to help you
                          achieve your fitness goals.
                        </p>
                      </div>

                      {/* Contact Information */}
                      <div className="border-t pt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-3">
                          Contact Information
                        </h5>
                        <div className="space-y-3">
                          {/* Email */}
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Email
                              </p>
                              <a
                                href={`mailto:${assignedTrainer.trainer.email}`}
                                className="text-sm text-orange-600 hover:text-orange-700 transition duration-300">
                                {assignedTrainer.trainer.email}
                              </a>
                            </div>
                          </div>

                          {/* Phone - Static for now */}
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Phone
                              </p>
                              <p className="text-sm text-gray-600">
                                Contact via email for phone number
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Contact Actions */}
                      <div className="border-t pt-4">
                        <div className="grid grid-cols-2 gap-3">
                          <a
                            href={`mailto:${assignedTrainer.trainer.email}?subject=Training Question`}
                            className="flex items-center justify-center px-4 py-2 border border-orange-300 rounded-md text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 transition duration-300">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            Send Email
                          </a>
                          <a
                            href={`mailto:${assignedTrainer.trainer.email}?subject=Phone Number Request`}
                            className="flex items-center justify-center px-4 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 transition duration-300">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            Request Phone
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* No Trainer Assigned */
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No Trainer Assigned
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        You haven't been assigned a trainer yet. Contact support
                        for assistance.
                      </p>
                      <a
                        href="mailto:support@gymfit.com"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transition duration-300">
                        Contact Support
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">
                      Completed Push Day Power
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">
                      Updated profile picture
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">
                      Set new fitness goal
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/workouts")}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition duration-300">
                    Browse Workouts
                  </button>
                  <button
                    onClick={() => navigate("/exercises")}
                    className="w-full border border-orange-500 text-orange-500 hover:bg-orange-50 py-2 px-4 rounded-lg transition duration-300">
                    Exercise Library
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg transition duration-300">
                    Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;
