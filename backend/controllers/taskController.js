const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getTasks = async (req, res) => {
  const projectId = req.query.project;
  try {
    let query = {};
    if (projectId) query.project = projectId;

    if (!req.user.isSuperAdmin) {
      // Validate access to project if filtering by project
      if (projectId) {
        const project = await Project.findById(projectId);
        if (!project || !project.members.some(m => m.user.toString() === req.user._id.toString())) {
          return res.status(403).json({ message: 'Access denied to this project tasks' });
        }
      }
    }

    const tasks = await Task.find(query).populate('project assignedTo', 'name title');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTask = async (req, res) => {
  const { title, description, dueDate, project, assignedTo } = req.body;
  try {
    const task = new Task({ title, description, dueDate, project, assignedTo });
    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    task.status = status || task.status;
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  const { title, description, assignedTo } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    // Auth Check
    if (!req.user.isSuperAdmin) {
      const project = await Project.findById(task.project);
      const isProjectAdmin = project && project.members.some(m => m.user.toString() === req.user._id.toString() && m.role === 'Admin');
      if (!isProjectAdmin) return res.status(403).json({ message: 'Not authorized to edit this task' });
    }

    task.title = title || task.title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    // Auth Check
    if (!req.user.isSuperAdmin) {
      const project = await Project.findById(task.project);
      const isProjectAdmin = project && project.members.some(m => m.user.toString() === req.user._id.toString() && m.role === 'Admin');
      if (!isProjectAdmin) return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
