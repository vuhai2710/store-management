
import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BuyNowProvider } from "./contexts/BuyNowContext";

import { useDebounce } from "./hooks/useDebounce";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HomePage from "./components/pages/HomePage";
import ShopPage from "./components/pages/ShopPage";
import CartPage from "./components/pages/CartPage";
import ProductDetailPage from "./components/pages/ProductDetailPage";
import LoginPage from "./components/pages/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import ResetPasswordPage from "./components/pages/ResetPasswordPage";
import CheckoutPage from "./components/pages/CheckoutPage";
import OrdersPage from "./components/pages/OrdersPage";
import ProfilePage from "./components/pages/ProfilePage";
import PaymentSuccessPage from "./components/pages/PaymentSuccessPage";
import PaymentCancelPage from "./components/pages/PaymentCancelPage";
import RequestReturnPage from "./pages/returns/RequestReturnPage";
import ReturnHistoryPage from "./pages/returns/ReturnHistoryPage";
import ReturnDetailPage from "./pages/returns/ReturnDetailPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ChatWidget from "./components/chat/ChatWidget";
import FlyingCartIcon from "./components/common/FlyingCartIcon";

import { cartService } from "./services/cartService";

import { products, initialCart } from "./data/data";

function AppContent() {
  const {
    isAuthenticated,
    user,
    customer,
    logout,
    isLoading: authLoading,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {

    const savedPage = localStorage.getItem("currentPage");
    return savedPage || "home";
  });
  const [selectedProductId, setSelectedProductId] = useState(() => {

    const savedProductId = localStorage.getItem("selectedProductId");
    return savedProductId ? parseInt(savedProductId) : null;
  });
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedReturnId, setSelectedReturnId] = useState(null);
  const [cartData, setCartData] = useState(null);
  const cart = cartData?.cartItems || cartData?.items || [];
  const [cartLoading, setCartLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [sortOption, setSortOption] = useState("default");
  const [initializedFromUrl, setInitializedFromUrl] = useState(false);

  const [showFlyingCart, setShowFlyingCart] = useState(false);
  const [animationSource, setAnimationSource] = useState(null);
  const [animationTarget, setAnimationTarget] = useState(null);
  const cartIconRef = useRef(null);

  useEffect(() => {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const categoryIdFromUrl = urlParams.get('categoryId');
    const tokenFromUrl = urlParams.get('token');

    if (path.startsWith("/payment/success")) {
      setCurrentPage("payment-success");
    } else if (path.startsWith("/payment/cancel")) {
      setCurrentPage("payment-cancel");
    } else if (path.startsWith("/reset-password")) {

      setCurrentPage("reset-password");
    } else if (tokenFromUrl && !path.startsWith("/reset-password")) {

      console.log("Received auth token from redirect, saving to localStorage");
      localStorage.setItem("token", tokenFromUrl);

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('token');
      window.history.replaceState({}, '', newUrl.pathname + newUrl.search);

      setCurrentPage("home");
    }

    if (categoryIdFromUrl && !tokenFromUrl) {
      setSelectedCategoryId(parseInt(categoryIdFromUrl));
      setCurrentPage("shop");
    }

    setInitializedFromUrl(true);
  }, []);

  useEffect(() => {
    if (!initializedFromUrl) return;

    if (currentPage !== "payment-success" && currentPage !== "payment-cancel") {
      const path = window.location.pathname;
      if (
        path.startsWith("/payment/success") ||
        path.startsWith("/payment/cancel")
      ) {
        window.history.replaceState({}, "", "/");
      }
    }
  }, [currentPage, initializedFromUrl]);

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (selectedProductId) {
      localStorage.setItem("selectedProductId", selectedProductId.toString());
    } else {
      localStorage.removeItem("selectedProductId");
    }
  }, [selectedProductId]);

  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated && !authLoading) {
        try {
          setCartLoading(true);
          const cartDataResponse = await cartService.getCart();
          setCartData(cartDataResponse);
        } catch (error) {
          console.error("Error loading cart:", error);
          setCartData(null);
        } finally {
          setCartLoading(false);
        }
      } else {

        setCartData(null);
      }
    };

    loadCart();
  }, [isAuthenticated, authLoading]);

  const reloadCart = async () => {
    if (isAuthenticated) {
      try {
        setCartLoading(true);
        const cartDataResponse = await cartService.getCart();
        setCartData(cartDataResponse);
      } catch (error) {
        console.error("Error reloading cart:", error);
      } finally {
        setCartLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage("home");
      setCartData(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleAddToCart = async (product, sourceElement = null) => {
    if (!isAuthenticated) {

      setCurrentPage("login");
      return;
    }

    try {
      const productId = product.idProduct || product.id || product.productId;
      const quantity = product.qty || product.quantity || 1;

      if (!productId) {
        toast.warning("Không tìm thấy ID sản phẩm");
        return;
      }

      let sourcePos = null;
      if (sourceElement) {
        const rect = sourceElement.getBoundingClientRect();
        sourcePos = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }

      const triggerAnimation = () => {
        let targetPos = null;

        if (cartIconRef.current) {
          const rect = cartIconRef.current.getBoundingClientRect();
          targetPos = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        } else {

          const cartButton = document.querySelector('[title="Giỏ hàng"]');
          if (cartButton) {
            const rect = cartButton.getBoundingClientRect();
            targetPos = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            };
          }
        }

        if (sourcePos && targetPos) {
          setAnimationSource(sourcePos);
          setAnimationTarget(targetPos);
          setShowFlyingCart(true);
        }
      };

      requestAnimationFrame(() => {
        setTimeout(triggerAnimation, 50);
      });

      await cartService.addToCart({
        productId,
        quantity,
      });

      try {
        const cartDataResponse = await cartService.getCart();
        setCartData(cartDataResponse);
      } catch (cartError) {
        console.error("Error reloading cart:", cartError);

      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Không thể thêm sản phẩm vào giỏ hàng";
      toast.error(errorMessage);
      throw error;
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

        const cartDataResponse = await cartService.getCart();
        setCartData(cartDataResponse);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error(error?.message || "Không thể cập nhật giỏ hàng");
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

      const updatedCart = response?.data || response;
      console.log("[App] Updated cart after remove:", updatedCart);

      setCartData(updatedCart);
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error(error?.message || "Không thể xóa sản phẩm khỏi giỏ hàng");
    }
  };

  const handleViewProductDetail = (productId) => {
    setSelectedProductId(productId);
    setCurrentPage("product-detail");
    window.scrollTo(0, 0);
  };

  const handleCategoryNavigation = (categoryId, categoryName) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategory(categoryName);
    setCurrentPage("shop");

    const url = new URL(window.location.href);
    url.searchParams.set('categoryId', categoryId);
    window.history.pushState({}, '', url.toString());

    window.scrollTo(0, 0);
  };

  const handleClearCategoryFilter = () => {
    setSelectedCategoryId(null);
    setSelectedCategory("All");

    const url = new URL(window.location.href);
    url.searchParams.delete('categoryId');
    window.history.pushState({}, '', url.pathname);
  };

  const cartSubtotal = cartData?.totalAmount
    ? Number(cartData.totalAmount)
    : cart.reduce((sum, item) => {
      const price =
        item.productPrice || item.price || item.product?.price || 0;
      const quantity = item.quantity || item.qty || 0;
      const subtotal = item.subtotal || price * quantity;
      return sum + Number(subtotal);
    }, 0);

  const cartAutomaticDiscount = cartData?.automaticDiscount
    ? Number(cartData.automaticDiscount)
    : 0;

  const cartTotal = Math.max(0, cartSubtotal - cartAutomaticDiscount);

  const cartItemCount = cartData?.totalItems
    ? Number(cartData.totalItems)
    : cart.reduce((sum, item) => sum + (item.quantity || item.qty || 0), 0);

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
        return <HomePage {...pageProps} setSelectedCategory={setSelectedCategory} handleCategoryNavigation={handleCategoryNavigation} />;

      case "shop":
        return (
          <ShopPage
            {...pageProps}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            sortOption={sortOption}
            setSortOption={setSortOption}
            searchTerm={debouncedSearchTerm}
            handleClearCategoryFilter={handleClearCategoryFilter}
          />
        );

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

      case "reset-password":
        return <ResetPasswordPage setCurrentPage={setCurrentPage} />;

      case "orders":
        return (
          <ProtectedRoute>
            <OrdersPage
              setCurrentPage={setCurrentPage}
              setSelectedOrderId={setSelectedOrderId}
              setSelectedReturnId={setSelectedReturnId}
              reloadCart={reloadCart}
            />
          </ProtectedRoute>
        );

      case "return-request":
        return (
          <ProtectedRoute>
            <RequestReturnPage
              setCurrentPage={setCurrentPage}
              orderId={selectedOrderId}
            />
          </ProtectedRoute>
        );

      case "return-history":
        return (
          <ProtectedRoute>
            <ReturnHistoryPage
              setCurrentPage={setCurrentPage}
              setSelectedReturnId={setSelectedReturnId}
            />
          </ProtectedRoute>
        );

      case "return-detail":
        return (
          <ProtectedRoute>
            <ReturnDetailPage
              setCurrentPage={setCurrentPage}
              returnId={selectedReturnId}
            />
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

  const isAuthPage = currentPage === "login" || currentPage === "register" || currentPage === "reset-password";

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
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      { }
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

      { }
      {!isAuthPage && <Footer />}

      { }
      {isAuthenticated && <ChatWidget />}

      { }
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

      { }
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="text-sm"
      />
    </div>
  );
}

export default function OganiApp() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BuyNowProvider>
          <AppContent />
        </BuyNowProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
