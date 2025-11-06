import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const PostForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    image: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { title, subtitle, content } = formData;

  useEffect(() => {
    if (isEditMode) {
      const fetchPost = async () => {
        try {
          const res = await axios.get(`/api/posts/${id}`);
          setFormData({
            title: res.data.title,
            subtitle: res.data.subtitle || '',
            content: res.data.content,
            image: null
          });
        } catch (err) {
          setError('Failed to load post');
        }
      };
      fetchPost();
    }
  }, [id, isEditMode]);

  const onChange = e => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to create a post');
      return;
    }
    
    setLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('title', title);
    formDataToSend.append('subtitle', subtitle);
    formDataToSend.append('content', content);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }
    
    try {
      if (isEditMode) {
        await axios.put(`/api/posts/${id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await axios.post('/api/posts', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} post`);
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h1 className="text-center mb-4">{isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title *</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={title}
                onChange={onChange}
                placeholder="Enter an engaging title for your blog post"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="subtitle" className="form-label">Subtitle (Optional)</label>
              <input
                type="text"
                className="form-control"
                id="subtitle"
                name="subtitle"
                value={subtitle}
                onChange={onChange}
                placeholder="Add a subtitle to provide more context"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="content" className="form-label">Content *</label>
              <textarea
                className="form-control"
                id="content"
                name="content"
                value={content}
                onChange={onChange}
                rows="12"
                placeholder="Write your blog post content here..."
                required
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="image" className="form-label">
                {isEditMode ? 'Change Image (Optional)' : 'Image (Optional)'}
              </label>
              <input
                type="file"
                className="form-control"
                id="image"
                name="image"
                onChange={onChange}
                accept="image/*"
              />
              <small className="form-text text-muted">
                Upload an image to make your post more engaging
              </small>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : (isEditMode ? 'Update Post' : 'Create Post')}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostForm;

