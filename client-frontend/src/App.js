// App.js
import React, { useState } from 'react';

// Import components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './components/pages/HomePage';
import ShopPage from './components/pages/ShopPage';
import BlogPage from './components/pages/BlogPage';
import CartPage from './components/pages/CartPage';
import WishlistPage from './components/pages/WishlistPage';
import ContactPage from './components/pages/ContactPage';
import ProductDetailPage from './components/pages/ProductDetailPage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';

// Import data
import { products, initialCart } from './data/data';

export default function OganiApp() {
  // --- STATE HOOKS ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null); 
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState(initialCart);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('default'); 
  
  // --- AUTH STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: 'Guest' });

  // --- AUTH LOGIC ---
  const handleLogin = (username, password) => {
    if (username && password) {
      setUser({ name: username });
      setIsLoggedIn(true);
      setCurrentPage('home');
      alert(`Đăng nhập thành công với tài khoản: ${username}`);
    } else {
      alert('Tên đăng nhập hoặc mật khẩu không hợp lệ.');
    }
  };

  const handleRegister = (name, email, password) => {
    if (name && email && password) {
      setUser({ name: name });
      setIsLoggedIn(true);
      setCurrentPage('home');
      alert(`Đăng ký thành công! Chào mừng, ${name}.`);
    } else {
      alert('Vui lòng điền đầy đủ thông tin.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser({ name: 'Guest' });
    setCurrentPage('home');
    alert('Đã đăng xuất.');
  };

  // Các hàm xử lý giỏ hàng/wishlist
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  let currentProducts = products.filter(p => 
    (selectedCategory === 'All' || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedProducts = [...currentProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'rating-desc': return b.rating - a.rating;
      case 'reviews-desc': return b.reviews - a.reviews;
      case 'default':
      default: return a.id - b.id; 
    }
  });
  
  const handleViewProductDetail = (productId) => {
    setSelectedProductId(productId);
    setCurrentPage('product-detail');
    window.scrollTo(0, 0); 
  };
  
  const handleAddToCart = (product) => {
    const qtyToAdd = product.qty || 1; 
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? {...item, qty: item.qty + qtyToAdd} : item
      ));
    } else {
      setCart([...cart, {...product, qty: qtyToAdd}]);
    }
  };
  
  const handleUpdateQty = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id);
    } else {
      setCart(cart.map(item => 
        item.id === id ? {...item, qty: newQty} : item
      ));
    }
  };
  
  const handleRemoveFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };
  
  const handleAddToWishlist = (product) => {
    if (wishlist.find(item => item.id === product.id)) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };
  
  const isInWishlist = (id) => wishlist.some(item => item.id === id);

  // --- ROUTER/RENDER LOGIC ---
  const renderPage = () => {
    const pageProps = { 
      setCurrentPage, 
      handleAddToCart, 
      handleAddToWishlist, 
      isInWishlist, 
      handleViewProductDetail,
      isLoggedIn,
      user
    }; 
    
    switch (currentPage) {
      case 'home':
        return <HomePage {...pageProps} />;
      
      case 'shop':
        return <ShopPage 
          {...pageProps} 
          filteredProducts={sortedProducts} 
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortOption={sortOption}           
          setSortOption={setSortOption}     
        />;
      
      case 'blog':
        return <BlogPage {...pageProps} />;
      
      case 'contact':
        return <ContactPage {...pageProps} />;
      
      case 'cart':
        return <CartPage 
          {...pageProps} 
          cart={cart} 
          cartTotal={cartTotal} 
          handleUpdateQty={handleUpdateQty} 
          handleRemoveFromCart={handleRemoveFromCart} 
        />;
      
      case 'wishlist':
        return <WishlistPage {...pageProps} wishlist={wishlist} />;
      
      case 'product-detail':
        const product = products.find(p => p.id === selectedProductId);
        if (!product) {
          return <ShopPage 
            {...pageProps} 
            filteredProducts={sortedProducts} 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
            sortOption={sortOption} 
            setSortOption={setSortOption} 
          />;
        }
        return <ProductDetailPage 
          {...pageProps} 
          product={product} 
          products={products}
          cart={cart}
          handleUpdateQty={handleUpdateQty}
        />;
      
      case 'login':
        return <LoginPage 
          setCurrentPage={setCurrentPage} 
          handleLogin={handleLogin} 
        />;
      
      case 'register':
        return <RegisterPage 
          setCurrentPage={setCurrentPage} 
          handleRegister={handleRegister} 
        />;
      
      default:
        return <HomePage {...pageProps} />;
    }
  };

  // ✅ KIỂM TRA: Nếu là trang Login hoặc Register thì KHÔNG hiển thị Header/Footer
  const isAuthPage = currentPage === 'login' || currentPage === 'register';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      {/* Chỉ hiển thị Header nếu KHÔNG phải trang auth */}
      {!isAuthPage && (
        <Header 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen}
          wishlist={wishlist}
          cart={cart}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isLoggedIn={isLoggedIn}
          user={user}
          handleLogout={handleLogout}
        />
      )}
      
      <main>
        {renderPage()}
      </main>
      
      {/* Chỉ hiển thị Footer nếu KHÔNG phải trang auth */}
      {!isAuthPage && <Footer />}
    </div>
  );
}