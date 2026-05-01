const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTaskStatus, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, projectAdminOrSuperAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTasks)
  .post(protect, projectAdminOrSuperAdmin, createTask);

router.route('/:id/status')
  .put(protect, updateTaskStatus); // Any member can update status (could refine to assignee/admin)

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;
