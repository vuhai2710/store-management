// src/components/pages/BlogPage.js
import React from 'react';
import styles from '../../styles/styles';
import { blogs } from '../../data/data';

// Component NHẬN handleViewProductDetail (và các props chung khác)
const BlogPage = ({ setCurrentPage, handleViewProductDetail }) => (
  <section style={{ padding: '4rem 0', backgroundColor: '#F8FAFC' }}>
    <div style={styles.container}>
      <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '3rem' }}>Latest News & Blog</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
        {blogs.map(blog => (
          <div key={blog.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px rgba(15,23,42,0.06)' }}>
            <div style={{ background: 'linear-gradient(135deg, #2563EB, #1E293B)', height: '12rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem' }}>📰</div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.75rem' }}>
                <span>📅 {blog.date}</span>
                <span>💬 {blog.comments} Comments</span>
              </div>
              <h3 style={{ fontWeight: '600', color: '#212529', marginBottom: '0.75rem' }}>{blog.title}</h3>
              <p style={{ color: '#495057', fontSize: '0.875rem', marginBottom: '1rem' }}>{blog.excerpt}</p>
              <button 
                onClick={() => setCurrentPage('blog')} 
                style={{ color: '#2563EB', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
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