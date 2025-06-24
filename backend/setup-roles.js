const mongoose = require('mongoose');
const Role = require('./models/Role');
const dotenv = require('dotenv');

dotenv.config();

const setupRoles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to MongoDB');

    // Check if roles already exist
    const existingRoles = await Role.find();
    console.log('Existing roles:', existingRoles);

    if (existingRoles.length === 0) {
      // Create basic roles
      const roles = [
        { name: 'Admin', permissions: [] },
        { name: 'Editor', permissions: [] },
        { name: 'Viewer', permissions: [] }
      ];

      const createdRoles = await Role.insertMany(roles);
      console.log('Created roles:', createdRoles);
    } else {
      console.log('Roles already exist');
    }

    // Display all roles with their IDs
    const allRoles = await Role.find();
    console.log('\n=== ALL ROLES ===');
    allRoles.forEach(role => {
      console.log(`${role.name}: ${role._id}`);
    });

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
};

setupRoles();