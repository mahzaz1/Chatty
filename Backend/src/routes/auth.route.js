const express = require("express");
const {
  handleSignup,
  handleLogin,
  handleLogout,
  handleUpdateProfile,
  handleGetProfile,
  handleAddStarredUser,
  handleRemoveStarredUser,
} = require("../controllers/auth.controller");
const { handleProtectRoute } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/signup", handleSignup);

router.post("/login", handleLogin);

router.post("/logout", handleLogout);

router.put("/update-profile", handleProtectRoute, handleUpdateProfile);

router.get("/get-profile", handleProtectRoute, handleGetProfile);
router.post("/add-user-to-starred", handleProtectRoute, handleAddStarredUser);
router.post(
  "/remove-user-from-starred",
  handleProtectRoute,
  handleRemoveStarredUser
);

module.exports = router;
