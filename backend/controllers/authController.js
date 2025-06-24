const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
const mongoose = require("mongoose");
const multiavatar = require("@multiavatar/multiavatar");

// Create User (Signup)
exports.createUser = async (req, res) => {
  console.log("=== SIGNUP REQUEST START ===");
  console.log("Request body:", req.body);
  
  const { username, email, password, role } = req.body;

  try {
    // Check if all fields are provided
    if (!username || !email || !password || !role) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log("All fields provided");
    console.log("Looking for role with ID:", role);

    // First, let's see all roles in database
    const allRoles = await Role.find();
    console.log("All roles in database:");
    allRoles.forEach(r => console.log(`- ${r.name}: ${r._id}`));

    // If no roles exist, create them
    if (allRoles.length === 0) {
      console.log("No roles found, creating default roles...");
      const defaultRoles = [
        { name: 'Admin', permissions: [] },
        { name: 'Editor', permissions: [] },
        { name: 'Viewer', permissions: [] }
      ];
      
      const createdRoles = await Role.insertMany(defaultRoles);
      console.log("Created default roles:");
      createdRoles.forEach(r => console.log(`- ${r.name}: ${r._id}`));
      
      // Update allRoles array
      allRoles.push(...createdRoles);
    }

    // Validate ObjectId format for role
    if (!mongoose.Types.ObjectId.isValid(role)) {
      console.log("Invalid role ID format:", role);
      return res.status(400).json({ 
        message: "Invalid role ID format",
        availableRoles: allRoles.map(r => ({ name: r.name, id: r._id }))
      });
    }

    console.log("Role ID format is valid");

    // Check if the role exists
    const userRole = await Role.findById(role);
    console.log("Role search result:", userRole);
    
    if (!userRole) {
      console.log("Role not found with ID:", role);
      console.log("Available role IDs:", allRoles.map(r => r._id.toString()));
      return res.status(400).json({ 
        message: "Role not found",
        requestedRoleId: role,
        availableRoles: allRoles.map(r => ({ name: r.name, id: r._id }))
      });
    }

    console.log("Role found:", userRole.name);

    // Check if email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      console.log("Email already exists:", email);
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check if username already exists
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      console.log("Username already exists:", username);
      return res.status(400).json({ message: "Username already exists" });
    }

    // Validate password length
    if (password.length < 6) {
      console.log("Password too short");
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    // Generate Avatar using multiavatar
    const avatar = multiavatar(username);
    console.log("Avatar generated for:", username);

    // Create new user with avatar
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      avatar,
    });

    // Save the user to the database
    await newUser.save();
    console.log("User saved to database:", newUser._id);

    // Create JWT token with the role name
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username, role: userRole.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("JWT token created successfully");
    console.log("=== SIGNUP REQUEST SUCCESS ===");

    res.status(201).json({
      message: "User created successfully",
      token: token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: userRole.name,
        avatar: newUser.avatar,
        status: newUser.status,
      },
    });
  } catch (err) {
    console.error("=== SIGNUP ERROR ===", err);
    res.status(500).json({ message: "Internal server error: " + err.message });
  }
};

// User Login
exports.loginUser = async (req, res) => {
  console.log("Login request received:", req.body);
  
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email }).populate('role');
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("User found:", user.username);

    // Check if the input password matches the stored hash
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    // If the password doesn't match
    if (!isPasswordCorrect) {
      console.log("Password incorrect for user:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("Password verified successfully");

    // Create and assign a JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Login successful for user:", user.username);

    // Send response with JWT token and user info
    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role._id, // Send role ID for frontend
        avatar: user.avatar,
        status: user.status,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error: " + err.message });
  }
};
