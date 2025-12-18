
const styles = {

  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 1.5rem',
  },
  buttonPrimary: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)',
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease',
  },
  buttonSecondary: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.25)',
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease',
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
    border: '1px solid #E2E8F0',
    borderRadius: '0.75rem',
    backgroundColor: '#FFFFFF',
    outline: 'none',
  },

  headerTopBar: {
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
    padding: '0.5rem 0',
  },
  headerMain: {
    backgroundColor: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 40,
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2563EB',
  },
  navLink: {
    color: '#475569',
    textDecoration: 'none',
    fontWeight: 'normal',
    transition: 'color 0.2s ease',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  navLinkActive: {
    color: '#2563EB',
    fontWeight: 'bold',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },

  card: {
    border: '1px solid #E2E8F0',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.06)',
    transition: 'box-shadow 0.2s ease, transform 0.1s ease',
  },
  cardImage: {
    backgroundColor: '#E5E7EB',
    height: '12rem',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
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
    color: '#16A34A',
    fontWeight: 'bold',
    marginBottom: '0.75rem',
  },

  tableHead: {
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
  },
  tableRow: {
    borderBottom: '1px solid #E2E8F0',
  },

  shopLayout: {
    display: 'grid',
    gridTemplateColumns: '250px 1fr',
    gap: '2rem',
  },
  sidebar: {
    padding: '1.5rem',
    backgroundColor: '#F8FAFC',
    borderRadius: '0.75rem',
  },
  sidebarSection: {
    marginBottom: '2rem',
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: '1.5rem',
  },
  latestProductItem: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    paddingBottom: '1rem',
    borderBottom: '1px dotted #E2E8F0'
  }
};

export default styles;
