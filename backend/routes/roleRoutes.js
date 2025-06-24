const express = require('express');
const {
  createRole,
  getRole,
  updateRole,
  deleteRole,
} = require('../controllers/roleController');
const {
  authenticate,
  authorizePermission,
} = require('../middlewares/authMiddleware');
const Role = require('../models/Role');
const router = express.Router();

// GET /api/roles - Get all roles (PUBLIC - no authentication needed for signup)
router.get('/', async (req, res) => {
  try {
    console.log("Fetching all roles...");
    const roles = await Role.find().select('name _id'); // Only get name and _id
    console.log("Found roles:", roles);
    
    // If no roles exist, create default ones
    if (roles.length === 0) {
      console.log("No roles found, creating default roles...");
      const defaultRoles = [
        { name: 'Admin', permissions: [] },
        { name: 'Editor', permissions: [] },
        { name: 'Viewer', permissions: [] }
      ];
      
      const createdRoles = await Role.insertMany(defaultRoles);
      console.log("Created default roles:", createdRoles);
      
      return res.status(200).json(createdRoles.map(role => ({
        name: role.name,
        _id: role._id
      })));
    }
    
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/roles - Create role (Admin only)
router.post('/', authenticate, authorizePermission('67447ddd870d4b271419264e'), createRole); // Permission ID for "role:create"

// GET /api/roles/:id - View role (Viewer and above)
router.get('/:id', authenticate, authorizePermission('67447ddd870d4b2714192653'), getRole); // Permission ID for "role:read"

// PUT /api/roles/:id - Update role (Admin only)
router.put('/:id', authenticate, authorizePermission('67447ddd870d4b2714192654'), updateRole); // Permission ID for "role:update"

// DELETE /api/roles/:id - Delete role (Admin only)
router.delete('/:id', authenticate, authorizePermission('67447ddd870d4b2714192652'), deleteRole); // Permission ID for "role:delete"

module.exports = router;
