"use server";

import User from "../models/userModel";
import { connect } from "../mongodb/mongoose";

export const createOrUpdateUser = async (
  id, first_name, last_name, image_url, email, username
) => {
  try {
    await connect();
    console.log("Creating/Updating user:", { id, first_name, last_name, image_url, email, username });
    
    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $set: {
          firstName: first_name,
          lastName: last_name,
          image_url: image_url,
          email: email,
          userName: username,
        },
      },
      { new: true, upsert: true }
    );
    
    console.log("User after update:", user);
    return user;
  } catch (error) {
    console.error("Error creating or updating user:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await connect();
    const result = await User.findOneAndDelete({ clerkId: id });
    console.log("User deletion result:", result);
    return result;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};