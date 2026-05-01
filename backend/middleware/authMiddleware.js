const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const superAdmin = (req, res, next) => {
  if (req.user && req.user.isSuperAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a SuperAdmin' });
  }
};

const projectAdminOrSuperAdmin = async (req, res, next) => {
  if (req.user && req.user.isSuperAdmin) {
    return next();
  }
  
  const projectId = req.params.projectId || req.params.id || req.body.project;
  if (!projectId) return res.status(400).json({ message: 'Project ID is required for authorization' });

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (member && member.role === 'Admin') {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized as Admin for this project' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { protect, superAdmin, projectAdminOrSuperAdmin };
