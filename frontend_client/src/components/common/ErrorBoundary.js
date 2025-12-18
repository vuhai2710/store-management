import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>
            Đã xảy ra lỗi
          </h2>
          <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
            Xin lỗi, đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563EB',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Quay về trang chủ
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
