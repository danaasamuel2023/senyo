const express = require('express');
const router = express.Router();
const { authMiddleware, adminAuth } = require('../middleware/unified-auth');

// Content Management routes
router.get('/pages', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock page data
    const pages = [
      {
        id: 'PAGE-001',
        title: 'Home Page',
        slug: 'home',
        status: 'published',
        lastModified: new Date(Date.now() - 2 * 86400000),
        views: 12500,
        author: 'Admin User',
        category: 'main',
        seoTitle: 'Best Data Bundles in Ghana',
        seoDescription: 'Get the best mobile data bundles at affordable prices'
      },
      {
        id: 'PAGE-002',
        title: 'About Us',
        slug: 'about',
        status: 'published',
        lastModified: new Date(Date.now() - 7 * 86400000),
        views: 3200,
        author: 'Admin User',
        category: 'company',
        seoTitle: 'About Senyo Data',
        seoDescription: 'Learn about our mission to provide affordable data solutions'
      },
      {
        id: 'PAGE-003',
        title: 'Terms of Service',
        slug: 'terms',
        status: 'draft',
        lastModified: new Date(Date.now() - 1 * 86400000),
        views: 0,
        author: 'Admin User',
        category: 'legal',
        seoTitle: 'Terms of Service',
        seoDescription: 'Our terms and conditions for using our services'
      }
    ];

    res.json({
      success: true,
      data: pages
    });
  } catch (error) {
    console.error('Pages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pages'
    });
  }
});

router.get('/blog', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock blog data
    const blogPosts = [
      {
        id: 'BLOG-001',
        title: 'How to Choose the Right Data Bundle',
        slug: 'choose-right-data-bundle',
        status: 'published',
        category: 'tips',
        tags: ['data', 'mobile', 'tips'],
        author: 'Admin User',
        publishedDate: new Date(Date.now() - 5 * 86400000),
        views: 8500,
        likes: 125,
        comments: 23,
        featured: true,
        excerpt: 'Learn how to select the perfect data bundle for your needs'
      },
      {
        id: 'BLOG-002',
        title: 'New MTN Data Plans Available',
        slug: 'new-mtn-data-plans',
        status: 'published',
        category: 'news',
        tags: ['mtn', 'data', 'plans'],
        author: 'Admin User',
        publishedDate: new Date(Date.now() - 3 * 86400000),
        views: 6200,
        likes: 89,
        comments: 15,
        featured: false,
        excerpt: 'Check out the latest MTN data bundle offerings'
      },
      {
        id: 'BLOG-003',
        title: 'Understanding Data Usage',
        slug: 'understanding-data-usage',
        status: 'draft',
        category: 'education',
        tags: ['data', 'usage', 'guide'],
        author: 'Admin User',
        publishedDate: null,
        views: 0,
        likes: 0,
        comments: 0,
        featured: false,
        excerpt: 'A comprehensive guide to understanding how data is consumed'
      }
    ];

    res.json({
      success: true,
      data: blogPosts
    });
  } catch (error) {
    console.error('Blog error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog posts'
    });
  }
});

router.get('/media', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock media data
    const media = [
      {
        id: 'MEDIA-001',
        filename: 'hero-banner.jpg',
        originalName: 'hero-banner.jpg',
        type: 'image',
        size: 245760,
        url: '/uploads/hero-banner.jpg',
        uploadedDate: new Date(Date.now() - 10 * 86400000),
        uploadedBy: 'Admin User',
        alt: 'Hero banner for homepage',
        dimensions: '1920x1080'
      },
      {
        id: 'MEDIA-002',
        filename: 'mtn-logo.png',
        originalName: 'mtn-logo.png',
        type: 'image',
        size: 15680,
        url: '/uploads/mtn-logo.png',
        uploadedDate: new Date(Date.now() - 5 * 86400000),
        uploadedBy: 'Admin User',
        alt: 'MTN Logo',
        dimensions: '300x200'
      },
      {
        id: 'MEDIA-003',
        filename: 'data-guide.pdf',
        originalName: 'data-guide.pdf',
        type: 'document',
        size: 1024000,
        url: '/uploads/data-guide.pdf',
        uploadedDate: new Date(Date.now() - 2 * 86400000),
        uploadedBy: 'Admin User',
        alt: 'Data Usage Guide PDF',
        dimensions: null
      }
    ];

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('Media error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch media files'
    });
  }
});

