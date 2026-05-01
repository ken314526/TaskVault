const express = require('express');
const router = express.Router();
const { 
  getProjects, 
  createProject, 
  getProjectById, 
  updateProject,
  deleteProject,
  addMemberToProject,
  removeMemberFromProject,
  updateMemberRole
} = require('../controllers/projectController');
const { protect, projectAdminOrSuperAdmin, superAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, projectAdminOrSuperAdmin, updateProject)
  .delete(protect, superAdmin, deleteProject);

router.route('/:id/members')
  .post(protect, projectAdminOrSuperAdmin, addMemberToProject);

router.route('/:id/members/:userId')
  .delete(protect, projectAdminOrSuperAdmin, removeMemberFromProject)
  .put(protect, projectAdminOrSuperAdmin, updateMemberRole);

module.exports = router;
