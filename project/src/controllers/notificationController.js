const Notification = require('../models/Notification');

// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ 
      userId,
      visible: true 
    }).sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Mark all notifications as read for a user
exports.markNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Error marking notifications as read' });
  }
};

// Toggle notification alerts
exports.toggleAlerts = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.sendAlerts = !notification.sendAlerts;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    console.error('Error toggling notification alerts:', error);
    res.status(500).json({ message: 'Error toggling notification alerts' });
  }
};

// Update notification visibility (soft delete)
exports.updateVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.visible = false;
    await notification.save();
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error updating notification visibility:', error);
    res.status(500).json({ message: 'Error updating notification visibility' });
  }
};

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();

    // Emit socket event for real-time updates
    req.app.get('io').to(notification.userId).emit('new_notification', notification);

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification' });
  }
}; 