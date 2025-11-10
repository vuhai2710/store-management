// src/components/pages/BlogPage.js
import React from 'react';
import styles from '../../styles/styles';
import { blogs } from '../../data/data';

// Component NHẬN handleViewProductDetail (và các props chung khác)
const BlogPage = ({ setCurrentPage, handleViewProductDetail }) => (
  <section style={{ padding: '4rem 0' }}>
    <div style={styles.container}>
      <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '3rem' }}>Latest News & Blog</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
        {blogs.map(blog => (
          <div key={blog.id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ background: 'linear-gradient(135deg, #60a5fa, #a855f7)', height: '12rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem' }}>📰</div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.75rem' }}>
                <span>📅 {blog.date}</span>
                <span>💬 {blog.comments} Comments</span>
              </div>
              <h3 style={{ fontWeight: '600', color: '#212529', marginBottom: '0.75rem' }}>{blog.title}</h3>
              <p style={{ color: '#495057', fontSize: '0.875rem', marginBottom: '1rem' }}>{blog.excerpt}</p>
              <button 
                onClick={() => setCurrentPage('blog')} 
                style={{ color: '#007bff', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                READ MORE →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BlogPage;