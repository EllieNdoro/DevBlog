const express = require('express');
const router = express.Router();
const multer = require('multer');
const BlogPost = require('../models/BlogPost');
const auth = require('../middleware/auth');

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await BlogPost.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .select('-image.data'); // Exclude image data from list view for performance
    
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate('author', 'username')
      .select('-image.data'); // Exclude image data, use separate endpoint
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get post image
router.get('/:id/image', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id).select('image');
    
    if (!post || !post.image || !post.image.data) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    res.set('Content-Type', post.image.contentType);
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.send(post.image.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, content } = req.body;
    
    const postData = {
      title,
      subtitle,
      content,
      author: req.user.id
    };

    // Store image in MongoDB if uploaded
    if (req.file) {
      postData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
      // Set imageUrl to point to our image endpoint
      postData.imageUrl = `/api/posts/${null}/image`; // Will be updated after save
    }
    
    const post = new BlogPost(postData);
    await post.save();

    // Update imageUrl with actual post ID
    if (req.file) {
      post.imageUrl = `/api/posts/${post._id}/image`;
      await post.save();
    }
    
    // Return post without image data
    const postResponse = await BlogPost.findById(post._id)
      .populate('author', 'username')
      .select('-image.data');
    
    res.status(201).json(postResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, content } = req.body;
    
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    post.title = title;
    post.subtitle = subtitle;
    post.content = content;
    
    // Update image if new one uploaded
    if (req.file) {
      post.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
      post.imageUrl = `/api/posts/${post._id}/image`;
    }
    
    await post.save();
    
    // Return post without image data
    const postResponse = await BlogPost.findById(post._id)
      .populate('author', 'username')
      .select('-image.data');
    
    res.json(postResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await post.deleteOne();
    
    res.json({ message: 'Post removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
