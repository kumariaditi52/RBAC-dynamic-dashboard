const mongoose = require('mongoose');
const Role = require('./models/Role');
const Permission = require('./models/Permission');
const dotenv = require('dotenv');

dotenv.config();

const resetRoles = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to MongoDB');

    // Delete all existing roles
    await Role.deleteMany({});
    console.log('Deleted all existing roles');

    // Create new roles with specific IDs (if you want to keep the hardcoded ones)
    const roles = [
      {
        _id: new mongoose.Types.ObjectId('67447ddd870d4b2714192657'),
        name: 'Admin',
        permissions: []
      },
      {
        _id: new mongoose.Types.ObjectId('67447ddd870d4b2714192658'),
        name: 'Editor', 
        permissions: []
      },
      {
        _id: new mongoose.Types.ObjectId('67447ddd870d4b2714192659'),
        name: 'Viewer',
        permissions: []
      }
    ];

    const createdRoles = await Role.insertMany(roles);
    console.log('Created roles:');
    createdRoles.forEach(role => {
      console.log(`${role.name}: ${role._id}`);
    });

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
};

resetRoles();