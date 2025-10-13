const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');

// Customer Support routes
router.get('/tickets', auth, adminAuth, async (req, res) => {
  try {
    // Mock ticket data
    const tickets = [
      {
        id: 'TKT-001',
        title: 'Unable to purchase data bundle',
        description: 'Customer is having trouble purchasing MTN 1GB data bundle',
        customer: 'john.doe@example.com',
        status: 'open',
        priority: 'high',
        category: 'technical',
        assignedTo: 'Admin',
        createdAt: new Date(Date.now() - 2 * 86400000),
        updatedAt: new Date(Date.now() - 1 * 86400000),
        responseTime: 2.5,
        satisfaction: null
      },
      {
        id: 'TKT-002',
        title: 'Account verification issue',
        description: 'Customer cannot verify their account',
        customer: 'jane.smith@example.com',
        status: 'in_progress',
        priority: 'medium',
        category: 'account',
        assignedTo: 'Support Agent',
        createdAt: new Date(Date.now() - 1 * 86400000),
        updatedAt: new Date(Date.now() - 6 * 3600000),
        responseTime: 1.2,
        satisfaction: 4
      },
      {
        id: 'TKT-003',
        title: 'Refund request',
        description: 'Customer requesting refund for failed transaction',
        customer: 'bob.wilson@example.com',
        status: 'resolved',
        priority: 'low',
        category: 'billing',
        assignedTo: 'Admin',
        createdAt: new Date(Date.now() - 3 * 86400000),
        updatedAt: new Date(Date.now() - 12 * 3600000),
        responseTime: 0.8,
        satisfaction: 5
      }
    ];

    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('Tickets error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tickets'
    });
  }
});

router.get('/chat', auth, adminAuth, async (req, res) => {
  try {
    // Mock live chat data
    const chats = [
      {
        id: 'CHAT-001',
        customer: 'alice.brown@example.com',
        status: 'active',
        lastMessage: 'Hello, I need help with my order',
        lastActivity: new Date(Date.now() - 5 * 60 * 1000),
        messages: 12,
        agent: 'Support Agent'
      },
      {
        id: 'CHAT-002',
        customer: 'charlie.davis@example.com',
        status: 'waiting',
        lastMessage: 'How do I check my balance?',
        lastActivity: new Date(Date.now() - 15 * 60 * 1000),
        messages: 3,
        agent: null
      }
    ];

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat sessions'
    });
  }
});

router.get('/knowledge-base', auth, adminAuth, async (req, res) => {
  try {
    // Mock knowledge base data
    const articles = [
      {
        id: 'KB-001',
        title: 'How to purchase data bundles',
        content: 'Step-by-step guide for purchasing data bundles...',
        category: 'technical',
        views: 1250,
        helpful: 89,
        createdAt: new Date(Date.now() - 30 * 86400000),
        updatedAt: new Date(Date.now() - 7 * 86400000)
      },
      {
        id: 'KB-002',
        title: 'Account verification process',
        content: 'Complete guide for verifying your account...',
        category: 'account',
        views: 890,
        helpful: 76,
        createdAt: new Date(Date.now() - 25 * 86400000),
        updatedAt: new Date(Date.now() - 5 * 86400000)
      }
    ];

    res.json({
      success: true,
      data: articles
    });
  } catch (error) {
    console.error('Knowledge base error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch knowledge base articles'
    });
  }
});

router.get('/faq', auth, adminAuth, async (req, res) => {
  try {
    // Mock FAQ data
    const faqs = [
      {
        id: 'FAQ-001',
        question: 'How long does it take to receive data after purchase?',
        answer: 'Data is usually delivered within 5-10 minutes after successful payment.',
        category: 'delivery',
        views: 2100,
        helpful: 95
      },
      {
        id: 'FAQ-002',
        question: 'What payment methods do you accept?',
        answer: 'We accept mobile money, bank transfers, and credit cards.',
        category: 'payment',
        views: 1800,
        helpful: 88
      }
    ];

    res.json({
      success: true,
      data: faqs
    });
  } catch (error) {
    console.error('FAQ error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch FAQs'
    });
  }
});

router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    // Mock support statistics
    const stats = {
      totalTickets: 156,
      openTickets: 23,
      resolvedTickets: 133,
      avgResponseTime: 2.1,
      customerSatisfaction: 4.2,
      activeChats: 8,
      resolutionRate: 85,
      firstResponseTime: 2.1,
      topCategories: [
        { category: 'Technical Issues', count: 45, percentage: 35 },
        { category: 'Account Problems', count: 32, percentage: 25 },
        { category: 'Billing Questions', count: 28, percentage: 22 },
        { category: 'General Support', count: 23, percentage: 18 }
      ]
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Support stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch support statistics'
    });
  }
});

// Create new ticket
router.post('/tickets', auth, adminAuth, async (req, res) => {
  try {
    const { title, description, customer, priority, category } = req.body;
    
    // In real implementation, this would create a ticket in the database
    const newTicket = {
      id: `TKT-${Date.now()}`,
      title,
      description,
      customer,
      status: 'open',
      priority: priority || 'medium',
      category: category || 'general',
      assignedTo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      responseTime: 0,
      satisfaction: null
    };

    res.json({
      success: true,
      data: newTicket,
      message: 'Ticket created successfully'
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create ticket'
    });
  }
});

// Update ticket status
router.put('/tickets/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, priority } = req.body;
    
    // In real implementation, this would update the ticket in the database
    res.json({
      success: true,
      message: 'Ticket updated successfully'
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update ticket'
    });
  }
});

// Send chat message
router.post('/chat/:id/message', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    // In real implementation, this would save the message to the database
    const newMessage = {
      id: Date.now(),
      sender: 'admin',
      message,
      timestamp: new Date()
    };

    res.json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// Create FAQ
router.post('/faq', auth, adminAuth, async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    
    // In real implementation, this would create an FAQ in the database
    const newFaq = {
      id: `FAQ-${Date.now()}`,
      question,
      answer,
      category: category || 'general',
      views: 0,
      helpful: 0,
      createdAt: new Date()
    };

    res.json({
      success: true,
      data: newFaq,
      message: 'FAQ created successfully'
    });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create FAQ'
    });
  }
});

// Create knowledge base article
router.post('/knowledge-base', auth, adminAuth, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    // In real implementation, this would create an article in the database
    const newArticle = {
      id: `KB-${Date.now()}`,
      title,
      content,
      category: category || 'general',
      views: 0,
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.json({
      success: true,
      data: newArticle,
      message: 'Article created successfully'
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create article'
    });
  }
});

module.exports = router;
