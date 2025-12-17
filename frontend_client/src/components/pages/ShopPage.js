// src/components/pages/ShopPage.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "../../styles/styles";
import ProductCard from "../shared/ProductCard";
import LoadingSpinner from "../common/LoadingSpinner";
import { productsService } from "../../services/productsService";
import { categoriesService } from "../../services/categoriesService";
import { formatPrice, getImageUrl } from "../../utils/formatUtils";
import { Grid3X3, List } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useDebounce } from "../../hooks/useDebounce";

const ShopPage = ({
  selectedCategory,
  setSelectedCategory,
  selectedCategoryId,
  setSelectedCategoryId,
  handleAddToCart,
  handleViewProductDetail,
  sortOption,
  setSortOption,
  setCurrentPage,
  searchTerm,
  handleClearCategoryFilter,
}) => {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [maxPriceForDisplay, setMaxPriceForDisplay] = useState(10000000); // 10 million VND
  const [selectedBrand, setSelectedBrand] = useState("");
  const [brands, setBrands] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [productsOnSale, setProductsOnSale] = useState([]); // Flash Sale products

  // Debounced price filter inputs - prevents API calls on every keystroke
  const debouncedMinPrice = useDebounce(minPrice, 500);
  const debouncedMaxPrice = useDebounce(maxPrice, 500);

  // Refs to maintain focus on price inputs
  const minPriceInputRef = useRef(null);
  const maxPriceInputRef = useRef(null);

  const getLatestProductImage = (product) => {
    if (!product) return null;
    if (product.images && product.images.length > 0) {
      return getImageUrl(product.images[0].imageUrl || product.images[0].url);
    }
    if (product.imageUrl) {
      return getImageUrl(product.imageUrl);
    }
    return null;
  };

  // Style cho nút Category Filter
  const filterButtonStyle = (isActive) => ({
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    border: isActive ? "1px solid #2563EB" : "1px solid #E2E8F0",
    backgroundColor: isActive ? "#DBEAFE" : "#FFFFFF",
    color: isActive ? "#2563EB" : "#475569",
    fontWeight: isActive ? "600" : "normal",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    transition: "all 0.3s",
    marginBottom: "0.25rem",
  });

  // Fetch categories (only when authenticated)
  useEffect(() => {
    const fetchCategories = async () => {
      if (!isAuthenticated) {
        setCategories([]);
        return;
      }

      try {
        const categoriesData = await categoriesService.getAll();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, [isAuthenticated]);

  // Sync category name when categoryId is set from URL (after categories are loaded)
  useEffect(() => {
    if (selectedCategoryId && categories.length > 0) {
      const categoryFromId = categories.find(
        (cat) => (cat.idCategory || cat.id) === selectedCategoryId
      );
      if (categoryFromId) {
        const categoryName = categoryFromId.categoryName || categoryFromId.name;
        if (selectedCategory !== categoryName) {
          setSelectedCategory(categoryName);
        }
      }
    }
  }, [selectedCategoryId, categories, selectedCategory, setSelectedCategory]);

  // Fetch brands (only when authenticated)
  useEffect(() => {
    const fetchBrands = async () => {
      if (!isAuthenticated) {
        setBrands([]);
        return;
      }

      try {
        const brandsData = await productsService.getAllBrands();
        setBrands(brandsData || []);
      } catch (error) {
        console.error("Error fetching brands:", error);
        setBrands([]);
      }
    };

    fetchBrands();
  }, [isAuthenticated]);

  // Reset to first page when search term changes
  useEffect(() => {
    setPageNo(1);
  }, [searchTerm]);

  // Fetch products based on filters (only when authenticated)
  useEffect(() => {
    const fetchProducts = async () => {
      // Don't fetch if not authenticated
      if (!isAuthenticated) {
        setProducts([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Map sortOption to API parameters
        // Note: rating and reviewCount sorting is handled client-side since they're computed values
        let sortBy = "idProduct";
        let sortDirection = "ASC";
        let clientSideSort = null; // For rating/reviewCount sorting

        switch (sortOption) {
          case "price-asc":
            sortBy = "price";
            sortDirection = "ASC";
            break;
          case "price-desc":
            sortBy = "price";
            sortDirection = "DESC";
            break;
          case "rating-desc":
            // Rating is computed, use client-side sorting
            sortBy = "idProduct";
            sortDirection = "DESC";
            clientSideSort = "rating";
            break;
          case "reviews-desc":
            // Review count is computed, use client-side sorting
            sortBy = "idProduct";
            sortDirection = "DESC";
            clientSideSort = "reviewCount";
            break;
          default:
            sortBy = "idProduct";
            sortDirection = "DESC"; // Newest first
        }

        // Determine which API to call
        let productsData;
        // Use selectedCategoryId directly if provided (from URL), otherwise lookup from category name
        let categoryId = selectedCategoryId;
        if (!categoryId && selectedCategory && selectedCategory !== "All" && selectedCategory !== "Tất cả") {
          categoryId = categories.find(
            (cat) => (cat.categoryName || cat.name) === selectedCategory
          )?.idCategory;
        }

        if (searchTerm) {
          // Search by name
          productsData = await productsService.searchProductsByName({
            name: searchTerm,
            pageNo,
            pageSize,
            sortBy,
            sortDirection,
          });
        } else if (categoryId) {
          // Filter by category
          productsData = await productsService.getProductsByCategory(
            categoryId,
            {
              pageNo,
              pageSize,
              sortBy,
              sortDirection,
            }
          );
        } else if (selectedBrand) {
          // Filter by brand
          productsData = await productsService.getProductsByBrand(
            selectedBrand,
            {
              pageNo,
              pageSize,
              sortBy,
              sortDirection,
            }
          );
        } else if (debouncedMinPrice || debouncedMaxPrice) {
          // Filter by price range (using debounced values)
          productsData = await productsService.getProductsByPriceRange({
            minPrice: debouncedMinPrice ? parseInt(debouncedMinPrice) : 0,
            maxPrice: debouncedMaxPrice
              ? parseInt(debouncedMaxPrice)
              : undefined,
            pageNo,
            pageSize,
            sortBy,
            sortDirection,
          });
        } else {
          // Get all products
          productsData = await productsService.getProducts({
            pageNo,
            pageSize,
            sortBy,
            sortDirection,
          });
        }

        // Get products and sort
        let fetchedProducts = productsData?.content || [];

        // Client-side sorting for rating and review count (computed values not in DB)
        if (clientSideSort === "rating") {
          fetchedProducts = [...fetchedProducts].sort((a, b) => {
            const aRating = a.averageRating || 0;
            const bRating = b.averageRating || 0;
            return bRating - aRating; // Descending
          });
        } else if (clientSideSort === "reviewCount") {
          fetchedProducts = [...fetchedProducts].sort((a, b) => {
            const aReviews = a.reviewCount || 0;
            const bReviews = b.reviewCount || 0;
            return bReviews - aReviews; // Descending
          });
        }

        // Final sort: out-of-stock products always appear last (after any other sorting)
        fetchedProducts = [...fetchedProducts].sort((a, b) => {
          const aOutOfStock =
            a.status === "OUT_OF_STOCK" || a.stockQuantity === 0;
          const bOutOfStock =
            b.status === "OUT_OF_STOCK" || b.stockQuantity === 0;
          if (aOutOfStock && !bOutOfStock) return 1;
          if (!aOutOfStock && bOutOfStock) return -1;
          return 0;
        });

        setProducts(fetchedProducts);
        setTotalPages(productsData?.totalPages || 1);
        setTotalElements(productsData?.totalElements || 0);

        // If current page exceeds available pages after a new filter/search, reset to page 1
        if (
          (productsData?.totalPages || 1) > 0 &&
          pageNo > (productsData?.totalPages || 1)
        ) {
          setPageNo(1);
          return; // let the effect re-fetch with page 1
        }

        // Update max price for display if needed
        if (productsData?.content && productsData.content.length > 0) {
          const prices = productsData.content.map((p) => p.price || 0);
          const currentMax = Math.max(...prices);
          if (currentMax > maxPriceForDisplay) {
            setMaxPriceForDisplay(Math.ceil(currentMax / 1000000) * 1000000); // Round up to nearest million
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    isAuthenticated,
    pageNo,
    sortOption,
    selectedCategory,
    selectedCategoryId,
    searchTerm,
    selectedBrand,
    debouncedMinPrice,
    debouncedMaxPrice,
    categories,
  ]);

  // Fetch latest products for sidebar
  useEffect(() => {
    const fetchLatestProducts = async () => {
      if (!isAuthenticated) {
        setLatestProducts([]);
        return;
      }

      try {
        const latestData = await productsService.getNewProducts({
          pageNo: 1,
          pageSize: 3,
        });
        setLatestProducts(latestData?.content || []);
      } catch (error) {
        console.error("Error fetching latest products:", error);
        setLatestProducts([]);
      }
    };

    fetchLatestProducts();
  }, [isAuthenticated]);

  // Fetch products on sale for sidebar Flash Sale section
  useEffect(() => {
    const fetchProductsOnSale = async () => {
      if (!isAuthenticated) {
        setProductsOnSale([]);
        return;
      }

      try {
        const onSaleData = await productsService.getProductsOnSale();
        // Only show top 5 in sidebar
        setProductsOnSale((onSaleData || []).slice(0, 5));
      } catch (error) {
        console.error("Error fetching products on sale:", error);
        setProductsOnSale([]);
      }
    };

    fetchProductsOnSale();
  }, [isAuthenticated]);

  // Price filter handlers - just update state, debounce will handle API call
  const handleMinPriceChange = useCallback((e) => {
    setMinPrice(e.target.value);
  }, []);

  const handleMaxPriceChange = useCallback((e) => {
    setMaxPrice(e.target.value);
  }, []);

  // Reset page when debounced price changes
  useEffect(() => {
    setPageNo(1);
  }, [debouncedMinPrice, debouncedMaxPrice]);

  const handleClearPriceFilter = () => {
    setMinPrice("");
    setMaxPrice("");
    setPageNo(1);
  };

  const handleCategoryChange = (category, categoryId = null) => {
    setSelectedCategory(category);

    // Update categoryId state and URL
    if (category === "All" || category === "Tất cả") {
      // Clear category filter
      if (setSelectedCategoryId) {
        setSelectedCategoryId(null);
      }
      // Remove categoryId from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('categoryId');
      window.history.pushState({}, '', url.pathname + url.search);
    } else if (categoryId) {
      // Set category ID and update URL
      if (setSelectedCategoryId) {
        setSelectedCategoryId(categoryId);
      }
      const url = new URL(window.location.href);
      url.searchParams.set('categoryId', categoryId);
      window.history.pushState({}, '', url.toString());
    }

    setPageNo(1); // Reset to first page when filter changes
  };

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand === "All" ? "" : brand);
    setPageNo(1); // Reset to first page when filter changes
  };

  const handlePageChange = (newPage) => {
    setPageNo(newPage);
    window.scrollTo(0, 0);
  };

  // Note: Price filtering is now done server-side via API
  const filteredProducts = products;

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <section style={{ padding: "4rem 0", backgroundColor: "#F8FAFC" }}>
        <div style={styles.container}>
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              backgroundColor: "#fff",
              borderRadius: "0.75rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}>
            <h2
              style={{
                fontSize: "2.25rem",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}>
              Đăng nhập để xem sản phẩm 🔐
            </h2>
            <p
              style={{
                fontSize: "1.125rem",
                color: "#6c757d",
                marginBottom: "2rem",
              }}>
              Vui lòng đăng nhập để xem và mua sắm sản phẩm.
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
              }}>
              <button
                onClick={() => setCurrentPage("login")}
                style={{
                  ...styles.buttonPrimary,
                  padding: "1rem 2rem",
                  fontSize: "1.125rem",
                }}>
                Đăng nhập
              </button>
              <button
                onClick={() => setCurrentPage("register")}
                style={{
                  ...styles.buttonSecondary,
                  padding: "1rem 2rem",
                  fontSize: "1.125rem",
                }}>
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (loading && products.length === 0) {
    return (
      <section style={{ padding: "4rem 0", backgroundColor: "#F8FAFC" }}>
        <div style={styles.container}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "50vh",
            }}>
            <LoadingSpinner />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "4rem 0", backgroundColor: "#F8FAFC" }}>
      <div style={styles.container}>
        {/* Breadcrumb và Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}>
          <h2 style={{ fontSize: "2.25rem", fontWeight: "bold" }}>
            Cửa hàng sản phẩm công nghệ
          </h2>
          <div style={{ color: "#6c757d" }}>
            <button
              onClick={() => setCurrentPage("home")}
              style={{ ...styles.navLink, color: "#2563EB", padding: 0 }}>
              Trang chủ
            </button>{" "}
            /<span> Cửa hàng</span>
          </div>
        </div>

        {/* Main Layout: Sidebar and Products */}
        <div style={styles.shopLayout}>
          {/* Sidebar (Modern Filters) */}
          <div style={styles.sidebar}>
            {/* Bộ lọc Danh mục */}
            <div style={styles.sidebarSection}>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  color: "#333",
                }}>
                Lọc theo danh mục
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li>
                  <button
                    onClick={() => handleCategoryChange("All", null)}
                    style={filterButtonStyle(
                      selectedCategory === "Tất cả" ||
                      selectedCategory === "All" ||
                      (!selectedCategory)
                    )}>
                    Tất cả
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.idCategory || cat.id}>
                    <button
                      onClick={() =>
                        handleCategoryChange(cat.categoryName || cat.name, cat.idCategory || cat.id)
                      }
                      style={filterButtonStyle(
                        selectedCategory === (cat.categoryName || cat.name) ||
                        selectedCategoryId === (cat.idCategory || cat.id)
                      )}>
                      {cat.categoryName || cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bộ lọc Brand */}
            {brands.length > 0 && (
              <div style={styles.sidebarSection}>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                    color: "#333",
                  }}>
                  Lọc theo thương hiệu
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  <li>
                    <button
                      onClick={() => handleBrandChange("Tất cả")}
                      style={filterButtonStyle(
                        selectedBrand === "" ||
                        selectedBrand === "All" ||
                        selectedBrand === "Tất cả"
                      )}>
                      Tất cả
                    </button>
                  </li>
                  {brands.map((brand) => (
                    <li key={brand}>
                      <button
                        onClick={() => handleBrandChange(brand)}
                        style={filterButtonStyle(selectedBrand === brand)}>
                        {brand}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bộ lọc Giá (Input Min/Max) */}
            <div style={styles.sidebarSection}>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  color: "#333",
                }}>
                Lọc theo giá
              </h3>
              <div
                style={{
                  padding: "0.5rem 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}>
                <div>
                  <label
                    style={{
                      fontSize: "0.875rem",
                      color: "#495057",
                      marginBottom: "0.25rem",
                      display: "block",
                    }}>
                    Giá tối thiểu (₫)
                  </label>
                  <input
                    ref={minPriceInputRef}
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minPrice}
                    onChange={handleMinPriceChange}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #E2E8F0",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.875rem",
                      color: "#495057",
                      marginBottom: "0.25rem",
                      display: "block",
                    }}>
                    Giá tối đa (₫)
                  </label>
                  <input
                    ref={maxPriceInputRef}
                    type="number"
                    min="0"
                    placeholder={formatPrice(maxPriceForDisplay)}
                    value={maxPrice}
                    onChange={handleMaxPriceChange}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #E2E8F0",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
                {(minPrice || maxPrice) && (
                  <button
                    onClick={handleClearPriceFilter}
                    style={{
                      padding: "0.5rem",
                      backgroundColor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      color: "#6c757d",
                    }}>
                    Xóa bộ lọc giá
                  </button>
                )}
              </div>
            </div>

            {/* Flash Sale - Products On Sale */}
            {productsOnSale.length > 0 && (
              <div style={styles.sidebarSection}>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                    color: "#dc3545",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}>
                  🔥 Flash Sale
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}>
                  {productsOnSale.map((product) => (
                    <div
                      key={product.productId}
                      style={{
                        ...styles.latestProductItem,
                        cursor: "pointer",
                        backgroundColor: "#fff5f5",
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        border: "1px solid #ffe0e0",
                      }}
                      onClick={() =>
                        handleViewProductDetail(product.productId)
                      }>
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          backgroundColor: "#fff",
                          borderRadius: "0.5rem",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                          overflow: "hidden",
                          position: "relative",
                        }}>
                        {product.image ? (
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain", // changed cover to contain to fit images better
                            }}
                          />
                        ) : (
                          "📦"
                        )}
                        {/* Discount badge */}
                        {product.discountLabel && (
                          <span
                            style={{
                              position: "absolute",
                              top: "-4px",
                              right: "-4px",
                              backgroundColor: "#dc3545",
                              color: "#fff",
                              fontSize: "0.6rem",
                              fontWeight: "bold",
                              padding: "2px 4px",
                              borderRadius: "4px",
                            }}>
                            {product.discountLabel}
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            color: "#212529",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {product.name}
                        </h4>
                        <div style={{ marginTop: "0.25rem" }}>
                          <span
                            style={{
                              color: "#dc3545",
                              fontWeight: "bold",
                              fontSize: "0.875rem",
                            }}>
                            {formatPrice(product.discountedPrice)}
                          </span>
                          <span
                            style={{
                              color: "#999",
                              fontSize: "0.75rem",
                              textDecoration: "line-through",
                              marginLeft: "0.5rem",
                            }}>
                            {formatPrice(product.originalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sản phẩm mới nhất */}
            {latestProducts.length > 0 && (
              <div style={{ ...styles.sidebarSection, borderBottom: "none" }}>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                  }}>
                  Mua gần đây
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}>
                  {latestProducts.map((product) => {
                    const imageUrl = getLatestProductImage(product);
                    return (
                      <div
                        key={product.idProduct || product.id}
                        style={{
                          ...styles.latestProductItem,
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          handleViewProductDetail(
                            product.idProduct || product.id
                          )
                        }>
                        <div
                          style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "#e9ecef",
                            borderRadius: "0.25rem",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.5rem",
                            overflow: "hidden",
                          }}>
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.productName || product.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            "📦"
                          )}
                        </div>
                        <div>
                          <h4
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: "600",
                              color: "#212529",
                            }}>
                            {product.productName || product.name}
                          </h4>
                          <p
                            style={{
                              color: "#28a745",
                              fontWeight: "bold",
                              fontSize: "0.875rem",
                            }}>
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Vùng hiển thị Sản phẩm */}
          <div>
            {/* Toolbar trên lưới sản phẩm */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                padding: "1rem",
                backgroundColor: "white",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
              <p style={{ color: "#495057", fontWeight: "500" }}>
                Hiển thị {filteredProducts.length} trong tổng số {totalElements}{" "}
                sản phẩm
              </p>

              {/* Sorting Dropdown */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}>
                <span style={{ fontSize: "0.875rem", color: "#6c757d" }}>
                  Sắp xếp theo:
                </span>
                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    setPageNo(1);
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #E2E8F0",
                    borderRadius: "0.375rem",
                    outline: "none",
                    cursor: "pointer",
                  }}>
                  <option value="default">Mới nhất</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                  <option value="rating-desc">Đánh giá cao nhất</option>
                  <option value="reviews-desc">Nhiều đánh giá nhất</option>
                </select>
              </div>

              {/* View Toggles */}
              <div style={{ display: "flex", gap: "0.5rem", color: "#6c757d" }}>
                <Grid3X3
                  size={20}
                  style={{ cursor: "pointer", color: "#2563EB" }}
                />
                <List size={20} style={{ cursor: "pointer" }} />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: "1rem",
                  marginBottom: "1.5rem",
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  borderRadius: "0.5rem",
                }}>
                {error}
              </div>
            )}

            {/* Lưới sản phẩm */}
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "30vh",
                }}>
                <LoadingSpinner />
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "1.5rem",
                }}>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductCard
                      key={product.idProduct || product.id}
                      product={product}
                      handleAddToCart={handleAddToCart}
                      handleViewProductDetail={handleViewProductDetail}
                    />
                  ))
                ) : (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      padding: "3rem",
                      backgroundColor: "#fff",
                      borderRadius: "0.5rem",
                      border: "1px solid #E2E8F0",
                    }}>
                    <p style={{ color: "#6c757d", fontSize: "1.125rem" }}>
                      Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginTop: "3rem",
                }}>
                <button
                  onClick={() => handlePageChange(pageNo - 1)}
                  disabled={pageNo === 1}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #E2E8F0",
                    borderRadius: "0.25rem",
                    backgroundColor: pageNo === 1 ? "#e9ecef" : "#fff",
                    cursor: pageNo === 1 ? "not-allowed" : "pointer",
                    opacity: pageNo === 1 ? 0.5 : 1,
                  }}>
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (pageNo <= 3) {
                    pageNumber = i + 1;
                  } else if (pageNo >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = pageNo - 2 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      style={{
                        padding: "0.5rem 1rem",
                        border:
                          pageNo === pageNumber
                            ? "1px solid #2563EB"
                            : "1px solid #E2E8F0",
                        borderRadius: "0.25rem",
                        backgroundColor:
                          pageNo === pageNumber ? "#2563EB" : "#fff",
                        color: pageNo === pageNumber ? "white" : "#495057",
                        cursor: "pointer",
                      }}>
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pageNo + 1)}
                  disabled={pageNo === totalPages}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #E2E8F0",
                    borderRadius: "0.25rem",
                    backgroundColor: pageNo === totalPages ? "#e9ecef" : "#fff",
                    cursor: pageNo === totalPages ? "not-allowed" : "pointer",
                    opacity: pageNo === totalPages ? 0.5 : 1,
                  }}>
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopPage;
