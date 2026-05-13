const { sendCircularNotification } = require('../utils/emailService');
const Circular = require('../models/Circular');
const User = require('../models/User');

const createCircular = async (req, res) => {
  try {
    const circularData = {
      ...req.body,
      created_by: req.user.id
    };
    if (req.file) {
      circularData.file_path = `/uploads/${req.file.filename}`;
    }

    const circularId = await Circular.createCircular(circularData);

    const users = await User.getAllUsers();
    await sendCircularNotification(users, {
      ...circularData,
      id: circularId
    });

    res.status(201).json({
      success: true,
      message: 'Circular created successfully',
      data: { id: circularId }
    });
  } catch (error) {
    console.error('createCircular error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAllCirculars = async (req, res) => {
  try {
    const circulars = await Circular.getAllCirculars();
    res.json({ success: true, data: circulars });
  } catch (error) {
    console.error('getAllCirculars error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAllArchivedCirculars = async (req, res) => {
  try {
    const circulars = await Circular.getArchivedCirculars();
    res.json({ success: true, data: circulars });
  } catch (error) {
    console.error('getAllArchivedCirculars error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getHiddenCirculars = async (req, res) => {
  try {
    const circulars = await Circular.getHiddenCirculars();
    res.json({ success: true, data: circulars });
  } catch (error) {
    console.error('getHiddenCirculars error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getCircularById = async (req, res) => {
  try {
    const circular = await Circular.getCircularById(req.params.id);
    if (!circular) {
      return res.status(404).json({ success: false, message: 'Circular not found' });
    }
    res.json({ success: true, data: circular });
  } catch (error) {
    console.error('getCircularById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteCircular = async (req, res) => {
  try {
    const deleted = await Circular.deleteCircular(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Circular not found' });
    }
    res.json({ success: true, message: 'Circular deleted successfully' });
  } catch (error) {
    console.error('deleteCircular error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const archiveCircular = async (req, res) => {
  try {
    await Circular.archiveCircular(req.params.id);
    res.json({ success: true, message: 'Circular archived successfully' });
  } catch (error) {
    console.error('archiveCircular error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const hideCircular = async (req, res) => {
  try {
    await Circular.hideCircular(req.params.id);
    res.json({ success: true, message: 'Circular hidden successfully' });
  } catch (error) {
    console.error('hideCircular error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const restoreCircular = async (req, res) => {
  try {
    await Circular.restoreCircular(req.params.id);
    res.json({ success: true, message: 'Circular restored successfully' });
  } catch (error) {
    console.error('restoreCircular error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const markCircularViewed = async (req, res) => {
  try {
    await Circular.markAsViewed(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getUserViewStats = async (req, res) => {
  try {
    const stats = await Circular.getCircularViewStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateCircular = async (req, res) => {
  try {
    await Circular.updateCircular(req.params.id, req.body);
    res.json({ success: true, message: 'Circular updated successfully' });
  } catch (error) {
    console.error('updateCircular error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createCircular,
  getAllCirculars,
  getAllArchivedCirculars,
  getHiddenCirculars,
  getCircularById,
  deleteCircular,
  archiveCircular,
  hideCircular,
  restoreCircular,
  markCircularViewed,
  getUserViewStats,
  updateCircular
};