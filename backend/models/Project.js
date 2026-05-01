const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['Admin', 'Member'], default: 'Member' }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  members: [memberSchema]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
