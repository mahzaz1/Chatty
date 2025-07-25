const User = require("../models/user.model");
const Message = require("../models/message.model");
const cloudinary = require("../lib/cloudinary");
const { getReceiverSocketId, io } = require("../lib/socket");

const handleGetUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const handleGetAllMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
  }
};

const handleSendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleGetStarredUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const currentUser = await User.findById(loggedInUserId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const starredUserIds = currentUser.starredUser;

    const starredUsers = await User.find({
      _id: { $in: starredUserIds },
    }).select("-password");

    res.status(200).json(starredUsers);
  } catch (error) {
    console.error("Error while getting starred users:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  handleGetUsers,
  handleGetAllMessages,
  handleSendMessage,
  handleGetStarredUsers,
};
