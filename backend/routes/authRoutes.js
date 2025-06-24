const express = require('express');
const { loginUser, createUser } = require('../controllers/authController');
const Role = require('../models/Role');

const router = express.Router();

// POST /api/auth/signup - User signup
router.post('/signup', createUser);

// POST /api/auth/login - User login
router.post('/login', loginUser);

// GET /api/auth/setup-roles - Create default roles
router.get('/setup-roles', async (req, res) => {
  try {
    // Delete existing roles
    await Role.deleteMany({});
    
    // Create new roles
    const roles = [
      { name: 'Admin', permissions: [] },
      { name: 'Editor', permissions: [] },
      { name: 'Viewer', permissions: [] }
    ];

    const createdRoles = await Role.insertMany(roles);
    
    res.json({
      message: 'Roles created successfully',
      roles: createdRoles.map(role => ({
        name: role.name,
        id: role._id
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
