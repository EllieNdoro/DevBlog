import React, { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setMessage('Thank you for subscribing!');
      setEmail('');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <footer className="footer bg-dark text-light py-5 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-3 mb-4">
            <h5 className="mb-3">Section</h5>
            <ul className="list-unstyled footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/">Features</a></li>
              <li><a href="/">Pricing</a></li>
              <li><a href="/">FAQs</a></li>
              <li><a href="/">About</a></li>
            </ul>
          </div>

          <div className="col-md-6 mb-4">
          </div>

          <div className="col-md-3 mb-4">
            <h5 className="mb-3">Subscribe to our newsletter</h5>
            <p className="text-muted mb-3">Monthly digest of what's new and exciting from us.</p>
            <form onSubmit={handleSubscribe}>
              <div className="input-group mb-2">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button className="btn btn-primary" type="submit">
                  Subscribe
                </button>
              </div>
              {message && <small className="text-success">{message}</small>}
            </form>
          </div>
        </div>

        <hr className="my-4 border-secondary" />

        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0">© 2025 DevTalk Bloggers. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-light me-3">
              <i className="fab fa-instagram fa-lg"></i>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-light">
              <i className="fab fa-facebook fa-lg"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

