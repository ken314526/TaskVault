const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, seedAdmin } = require('../controllers/userController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.post('/seed', seedAdmin);

router.route('/')
  .get(protect, superAdmin, getUsers);

router.route('/:id')
  .delete(protect, superAdmin, deleteUser);

module.exports = router;
