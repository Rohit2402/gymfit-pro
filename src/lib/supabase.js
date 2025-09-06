import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://aikezfsbhhpsgzbncsxd.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpa2V6ZnNiaGhwc2d6Ym5jc3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjA4MjgsImV4cCI6MjA3MjI5NjgyOH0.D1JYmrXeJtiQiVBMdd-q_dpM6nOVaFJq47VJR4_LqHw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to register a new user
export const registerUser = async (userData) => {
  try {
    // Insert user data into the users table
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          full_name: userData.fullName,
          email: userData.email,
          password: userData.password, // Note: In production, password should be hashed
          role: userData.role,
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    // If the user is a member, automatically assign them to a trainer
    if (userData.role === "member" && data && data.length > 0) {
      const newUserId = data[0].id;
      console.log(
        `🔄 Attempting to assign member ${newUserId} to a trainer...`
      );

      try {
        // Get trainer with least members (respecting 15-member limit)
        const trainerResult = await getTrainerWithLeastMembers();
        console.log("🔍 Trainer search result:", trainerResult);

        if (trainerResult.success && trainerResult.data) {
          console.log(
            `✅ Found available trainer: ${trainerResult.data.full_name} (ID: ${trainerResult.data.id})`
          );

          // Assign member to trainer
          const assignResult = await assignMemberToTrainer(
            newUserId,
            trainerResult.data.id
          );
          console.log("🔗 Assignment result:", assignResult);

          if (assignResult.success) {
            console.log(
              `✅ SUCCESS: Member ${newUserId} assigned to trainer ${trainerResult.data.full_name} (ID: ${trainerResult.data.id})`
            );
            console.log(
              `📊 Trainer now has ${
                trainerResult.data.memberCount + 1
              }/15 members`
            );

            // Add success message to return data
            data[0].assignmentMessage = `Successfully assigned to trainer: ${trainerResult.data.full_name}`;
          } else {
            console.error(
              "❌ Failed to assign member to trainer:",
              assignResult.error
            );
            data[0].assignmentMessage = `Failed to assign trainer: ${assignResult.error}`;
          }
        } else {
          console.warn(
            "⚠️ No trainers available for assignment:",
            trainerResult.error
          );
          data[0].assignmentMessage = `No trainers available: ${trainerResult.error}`;
        }
      } catch (assignmentError) {
        console.error("💥 Error during trainer assignment:", assignmentError);
        data[0].assignmentMessage = `Assignment error: ${assignmentError.message}`;
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to check if email already exists
export const checkEmailExists = async (email) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error
      throw error;
    }

    return data !== null;
  } catch (error) {
    console.error("Email check error:", error);
    return false;
  }
};

// Helper function to login user
export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password) // Note: In production, use proper password hashing
      .single();

    if (error) {
      throw error;
    }

    return { success: true, user: data };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Invalid credentials" };
  }
};

// Helper function to get user profile
export const getUserProfile = async (userId) => {
  try {
    // Get user data from users table (includes profile_picture_url)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, full_name, email, role, profile_picture_url")
      .eq("id", parseInt(userId))
      .single();

    if (userError) {
      throw userError;
    }

    // Try to get additional profile data from profiles table if it exists
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", parseInt(userId))
      .single();

    // Combine user data with profile data (profiles table data takes precedence)
    const combinedData = {
      ...userData,
      ...(profileData || {}),
      user_id: userData.id, // Ensure user_id is set for compatibility
    };

    return combinedData;
  } catch (error) {
    console.error("Profile fetch error:", error);
    return null;
  }
};

