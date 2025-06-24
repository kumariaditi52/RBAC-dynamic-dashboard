const mongoose = require('mongoose');
const Role = require('./models/Role');
const Permission = require('./models/Permission');
const dotenv = require('dotenv');

dotenv.config();

const fixDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('DB_URL:', process.env.DB_URL);
    
    await mongoose.connect(process.env.DB_URL);
    console.log('✅ Connected to MongoDB successfully');

    // Check current roles
    console.log('\n=== CHECKING CURRENT ROLES ===');
    const existingRoles = await Role.find();
    console.log('Current roles count:', existingRoles.length);
    existingRoles.forEach(role => {
      console.log(`- ${role.name}: ${role._id}`);
    });

    // Delete all existing roles
    console.log('\n=== DELETING EXISTING ROLES ===');
    const deleteResult = await Role.deleteMany({});
    console.log('Deleted roles:', deleteResult.deletedCount);

    // Create new roles
    console.log('\n=== CREATING NEW ROLES ===');
    const newRoles = [
      { name: 'Admin', permissions: [] },
      { name: 'Editor', permissions: [] },
      { name: 'Viewer', permissions: [] }
    ];

    const createdRoles = await Role.insertMany(newRoles);
    console.log('✅ Created roles successfully:');
    createdRoles.forEach(role => {
      console.log(`- ${role.name}: ${role._id}`);
    });

    // Verify roles were created
    console.log('\n=== VERIFYING ROLES ===');
    const verifyRoles = await Role.find();
    console.log('Total roles in database:', verifyRoles.length);
    verifyRoles.forEach(role => {
      console.log(`✓ ${role.name}: ${role._id}`);
    });

    console.log('\n✅ Database setup completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.connection.close();
  }
};

fixDatabase();