const { generateToken } = require("../lib/utils");
const cloudinary = require("../lib/cloudinary");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

const handleSignup = async (req, res) => {
  const { fullName, email, password } = req.body;

  console.log("req.body",req.body)
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const handleLogout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    res.status(200).json({ message: "Logout Successfully" });
  } catch (error) {
    console.log("Error while loging out", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const handleUpdateProfile = async (req, res) => {
  try {
    const { profilePic, fullName } = req.body;
    const userId = req.user._id;
    const updateFields = {};

    if (!profilePic && !fullName) {
      return res.status(400).json({ message: "Changes Required " });
    }

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateFields.profilePic = uploadResponse.secure_url;
    }

    if (fullName) {
      updateFields.fullName = fullName;
    }
    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    // ✅ Send success response
    return res
      .status(200)
      .json({ user: updatedUser, message: "Profile updated successfully" });
  } catch (error) {
    console.log("Error while updating user", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handleGetProfile = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error while updating user", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const handleAddStarredUser = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log("userId", userId);
    const { starredUserId } = req.body;

    if (!starredUserId) {
      return res.status(400).json({ message: "starredUserId is required" });
    }

    // Ensure both user IDs are different
    if (userId === starredUserId) {
      return res
        .status(400)
        .json({ message: "You cannot star your own account" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.starredUser.includes(starredUserId)) {
      return res.status(400).json({ message: "User already starred" });
    }

    console.log("starredUserId", starredUserId);

    user.starredUser.push(starredUserId);
    await user.save();

    res.status(200).json({
      message: "User added to starred list",
      starredUser: user.starredUser,
    });
  } catch (error) {
    console.log("Error while adding starred user:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const handleRemoveStarredUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { starredUserId } = req.body;

    if (!starredUserId) {
      return res.status(400).json({ message: "starredUserId is required" });
    }

    if (userId === starredUserId) {
      return res
        .status(400)
        .json({ message: "You cannot unstar your own account" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.starredUser.includes(starredUserId)) {
      return res.status(400).json({ message: "User not in starred list" });
    }

    // Remove the starred user ID
    user.starredUser = user.starredUser.filter(
      (id) => id.toString() !== starredUserId
    );

    await user.save();

    res.status(200).json({
      message: "User removed from starred list",
      starredUser: user.starredUser,
    });
  } catch (error) {
    console.error("Error while removing starred user:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  handleSignup,
  handleLogin,
  handleLogout,
  handleUpdateProfile,
  handleGetProfile,
  handleAddStarredUser,
  handleRemoveStarredUser,
};
