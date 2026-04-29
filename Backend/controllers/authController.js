const User = require('../models/userModel');
const academicModel = require('../models/academicModel');
const internalExtenalModel = require('../models/internalExtenalModel');
const unitTestModel = require('../models/unitTestModel');
const mongoose = require("mongoose");
const { hashPassword, comparePassword } = require('../helpers/authHelper');
const dotenv = require('dotenv');
dotenv.config();
const JWT = require("jsonwebtoken");

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).send({ success: false, message: "Email & Password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ success: false, message: "User not found" });

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(401).send({ success: false, message: "Invalid password" });

    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).send({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Login failed", error });
  }
};

const registerController = async (req, res) => {
  try {
    const { name, email, password,answer } = req.body;

    if (!name || !email || !password || !answer) {
      return res.status(400).send({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).send({ success: false, message: "User already exists" });

    const hashedPassword = await hashPassword(password);

    const user = new User({ name, email, password: hashedPassword ,answer});
    await user.save();

    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).send({
      success: true,
      message: "User registered successfully",
      user: { _id: user._id, name: user.name, email: user.email , role: user.role },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Registration failed", error });
  }
};

const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      res.status(400).send({ message: "email is required" });
    }
    if (!answer) {
      res.status(400).send({ message: "answer is required" });
    }
    if (!newPassword) {
      res.status(400).send({ message: "New Password is required" });
    }
    const user = await User.findOne({ email, answer });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong email Or Answer",
      });
    }
    const hashed = await hashPassword(newPassword);
    await User.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  }
  catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

 const updateController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedUser) return res.status(404).send({ success: false, message: "User not found" });

    res.status(200).send({
      success: true,
      message: "User updated successfully",
      updatedUser: { _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Update failed", error });
  }
};
const deleteController = async (req, res) => {
  try {
    const { type } = req.body;
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).send({ success: false, message: "User not found" });

    res.status(200).send({ success: true, message: "User deleted successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Delete failed", error });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User
      .find() 
      .sort({ name: 1 });
    res.status(200).send({
      success: true,
      message: "All users ",
      users
    });
  }
  catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Geting users",
      error,
    });
  }
};

 const getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    res.status(200).send({
      success: true,
      message: "Single user fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send({
      success: false,
      message: "Error while fetching user",
      error: error.message,
    });
  }
};


 const assignUserRoleController = async (req, res) => {
  try {
    const { userId } = req.params;    
    const { role } = req.body;      

   
    if (role !== 0 && role !== 1) {
      return res.status(400).send({
        success: false,
        message: "Invalid role. Role must be 0 or 1",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).send({
      success: true,
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in assigning role",
      error,
    });
  }
};

const getAllProjectsController = async (req, res) => {
  try {
  
    const [academicProjects, internalExternalProjects, unitTestProjects] = await Promise.all([
      academicModel.find({}),
      internalExtenalModel.find({}),
      unitTestModel.find({})
    ]);

    const allProjects = [
      ...academicProjects.map(p => ({ ...p._doc, projectCategory: "Academic" })),
      ...internalExternalProjects.map(p => ({ ...p._doc, projectCategory: "Internal-External" })),
      ...unitTestProjects.map(p => ({ ...p._doc, projectCategory: "Unit-Test" }))
    ];

    res.status(200).send({
      success: true,
      totalCount: allProjects.length,
      counts: {
        academic: academicProjects.length,
        internalExternal: internalExternalProjects.length,
        unitTest: unitTestProjects.length
      },
      projects: allProjects
    });

  } catch (error) {
    console.error("Error in fetching unified projects:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch all types of projects",
      error: error.message
    });
  }
};


module.exports = {
  loginController,
  registerController,
  updateController,
  deleteController,
  assignUserRoleController,
  getSingleUser,
  getAllUsers,
  getAllProjectsController,
  forgotPasswordController
};
