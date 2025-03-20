const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Get all notifications for a user
router.get('/users/:userId/notifications', auth, async (req, res, next) => {
  try {
    console.log('Fetching notifications for user:', req.params.userId);
    await notificationController.getUserNotifications(req, res);
  } catch (error) {
    console.error('Error in notifications route:', error);
    next(error);
  }
});

// Mark all notifications as read for a user
router.put('/notifications/mark-read/:userId', auth, async (req, res, next) => {
  try {
    console.log('Marking notifications as read for user:', req.params.userId);
    await notificationController.markNotificationsAsRead(req, res);
  } catch (error) {
    console.error('Error in mark-read route:', error);
    next(error);
  }
});

// Toggle notification alerts
router.put('/notifications/:id/toggle-alerts', auth, async (req, res, next) => {
  try {
    console.log('Toggling alerts for notification:', req.params.id);
    await notificationController.toggleAlerts(req, res);
  } catch (error) {
    console.error('Error in toggle-alerts route:', error);
    next(error);
  }
});

// Update notification visibility (soft delete)
router.put('/notifications/:id', auth, async (req, res, next) => {
  try {
    console.log('Updating visibility for notification:', req.params.id);
    await notificationController.updateVisibility(req, res);
  } catch (error) {
    console.error('Error in update-visibility route:', error);
    next(error);
  }
});

// Create a new notification (internal use)
router.post('/notifications', auth, async (req, res, next) => {
  try {
    console.log('Creating new notification:', req.body);
    await notificationController.createNotification(req, res);
  } catch (error) {
    console.error('Error in create-notification route:', error);
    next(error);
  }
});

module.exports = router; 