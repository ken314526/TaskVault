const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

exports.getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.isSuperAdmin && req.query.all === 'true') {
      projects = await Project.find().populate('members.user', 'name email');
    } else {
      projects = await Project.find({ 'members.user': req.user._id }).populate('members.user', 'name email');
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members.user', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!req.user.isSuperAdmin) {
      const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
      if (!isMember) return res.status(403).json({ message: 'Access denied' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProject = async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = new Project({
      name, 
      description,
      members: [{ user: req.user._id, role: 'Admin' }]
    });
    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    project.name = name || project.name;
    project.description = description || project.description;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMemberToProject = async (req, res) => {
  const { email, role } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User with this email not found' });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isAlreadyMember = project.members.some(m => m.user.toString() === user._id.toString());
    if (isAlreadyMember) return res.status(400).json({ message: 'User is already a member' });

    project.members.push({ user: user._id, role: role || 'Member' });
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeMemberFromProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Prevent removing the last admin unless SuperAdmin is forcing it (or handle gracefully)
    const memberIndex = project.members.findIndex(m => m.user.toString() === req.params.userId);
    if (memberIndex === -1) return res.status(404).json({ message: 'Member not found in project' });

    project.members.splice(memberIndex, 1);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMemberRole = async (req, res) => {
  const { role } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const member = project.members.find(m => m.user.toString() === req.params.userId);
    if (!member) return res.status(404).json({ message: 'Member not found in project' });

    member.role = role;
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Cascading: Delete all tasks associated with this project
    await Task.deleteMany({ project: project._id });

    await project.deleteOne();
    res.json({ message: 'Project and associated tasks removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