router.get('/categories', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock categories data
    const categories = [
      {
        id: 'CAT-001',
        name: 'Tips & Guides',
        slug: 'tips-guides',
        description: 'Helpful tips and guides for users',
        postCount: 15,
        color: '#3B82F6',
        createdAt: new Date(Date.now() - 30 * 86400000)
      },
      {
        id: 'CAT-002',
        name: 'News & Updates',
        slug: 'news-updates',
        description: 'Latest news and updates',
        postCount: 8,
        color: '#10B981',
        createdAt: new Date(Date.now() - 25 * 86400000)
      },
      {
        id: 'CAT-003',
        name: 'Product Reviews',
        slug: 'product-reviews',
        description: 'Reviews of data bundles and services',
        postCount: 12,
        color: '#F59E0B',
        createdAt: new Date(Date.now() - 20 * 86400000)
      }
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

router.get('/analytics', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock content analytics data
    const analytics = [
      {
        metric: 'Total Page Views',
        value: 45000,
        change: 12.5,
        trend: 'up'
      },
      {
        metric: 'Blog Post Views',
        value: 18500,
        change: 8.3,
        trend: 'up'
      },
      {
        metric: 'Average Time on Page',
        value: 3.2,
        change: -2.1,
        trend: 'down'
      },
      {
        metric: 'Bounce Rate',
        value: 45.2,
        change: -5.8,
        trend: 'down'
      }
    ];

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Content analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content analytics'
    });
  }
});

router.get('/stats', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock content statistics
    const stats = {
      totalPages: 25,
      publishedPages: 20,
      draftPages: 5,
      totalBlogPosts: 45,
      publishedPosts: 38,
      draftPosts: 7,
      totalMedia: 150,
      totalCategories: 8,
      totalViews: 45000,
      totalComments: 1250,
      avgTimeOnPage: 3.2,
      bounceRate: 45.2
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Content stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content statistics'
    });
  }
});

// Create new page
router.post('/pages', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { title, slug, content, status, category, seoTitle, seoDescription } = req.body;
    
    // In real implementation, this would create a page in the database
    const newPage = {
      id: `PAGE-${Date.now()}`,
      title,
      slug,
      content,
      status: status || 'draft',
      category,
      seoTitle,
      seoDescription,
      views: 0,
      author: 'Admin User',
      lastModified: new Date(),
      createdAt: new Date()
    };

    res.json({
      success: true,
      data: newPage,
      message: 'Page created successfully'
    });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create page'
    });
  }
});

// Update page
router.put('/pages/:id', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status, seoTitle, seoDescription } = req.body;
    
    // In real implementation, this would update the page in the database
    res.json({
      success: true,
      message: 'Page updated successfully'
    });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update page'
    });
  }
});

// Create blog post
router.post('/blog', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { title, slug, content, category, tags, status, featured, excerpt } = req.body;
    
    // In real implementation, this would create a blog post in the database
    const newPost = {
      id: `BLOG-${Date.now()}`,
      title,
      slug,
      content,
      category,
      tags: tags || [],
      status: status || 'draft',
      featured: featured || false,
      excerpt,
      author: 'Admin User',
      publishedDate: status === 'published' ? new Date() : null,
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: new Date()
    };

    res.json({
      success: true,
      data: newPost,
      message: 'Blog post created successfully'
    });
  } catch (error) {
    console.error('Create blog post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create blog post'
    });
  }
});

// Update blog post
router.put('/blog/:id', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status, featured, tags } = req.body;
    
    // In real implementation, this would update the blog post in the database
    res.json({
      success: true,
      message: 'Blog post updated successfully'
    });
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update blog post'
    });
  }
});

// Create category
router.post('/categories', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { name, slug, description, color } = req.body;
    
    // In real implementation, this would create a category in the database
    const newCategory = {
      id: `CAT-${Date.now()}`,
      name,
      slug,
      description,
      color: color || '#3B82F6',
      postCount: 0,
      createdAt: new Date()
    };

    res.json({
      success: true,
      data: newCategory,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create category'
    });
  }
});

// Upload media
router.post('/media/upload', authMiddleware, adminAuth, async (req, res) => {
  try {
    // In real implementation, this would handle file upload
    const { filename, originalName, type, size, alt } = req.body;
    
    const newMedia = {
      id: `MEDIA-${Date.now()}`,
      filename,
      originalName,
      type,
      size,
      url: `/uploads/${filename}`,
      uploadedDate: new Date(),
      uploadedBy: 'Admin User',
      alt,
      dimensions: type === 'image' ? '1920x1080' : null
    };

    res.json({
      success: true,
      data: newMedia,
      message: 'Media uploaded successfully'
    });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload media'
    });
  }
});

module.exports = router;