// Helper function to update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userIdInt = parseInt(userId);

    // Clean the profile data - convert empty strings to null for constrained fields
    const cleanedProfileData = {
      ...profileData,
      // Convert empty strings to null for fields with constraints
      gender: profileData.gender === "" ? null : profileData.gender,
      full_name: profileData.full_name === "" ? null : profileData.full_name,
      bio: profileData.bio === "" ? null : profileData.bio,
      phone: profileData.phone === "" ? null : profileData.phone,
      emergency_contact:
        profileData.emergency_contact === ""
          ? null
          : profileData.emergency_contact,
      fitness_goals:
        profileData.fitness_goals === "" ? null : profileData.fitness_goals,
      specialization:
        profileData.specialization === "" ? null : profileData.specialization,
      profile_picture_url:
        profileData.profile_picture_url === ""
          ? null
          : profileData.profile_picture_url,
    };

    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userIdInt)
      .single();

    let result;

    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from("profiles")
        .update({
          ...cleanedProfileData,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userIdInt)
        .select();
    } else {
      // Insert new profile
      result = await supabase
        .from("profiles")
        .insert([
          {
            user_id: userIdInt,
            ...cleanedProfileData,
            updated_at: new Date().toISOString(),
          },
        ])
        .select();
    }

    if (result.error) {
      throw result.error;
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to upload profile picture
export const uploadProfilePicture = async (userId, file) => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-pictures")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Update user profile with new image URL directly in users table
    const { error: updateError } = await supabase
      .from("users")
      .update({
        profile_picture_url: publicUrl,
      })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Image upload error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to get all trainers
export const getAllTrainers = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("role", "trainer");

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get trainers error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to get trainer with least members (max 15 members per trainer)
export const getTrainerWithLeastMembers = async () => {
  try {
    // Get all trainers
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("role", "trainer");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return { success: false, error: "No trainers available" };
    }

    // Get member counts for each trainer
    const trainersWithCounts = await Promise.all(
      data.map(async (trainer) => {
        const { data: memberMappings, error: countError } = await supabase
          .from("member_trainer_mapping")
          .select("id")
          .eq("trainer_id", trainer.id)
          .eq("status", "active");

        if (countError) {
          console.error(
            "Error counting members for trainer:",
            trainer.id,
            countError
          );
          return { ...trainer, memberCount: 0 };
        }

        return { ...trainer, memberCount: memberMappings?.length || 0 };
      })
    );

    // Filter trainers who have less than 15 members
    const availableTrainers = trainersWithCounts.filter(
      (trainer) => trainer.memberCount < 15
    );

    if (availableTrainers.length === 0) {
      return {
        success: false,
        error: "All trainers have reached their maximum capacity (15 members)",
      };
    }

    // Find trainer with least members among available trainers
    const trainerWithLeastMembers = availableTrainers.reduce(
      (prev, current) => {
        return current.memberCount < prev.memberCount ? current : prev;
      }
    );

    return { success: true, data: trainerWithLeastMembers };
  } catch (error) {
    console.error("Get trainer with least members error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to assign member to trainer
export const assignMemberToTrainer = async (memberId, trainerId) => {
  try {
    const { data, error } = await supabase
      .from("member_trainer_mapping")
      .insert([
        {
          member_id: parseInt(memberId),
          trainer_id: parseInt(trainerId),
          status: "active",
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Assign member to trainer error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to get members assigned to a trainer with progress
export const getTrainerMembers = async (trainerId) => {
  try {
    const { data, error } = await supabase
      .from("member_trainer_mapping")
      .select(
        `
        id,
        assigned_at,
        status,
        notes,
        member:member_id (
          id,
          full_name,
          email,
          created_at
        )
      `
      )
      .eq("trainer_id", parseInt(trainerId))
      .eq("status", "active");

    if (error) {
      throw error;
    }

    // Get progress data for each member
    const membersWithProgress = await Promise.all(
      data.map(async (memberMapping) => {
        const { data: progressData, error: progressError } = await supabase
          .from("member_progress")
          .select("*")
          .eq("member_id", memberMapping.member.id)
          .eq("trainer_id", parseInt(trainerId))
          .order("workout_date", { ascending: false })
          .limit(10); // Get last 10 workouts

        if (progressError) {
          console.error(
            "Error fetching progress for member:",
            memberMapping.member.id,
            progressError
          );
        }

        // Calculate progress stats
        const totalWorkouts = progressData?.length || 0;
        const totalCalories =
          progressData?.reduce((sum, p) => sum + (p.calories_burned || 0), 0) ||
          0;
        const totalMinutes =
          progressData?.reduce(
            (sum, p) => sum + (p.duration_minutes || 0),
            0
          ) || 0;
        const averageRating =
          progressData?.length > 0
            ? progressData.reduce((sum, p) => sum + (p.rating || 0), 0) /
              progressData.length
            : 0;

        // Get last workout date
        const lastWorkoutDate = progressData?.[0]?.workout_date || null;

        return {
          ...memberMapping,
          progress: {
            totalWorkouts,
            totalCalories,
            totalMinutes,
            averageRating: Math.round(averageRating * 10) / 10,
            lastWorkoutDate,
            recentWorkouts: progressData || [],
          },
        };
      })
    );

    return { success: true, data: membersWithProgress };
  } catch (error) {
    console.error("Get trainer members error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to add member progress
export const addMemberProgress = async (progressData) => {
  try {
    const { data, error } = await supabase
      .from("member_progress")
      .insert([
        {
          member_id: parseInt(progressData.memberId),
          trainer_id: parseInt(progressData.trainerId),
          workout_date: progressData.workoutDate,
          workout_type: progressData.workoutType,
          duration_minutes: progressData.durationMinutes,
          calories_burned: progressData.caloriesBurned,
          notes: progressData.notes,
          rating: progressData.rating,
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Add member progress error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to get member progress summary
export const getMemberProgressSummary = async (memberId, trainerId) => {
  try {
    const { data, error } = await supabase
      .from("member_progress")
      .select("*")
      .eq("member_id", parseInt(memberId))
      .eq("trainer_id", parseInt(trainerId))
      .order("workout_date", { ascending: false });

    if (error) {
      throw error;
    }

    // Calculate summary stats
    const totalWorkouts = data.length;
    const totalCalories = data.reduce(
      (sum, p) => sum + (p.calories_burned || 0),
      0
    );
    const totalMinutes = data.reduce(
      (sum, p) => sum + (p.duration_minutes || 0),
      0
    );
    const averageRating =
      data.length > 0
        ? data.reduce((sum, p) => sum + (p.rating || 0), 0) / data.length
        : 0;

    // Get workout frequency (workouts per week)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentWorkouts = data.filter(
      (p) => new Date(p.workout_date) > thirtyDaysAgo
    );
    const workoutsPerWeek = (recentWorkouts.length / 4.3).toFixed(1); // 4.3 weeks in a month

    return {
      success: true,
      data: {
        totalWorkouts,
        totalCalories,
        totalMinutes,
        averageRating: Math.round(averageRating * 10) / 10,
        workoutsPerWeek: parseFloat(workoutsPerWeek),
        recentWorkouts: data.slice(0, 10), // Last 10 workouts
        lastWorkoutDate: data[0]?.workout_date || null,
      },
    };
  } catch (error) {
    console.error("Get member progress summary error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to send password reset email
export const sendPasswordResetEmail = async (email) => {
  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return {
        success: false,
        error: "No account found with this email address",
      };
    }

    // Generate reset token (in production, use a more secure method)
    const resetToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Store reset token in database
    const { error: tokenError } = await supabase
      .from("password_reset_tokens")
      .insert([
        {
          user_id: user.id,
          email: user.email,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
          used: false,
        },
      ]);

    if (tokenError) {
      console.error("Token storage error:", tokenError);
      return { success: false, error: "Failed to generate reset token" };
    }

    // In a real application, you would send an email here
    // For now, we'll simulate it by logging the reset link
    const resetLink = `${
      window.location.origin
    }/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    console.log("🔐 Password Reset Link (check console):", resetLink);
    console.log("📧 In production, this would be sent via email to:", email);

    // Simulate email sending success
    return {
      success: true,
      message: "Password reset instructions sent to your email",
      resetLink, // Remove this in production
    };
  } catch (error) {
    console.error("Send password reset email error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to verify reset token
export const verifyResetToken = async (token, email) => {
  try {
    const { data, error } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .eq("email", email)
      .eq("used", false)
      .single();

    if (error || !data) {
      return { success: false, error: "Invalid or expired reset token" };
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    if (now > expiresAt) {
      return { success: false, error: "Reset token has expired" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Verify reset token error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to reset password
export const resetPassword = async (token, email, newPassword) => {
  try {
    // Verify token first
    const tokenResult = await verifyResetToken(token, email);
    if (!tokenResult.success) {
      return tokenResult;
    }

    // Get user ID from token data
    const userId = tokenResult.data.user_id;

    // Update user password
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: newPassword }) // In production, hash the password
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    // Mark token as used
    const { error: tokenUpdateError } = await supabase
      .from("password_reset_tokens")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("token", token);

    if (tokenUpdateError) {
      console.error("Token update error:", tokenUpdateError);
      // Don't fail the request if token update fails
    }

    return { success: true, message: "Password reset successfully" };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to create a new workout
export const createWorkout = async (workoutData) => {
  try {
    // Insert workout
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .insert([
        {
          trainer_id: parseInt(workoutData.trainerId),
          name: workoutData.name,
          description: workoutData.description,
          category: workoutData.category,
          difficulty_level: workoutData.difficultyLevel,
          duration_minutes: workoutData.durationMinutes,
          target_muscle_groups: workoutData.targetMuscleGroups,
          equipment_needed: workoutData.equipmentNeeded,
          is_public: workoutData.isPublic || false,
        },
      ])
      .select()
      .single();

    if (workoutError) {
      throw workoutError;
    }

    // Insert exercises
    if (workoutData.exercises && workoutData.exercises.length > 0) {
      const exercisesData = workoutData.exercises.map((exercise, index) => ({
        workout_id: workout.id,
        exercise_name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight_kg: exercise.weight || null,
        rest_seconds: exercise.restSeconds || null,
        instructions: exercise.instructions || null,
        order_index: index + 1,
      }));

      const { error: exercisesError } = await supabase
        .from("workout_exercises")
        .insert(exercisesData);

      if (exercisesError) {
        // If exercises fail, delete the workout
        await supabase.from("workouts").delete().eq("id", workout.id);
        throw exercisesError;
      }
    }

    return { success: true, data: workout };
  } catch (error) {
    console.error("Create workout error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to get trainer's workouts
export const getTrainerWorkouts = async (trainerId) => {
  try {
    const { data, error } = await supabase
      .from("workouts")
      .select(
        `
        *,
        workout_exercises (
          id,
          exercise_name,
          sets,
          reps,
          weight_kg,
          rest_seconds,
          instructions,
          order_index
        )
      `
      )
      .eq("trainer_id", parseInt(trainerId))
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get trainer workouts error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to assign workout to member
export const assignWorkoutToMember = async (assignmentData) => {
  try {
    const { data, error } = await supabase
      .from("workout_assignments")
      .insert([
        {
          workout_id: parseInt(assignmentData.workoutId),
          member_id: parseInt(assignmentData.memberId),
          trainer_id: parseInt(assignmentData.trainerId),
          start_date: assignmentData.startDate,
          end_date: assignmentData.endDate,
          notes: assignmentData.notes,
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Assign workout error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to get workout details
export const getWorkoutDetails = async (workoutId) => {
  try {
    const { data, error } = await supabase
      .from("workouts")
      .select(
        `
        *,
        workout_exercises (
          id,
          exercise_name,
          sets,
          reps,
          weight_kg,
          rest_seconds,
          instructions,
          order_index
        ),
        trainer:trainer_id (
          id,
          full_name,
          email
        )
      `
      )
      .eq("id", parseInt(workoutId))
      .single();

    if (error) {
      throw error;
    }

    // Sort exercises by order
    if (data.workout_exercises) {
      data.workout_exercises.sort((a, b) => a.order_index - b.order_index);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get workout details error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to get trainer's members for workout assignment
export const getTrainerMembersForAssignment = async (trainerId) => {
  try {
    const { data, error } = await supabase
      .from("member_trainer_mapping")
      .select(
        `
        id,
        member_id,
        status,
        member:member_id (
          id,
          full_name,
          email
        )
      `
      )
      .eq("trainer_id", parseInt(trainerId))
      .eq("status", "active")
      .order("assigned_at", { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get trainer members for assignment error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to assign workout to multiple members
export const assignWorkoutToMembers = async (
  workoutId,
  memberIds,
  trainerId,
  assignmentData = {}
) => {
  try {
    const assignments = memberIds.map((memberId) => ({
      workout_id: parseInt(workoutId),
      member_id: parseInt(memberId),
      trainer_id: parseInt(trainerId),
      start_date:
        assignmentData.startDate || new Date().toISOString().split("T")[0],
      end_date: assignmentData.endDate || null,
      notes: assignmentData.notes || null,
      status: "active",
    }));

    const { data, error } = await supabase
      .from("workout_assignments")
      .insert(assignments).select(`
        *,
        member:member_id (
          id,
          full_name,
          email
        ),
        workout:workout_id (
          id,
          name
        )
      `);

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Assign workout to members error:", error);
    return { success: false, error: error.message };
  }
};

// ==================== DIET PLAN FUNCTIONS ====================

// Helper function to create a new diet plan
export const createDietPlan = async (dietPlanData) => {
  try {
    // Insert diet plan
    const { data: dietPlan, error: dietPlanError } = await supabase
      .from("diet_plans")
      .insert([
        {
          trainer_id: parseInt(dietPlanData.trainerId),
          name: dietPlanData.name,
          description: dietPlanData.description,
          plan_type: dietPlanData.planType,
          duration_days: dietPlanData.durationDays,
          target_calories_per_day: dietPlanData.targetCalories,
          target_protein_grams: dietPlanData.targetProtein,
          target_carbs_grams: dietPlanData.targetCarbs,
          target_fat_grams: dietPlanData.targetFat,
          dietary_restrictions: dietPlanData.dietaryRestrictions,
          meal_count_per_day: dietPlanData.mealCount,
          is_public: dietPlanData.isPublic || false,
        },
      ])
      .select()
      .single();

    if (dietPlanError) {
      throw dietPlanError;
    }

    // Insert meals
    if (dietPlanData.meals && dietPlanData.meals.length > 0) {
      const mealsData = dietPlanData.meals.map((meal, index) => ({
        diet_plan_id: dietPlan.id,
        meal_name: meal.name,
        meal_type: meal.type,
        meal_time: meal.time,
        instructions: meal.instructions,
        total_calories: meal.totalCalories || null,
        order_index: index + 1,
      }));

      const { data: meals, error: mealsError } = await supabase
        .from("diet_plan_meals")
        .insert(mealsData)
        .select();

      if (mealsError) {
        // If meals fail, delete the diet plan
        await supabase.from("diet_plans").delete().eq("id", dietPlan.id);
        throw mealsError;
      }

      // Insert foods for each meal
      for (let i = 0; i < meals.length; i++) {
        const meal = meals[i];
        const mealData = dietPlanData.meals[i];

        if (mealData.foods && mealData.foods.length > 0) {
          const foodsData = mealData.foods.map((food, foodIndex) => ({
            meal_id: meal.id,
            food_name: food.name,
            quantity: food.quantity,
            unit: food.unit,
            calories_per_serving: food.calories || null,
            protein_grams: food.protein || null,
            carbs_grams: food.carbs || null,
            fat_grams: food.fat || null,
            notes: food.notes || null,
            order_index: foodIndex + 1,
          }));

          const { error: foodsError } = await supabase
            .from("diet_plan_foods")
            .insert(foodsData);

          if (foodsError) {
            // If foods fail, delete the diet plan
            await supabase.from("diet_plans").delete().eq("id", dietPlan.id);
            throw foodsError;
          }
        }
      }
    }

    return { success: true, data: dietPlan };
  } catch (error) {
    console.error("Create diet plan error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to get trainer's diet plans
export const getTrainerDietPlans = async (trainerId) => {
  try {
    const { data, error } = await supabase
      .from("diet_plans")
      .select(
        `
        *,
        diet_plan_meals (
          id,
          meal_name,
          meal_type,
          meal_time,
          instructions,
          total_calories,
          order_index,
          diet_plan_foods (
            id,
            food_name,
            quantity,
            unit,
            calories_per_serving,
            protein_grams,
            carbs_grams,
            fat_grams,
            notes,
            order_index
          )
        )
      `
      )
      .eq("trainer_id", parseInt(trainerId))
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Sort meals and foods by order
    data.forEach((plan) => {
      if (plan.diet_plan_meals) {
        plan.diet_plan_meals.sort((a, b) => a.order_index - b.order_index);
        plan.diet_plan_meals.forEach((meal) => {
          if (meal.diet_plan_foods) {
            meal.diet_plan_foods.sort((a, b) => a.order_index - b.order_index);
          }
        });
      }
    });

    return { success: true, data };
  } catch (error) {
    console.error("Get trainer diet plans error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to assign diet plan to members
export const assignDietPlanToMembers = async (
  dietPlanId,
  memberIds,
  trainerId,
  assignmentData = {}
) => {
  try {
    const assignments = memberIds.map((memberId) => ({
      diet_plan_id: parseInt(dietPlanId),
      member_id: parseInt(memberId),
      trainer_id: parseInt(trainerId),
      start_date:
        assignmentData.startDate || new Date().toISOString().split("T")[0],
      end_date: assignmentData.endDate || null,
      notes: assignmentData.notes || null,
      custom_calories: assignmentData.customCalories || null,
      status: "active",
    }));

    const { data, error } = await supabase
      .from("diet_plan_assignments")
      .insert(assignments).select(`
        *,
        member:member_id (
          id,
          full_name,
          email
        ),
        diet_plan:diet_plan_id (
          id,
          name
        )
      `);

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Assign diet plan to members error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to get diet plan details
export const getDietPlanDetails = async (dietPlanId) => {
  try {
    const { data, error } = await supabase
      .from("diet_plans")
      .select(
        `
        *,
        diet_plan_meals (
          id,
          meal_name,
          meal_type,
          meal_time,
          instructions,
          total_calories,
          order_index,
          diet_plan_foods (
            id,
            food_name,
            quantity,
            unit,
            calories_per_serving,
            protein_grams,
            carbs_grams,
            fat_grams,
            notes,
            order_index
          )
        ),
        trainer:trainer_id (
          id,
          full_name,
          email
        )
      `
      )
      .eq("id", parseInt(dietPlanId))
      .single();

    if (error) {
      throw error;
    }

    // Sort meals and foods by order
    if (data.diet_plan_meals) {
      data.diet_plan_meals.sort((a, b) => a.order_index - b.order_index);
      data.diet_plan_meals.forEach((meal) => {
        if (meal.diet_plan_foods) {
          meal.diet_plan_foods.sort((a, b) => a.order_index - b.order_index);
        }
      });
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get diet plan details error:", error);
    return { success: false, error: error.message };
  }
};

// ==================== MEMBER WORKOUT FUNCTIONS ====================

// Helper function to get member's assigned workouts
export const getMemberAssignedWorkouts = async (memberId) => {
  try {
    const { data, error } = await supabase
      .from("workout_assignments")
      .select(
        `
        *,
        workout:workout_id (
          id,
          name,
          description,
          category,
          difficulty_level,
          duration_minutes,
          target_muscle_groups,
          equipment_needed,
          workout_exercises (
            id,
            exercise_name,
            sets,
            reps,
            weight_kg,
            rest_seconds,
            instructions,
            order_index
          )
        ),
        trainer:trainer_id (
          id,
          full_name,
          email
        )
      `
      )
      .eq("member_id", parseInt(memberId))
      .eq("status", "active")
      .order("assigned_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Sort exercises by order for each workout
    data.forEach((assignment) => {
      if (assignment.workout && assignment.workout.workout_exercises) {
        assignment.workout.workout_exercises.sort(
          (a, b) => a.order_index - b.order_index
        );
      }
    });

    return { success: true, data };
  } catch (error) {
    console.error("Get member assigned workouts error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to get specific workout details for member
export const getMemberWorkoutDetails = async (workoutId, memberId) => {
  try {
    // First check if this workout is assigned to the member
    const { data: assignment, error: assignmentError } = await supabase
      .from("workout_assignments")
      .select("*")
      .eq("workout_id", parseInt(workoutId))
      .eq("member_id", parseInt(memberId))
      .eq("status", "active")
      .single();

    if (assignmentError || !assignment) {
      return { success: false, error: "Workout not assigned to this member" };
    }

    // Get full workout details
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .select(
        `
        *,
        workout_exercises (
          id,
          exercise_name,
          sets,
          reps,
          weight_kg,
          rest_seconds,
          instructions,
          order_index
        ),
        trainer:trainer_id (
          id,
          full_name,
          email
        )
      `
      )
      .eq("id", parseInt(workoutId))
      .single();

    if (workoutError) {
      throw workoutError;
    }

    // Sort exercises by order
    if (workout.workout_exercises) {
      workout.workout_exercises.sort((a, b) => a.order_index - b.order_index);
    }

    // Add assignment details
    workout.assignment = assignment;

    return { success: true, data: workout };
  } catch (error) {
    console.error("Get member workout details error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to mark workout as completed by member
export const completeWorkout = async (
  workoutId,
  memberId,
  completionData = {}
) => {
  try {
    // Add to member progress
    const { error: progressError } = await supabase
      .from("member_progress")
      .insert([
        {
          member_id: parseInt(memberId),
          trainer_id: completionData.trainerId,
          workout_name: completionData.workoutName,
          calories_burned: completionData.caloriesBurned || null,
          duration_minutes: completionData.durationMinutes || null,
          workout_rating: completionData.rating || null,
          notes: completionData.notes || null,
          workout_date: new Date().toISOString().split("T")[0],
        },
      ]);

    if (progressError) {
      throw progressError;
    }

    return { success: true, message: "Workout completed successfully!" };
  } catch (error) {
    console.error("Complete workout error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to assign trainers to existing members who don't have one
export const assignTrainersToExistingMembers = async () => {
  try {
    console.log("🔄 Starting bulk trainer assignment for existing members...");

    // Get all members who don't have an active trainer assignment
    const { data: membersWithoutTrainers, error: membersError } = await supabase
      .from("users")
      .select(
        `
        id,
        full_name,
        email,
        member_trainer_mapping!inner(id, status)
      `
      )
      .eq("role", "member")
      .not("member_trainer_mapping.status", "eq", "active");

    if (membersError) {
      console.error("Error fetching members without trainers:", membersError);

      // Alternative query - get all members and check assignments separately
      const { data: allMembers, error: allMembersError } = await supabase
        .from("users")
        .select("id, full_name, email")
        .eq("role", "member");

      if (allMembersError) {
        throw allMembersError;
      }

      // Check each member for existing assignments
      const membersNeedingTrainers = [];
      for (const member of allMembers) {
        const { data: existingAssignment } = await supabase
          .from("member_trainer_mapping")
          .select("id")
          .eq("member_id", member.id)
          .eq("status", "active")
          .single();

        if (!existingAssignment) {
          membersNeedingTrainers.push(member);
        }
      }

      console.log(
        `📊 Found ${membersNeedingTrainers.length} members without trainers`
      );

      // Assign trainers to members who need them
      const results = [];
      for (const member of membersNeedingTrainers) {
        console.log(
          `🔄 Assigning trainer to member: ${member.full_name} (ID: ${member.id})`
        );

        const trainerResult = await getTrainerWithLeastMembers();
        if (trainerResult.success && trainerResult.data) {
          const assignResult = await assignMemberToTrainer(
            member.id,
            trainerResult.data.id
          );
          if (assignResult.success) {
            console.log(
              `✅ Assigned ${member.full_name} to trainer ${trainerResult.data.full_name}`
            );
            results.push({
              member: member.full_name,
              trainer: trainerResult.data.full_name,
              success: true,
            });
          } else {
            console.error(
              `❌ Failed to assign ${member.full_name}:`,
              assignResult.error
            );
            results.push({
              member: member.full_name,
              success: false,
              error: assignResult.error,
            });
          }
        } else {
          console.warn(`⚠️ No trainers available for ${member.full_name}`);
          results.push({
            member: member.full_name,
            success: false,
            error: "No trainers available",
          });
        }
      }

      return { success: true, data: results };
    }

    return { success: true, data: [] };
  } catch (error) {
    console.error("Bulk trainer assignment error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to get member's assigned trainer details
export const getMemberAssignedTrainer = async (memberId) => {
  try {
    const { data, error } = await supabase
      .from("member_trainer_mapping")
      .select(
        `
        id,
        assigned_at,
        status,
        trainer:trainer_id (
          id,
          full_name,
          email,
          profile_picture_url
        )
      `
      )
      .eq("member_id", parseInt(memberId))
      .eq("status", "active")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No trainer assigned
        return { success: true, data: null };
      }
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get member assigned trainer error:", error);
    return { success: false, error: error.message };
  }
};
