const express = require("express");
const { handleProtectRoute } = require("../middleware/auth.middleware");
const {
  handleGetUsers,
  handleGetAllMessages,
  handleSendMessage,
  handleGetStarredUsers,
} = require("../controllers/message.controller");

const router = express.Router();

router.get("/users", handleProtectRoute, handleGetUsers);
router.get("/starred-users", handleProtectRoute, handleGetStarredUsers);
router.get("/:id", handleProtectRoute, handleGetAllMessages);

router.post("/send/:id", handleProtectRoute, handleSendMessage);

module.exports = router;
