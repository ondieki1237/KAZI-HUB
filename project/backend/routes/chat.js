router.get('/api/chats/conversations', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Verify that the requesting user matches the userId
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const conversations = await Conversation.find({
      $or: [
        { senderId: userId },
        { recipientId: userId }
      ]
    })
    .populate('jobId')
    .populate('senderId')
    .populate('recipientId')
    .sort('-updatedAt');

    // Ensure we're sending JSON
    res.setHeader('Content-Type', 'application/json');
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
}); 