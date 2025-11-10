// src/styles/styles.js
const styles = {
  // --- Layout & Reusable Styles ---
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  buttonPrimary: {
    backgroundColor: '#007bff', // Blue
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.3s',
  },
  buttonSecondary: {
    backgroundColor: '#28a745', // Green
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    color: 'white',
    border: '2px solid white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s, color 0.3s',
  },
  inputField: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #ccc',
    borderRadius: '0.25rem',
    outline: 'none',
  },
  // --- Header Styles ---
  headerTopBar: {
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e9ecef',
    padding: '0.5rem 0',
  },
  headerMain: {
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 40,
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#007bff',
  },
  navLink: {
    color: '#495057',
    textDecoration: 'none',
    fontWeight: 'normal',
    transition: 'color 0.3s',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  navLinkActive: {
    color: '#007bff',
    fontWeight: 'bold',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  // --- Product Card Styles ---
  card: {
    border: '1px solid #dee2e6',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    backgroundColor: 'white',
    transition: 'box-shadow 0.3s',
  },
  cardImage: {
    backgroundColor: '#e9ecef',
    height: '12rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardContent: {
    padding: '1rem',
  },
  cardTitle: {
    fontWeight: '600',
    color: '#212529',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  },
  cardPrice: {
    color: '#28a745',
    fontWeight: 'bold',
    marginBottom: '0.75rem',
  },
  // --- Cart/Table Styles ---
  tableHead: {
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
  },
  tableRow: {
    borderBottom: '1px solid #dee2e6',
  },
  // --- Shop/Sidebar Styles (Desktop First) ---
  shopLayout: {
    display: 'grid',
    gridTemplateColumns: '250px 1fr', 
    gap: '2rem',
  },
  sidebar: {
    padding: '1.5rem',
    backgroundColor: '#f8f8f8',
    borderRadius: '0.5rem',
  },
  sidebarSection: {
    marginBottom: '2rem',
    borderBottom: '1px solid #e9ecef',
    paddingBottom: '1.5rem',
  },
  latestProductItem: {
    display: 'flex', 
    gap: '0.75rem', 
    alignItems: 'center', 
    paddingBottom: '1rem', 
    borderBottom: '1px dotted #dee2e6'
  }
};

export default styles;