const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    await Task.updateMany({ assignedTo: user._id }, { assignedTo: null });

    await Project.updateMany(
      { "members.user": user._id }, 
      { $pull: { members: { user: user._id } } }
    );

    await Project.deleteMany({ members: { $size: 0 } });

    await user.deleteOne();
    
    res.json({ message: 'User and associated data updated/removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.seedAdmin = async (req, res) => {
  const seedToken = req.headers['x-seed-token'];
  if (!seedToken || seedToken !== process.env.SEED_TOKEN) {
    return res.status(403).json({ message: 'Forbidden: Invalid seed token' });
  }

  try {
    const adminEmail = process.env.SUPERADMIN_EMAIL;
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      await User.create({
        name: process.env.SUPERADMIN_NAME,
        email: adminEmail,
        password: process.env.SUPERADMIN_PASSWORD,
        isSuperAdmin: true,
      });
      res.status(201).json({ message: 'SuperAdmin created successfully!' });
    } else {
      res.status(400).json({ message: 'SuperAdmin already exists!' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
