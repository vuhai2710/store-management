// App.js
import React, { useState, useEffect, useRef } from "react";

// Import context
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Import components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HomePage from "./components/pages/HomePage";
import ShopPage from "./components/pages/ShopPage";
import BlogPage from "./components/pages/BlogPage";
import CartPage from "./components/pages/CartPage";
import ContactPage from "./components/pages/ContactPage";
import ProductDetailPage from "./components/pages/ProductDetailPage";
import LoginPage from "./components/pages/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import CheckoutPage from "./components/pages/CheckoutPage";
import OrdersPage from "./components/pages/OrdersPage";
import ProfilePage from "./components/pages/ProfilePage";
import PaymentSuccessPage from "./components/pages/PaymentSuccessPage";
import PaymentCancelPage from "./components/pages/PaymentCancelPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ChatWidget from "./components/chat/ChatWidget";
import FlyingCartIcon from "./components/common/FlyingCartIcon";

// Import services
import { cartService } from "./services/cartService";

// Import data (for fallback/initial state)
import { products, initialCart } from "./data/data";

function AppContent() {
  const {
    isAuthenticated,
    user,
    customer,
    logout,
    isLoading: authLoading,
  } = useAuth();

  // --- STATE HOOKS ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    // Restore page from localStorage on mount
    const savedPage = localStorage.getItem('currentPage');
    return savedPage || 'home';
  });
  const [selectedProductId, setSelectedProductId] = useState(() => {
    // Restore selected product from localStorage on mount
    const savedProductId = localStorage.getItem('selectedProductId');
    return savedProductId ? parseInt(savedProductId) : null;
  });
  const [cart, setCart] = useState([]);
  const [cartData, setCartData] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("default");
  const [initializedFromUrl, setInitializedFromUrl] = useState(false);

  // Cart animation state
  const [showFlyingCart, setShowFlyingCart] = useState(false);
  const [animationSource, setAnimationSource] = useState(null);
  const [animationTarget, setAnimationTarget] = useState(null);
  const cartIconRef = useRef(null);

  // Map URL path (từ PayOS redirect) sang currentPage khi load lại
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/payment/success')) {
      setCurrentPage('payment-success');
    } else if (path.startsWith('/payment/cancel')) {
      setCurrentPage('payment-cancel');
    }
    setInitializedFromUrl(true);
  }, []);

  useEffect(() => {
    if (!initializedFromUrl) return;

    if (currentPage !== 'payment-success' && currentPage !== 'payment-cancel') {
      const path = window.location.pathname;
      if (path.startsWith('/payment/success') || path.startsWith('/payment/cancel')) {
        window.history.replaceState({}, '', '/');
      }
    }
  }, [currentPage, initializedFromUrl]);

  // Save currentPage to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  // Save selectedProductId to localStorage whenever it changes
  useEffect(() => {
    if (selectedProductId) {
      localStorage.setItem('selectedProductId', selectedProductId.toString());
    } else {
      localStorage.removeItem('selectedProductId');
    }
  }, [selectedProductId]);

  // --- CART MANAGEMENT ---
  // Load cart from API when user is authenticated
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated && !authLoading) {
        try {
          setCartLoading(true);
          const cartDataResponse = await cartService.getCart();
          setCartData(cartDataResponse);
          setCart(cartDataResponse.cartItems || cartDataResponse.items || []);
        } catch (error) {
          console.error("Error loading cart:", error);
          setCart([]);
          setCartData(null);
        } finally {
          setCartLoading(false);
        }
      } else {
        // Clear cart when user logs out
        setCart([]);
        setCartData(null);
      }
    };

    loadCart();
  }, [isAuthenticated, authLoading]);

  // --- AUTH LOGIC ---
  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage("home");
      setCart([]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // --- CART HANDLERS ---
  const handleAddToCart = async (product, sourceElement = null) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      setCurrentPage("login");
      return;
    }

    try {
      const productId = product.idProduct || product.id || product.productId;
      const quantity = product.qty || product.quantity || 1;

      if (!productId) {
        alert("Không tìm thấy ID sản phẩm");
        return;
      }

      // Get source position for animation
      let sourcePos = null;
      if (sourceElement) {
        const rect = sourceElement.getBoundingClientRect();
        sourcePos = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }

      // Get target position (cart icon in header) - use setTimeout to ensure DOM is ready
      const triggerAnimation = () => {
        let targetPos = null;

        // Try cartIconRef first
        if (cartIconRef.current) {
          const rect = cartIconRef.current.getBoundingClientRect();
          targetPos = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        } else {
          // Fallback: try to find cart icon by querying DOM
          const cartButton = document.querySelector('[title="Giỏ hàng"]');
          if (cartButton) {
            const rect = cartButton.getBoundingClientRect();
            targetPos = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            };
          }
        }

        // Trigger animation if we have both positions
        if (sourcePos && targetPos) {
          setAnimationSource(sourcePos);
          setAnimationTarget(targetPos);
          setShowFlyingCart(true);
        }
      };

      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        setTimeout(triggerAnimation, 50);
      });

      await cartService.addToCart({
        productId,
        quantity,
      });

      // Reload cart
      try {
        const cartDataResponse = await cartService.getCart();
        setCartData(cartDataResponse);
        setCart(cartDataResponse.cartItems || cartDataResponse.items || []);
      } catch (cartError) {
        console.error("Error reloading cart:", cartError);
        // Still continue even if reload fails
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Không thể thêm sản phẩm vào giỏ hàng";
      alert(errorMessage);
      throw error; // Re-throw to let component handle it
    }
  };

  const handleUpdateQty = async (itemId, newQty) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      if (newQty <= 0) {
        await handleRemoveFromCart(itemId);
      } else {
        await cartService.updateCartItem(itemId, { quantity: newQty });
        // Reload cart
        const cartDataResponse = await cartService.getCart();
        setCartData(cartDataResponse);
        setCart(cartDataResponse.cartItems || cartDataResponse.items || []);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      alert(error?.message || "Không thể cập nhật giỏ hàng");
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      console.log("[App] Removing cart item:", itemId);
      const response = await cartService.removeCartItem(itemId);
      console.log("[App] Remove cart item response:", response);

      // Backend returns the updated cart in response.data
      const updatedCart = response?.data || response;
      console.log("[App] Updated cart after remove:", updatedCart);

      setCartData(updatedCart);
      setCart(updatedCart.cartItems || updatedCart.items || []);
    } catch (error) {
      console.error("Error removing from cart:", error);
      alert(error?.message || "Không thể xóa sản phẩm khỏi giỏ hàng");
    }
  };

  // --- PRODUCT HANDLERS ---
  const handleViewProductDetail = (productId) => {
    setSelectedProductId(productId);
    setCurrentPage("product-detail");
    window.scrollTo(0, 0);
  };

  // Calculate cart subtotal (trước giảm giá) từ cartData hoặc từ items
  const cartSubtotal = cartData?.totalAmount
    ? Number(cartData.totalAmount)
    : cart.reduce((sum, item) => {
        const price =
          item.productPrice || item.price || item.product?.price || 0;
        const quantity = item.quantity || item.qty || 0;
        const subtotal = item.subtotal || price * quantity;
        return sum + Number(subtotal);
      }, 0);

  // Giảm giá tự động cho giỏ hàng (từ backend)
  const cartAutomaticDiscount = cartData?.automaticDiscount
    ? Number(cartData.automaticDiscount)
    : 0;

  // Tổng sau khi trừ giảm giá tự động
  const cartTotal = Math.max(0, cartSubtotal - cartAutomaticDiscount);

  const cartItemCount = cartData?.totalItems
    ? Number(cartData.totalItems)
    : cart.reduce((sum, item) => sum + (item.quantity || item.qty || 0), 0);

  // --- ROUTER/RENDER LOGIC ---
  const renderPage = () => {
    const pageProps = {
      setCurrentPage,
      handleAddToCart,
      handleViewProductDetail,
      isAuthenticated,
      user: user || customer,
    };

    switch (currentPage) {
      case "home":
        return <HomePage {...pageProps} />;

      case "shop":
        return (
          <ShopPage
            {...pageProps}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortOption={sortOption}
            setSortOption={setSortOption}
            searchTerm={searchTerm}
          />
        );

      case "blog":
        return <BlogPage {...pageProps} />;

      case "contact":
        return <ContactPage {...pageProps} />;

      case "cart":
        return (
          <ProtectedRoute>
            <CartPage
              {...pageProps}
              cart={cart}
              cartTotal={cartTotal}
              cartSubtotal={cartSubtotal}
              cartAutomaticDiscount={cartAutomaticDiscount}
              handleUpdateQty={handleUpdateQty}
              handleRemoveFromCart={handleRemoveFromCart}
              cartLoading={cartLoading}
            />
          </ProtectedRoute>
        );

      case "product-detail":
        return (
          <ProductDetailPage
            {...pageProps}
            productId={selectedProductId}
            cart={cart}
            handleUpdateQty={handleUpdateQty}
          />
        );

      case "login":
        return <LoginPage setCurrentPage={setCurrentPage} />;

      case "register":
        return <RegisterPage setCurrentPage={setCurrentPage} />;

      case "orders":
        return (
          <ProtectedRoute>
            <OrdersPage setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        );

      case "profile":
        return (
          <ProtectedRoute>
            <ProfilePage setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        );

      case "checkout":
        return (
          <ProtectedRoute>
            <CheckoutPage setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        );

      case "payment-success":
        return (
          <ProtectedRoute>
            <PaymentSuccessPage setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        );

      case "payment-cancel":
        return (
          <ProtectedRoute>
            <PaymentCancelPage setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        );

      default:
        return <HomePage {...pageProps} />;
    }
  };

  // ✅ KIỂM TRA: Nếu là trang Login hoặc Register thì KHÔNG hiển thị Header/Footer
  const isAuthPage = currentPage === "login" || currentPage === "register";

  // Show loading if auth is loading
  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "white" }}>
      {/* Chỉ hiển thị Header nếu KHÔNG phải trang auth */}
      {!isAuthPage && (
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          cart={cart}
          cartItemCount={cartItemCount}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isAuthenticated={isAuthenticated}
          user={user || customer}
          handleLogout={handleLogout}
          cartIconRef={cartIconRef}
        />
      )}

      <main>{renderPage()}</main>

      {/* Chỉ hiển thị Footer nếu KHÔNG phải trang auth */}
      {!isAuthPage && <Footer />}

      {/* Chat Widget - Only show if authenticated */}
      {isAuthenticated && <ChatWidget />}

      {/* Flying Cart Animation */}
      {showFlyingCart && animationSource && animationTarget && (
        <FlyingCartIcon
          sourcePosition={animationSource}
          targetPosition={animationTarget}
          onComplete={() => {
            setShowFlyingCart(false);
            setAnimationSource(null);
            setAnimationTarget(null);
          }}
        />
      )}
    </div>
  );
}

export default function OganiApp() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
