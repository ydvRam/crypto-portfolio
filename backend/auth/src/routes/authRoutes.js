const express = require("express");
const { registerUser, loginUser, getMe } = require("../controllers/authControllers");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validationMiddleware");
const { registerValidation, loginValidation } = require("../validations/authValidations");

const router = express.Router();

router.post("/register", validateRequest(registerValidation), registerUser);
router.post("/login", validateRequest(loginValidation), loginUser);
router.get("/me", protect, getMe);

module.exports = router;
