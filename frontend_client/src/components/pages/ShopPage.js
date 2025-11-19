// src/components/pages/ShopPage.js
import React, { useState, useEffect } from "react";
import styles from "../../styles/styles";
import ProductCard from "../shared/ProductCard";
import LoadingSpinner from "../common/LoadingSpinner";
import { productsService } from "../../services/productsService";
import { categoriesService } from "../../services/categoriesService";
import { formatPrice } from "../../utils/formatUtils";
import { Grid3X3, List } from "lucide-react";

const ShopPage = ({
  selectedCategory,
  setSelectedCategory,
  handleAddToCart,
  handleViewProductDetail,
  sortOption,
  setSortOption,
  setCurrentPage,
  searchTerm,
}) => {
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

  // Style cho nút Category Filter
  const filterButtonStyle = (isActive) => ({
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    border: isActive ? "1px solid #007bff" : "1px solid #dee2e6",
    backgroundColor: isActive ? "#e0f7ff" : "white",
    color: isActive ? "#007bff" : "#495057",
    fontWeight: isActive ? "600" : "normal",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    transition: "all 0.3s",
    marginBottom: "0.25rem",
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoriesService.getAll();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brandsData = await productsService.getAllBrands();
        setBrands(brandsData || []);
      } catch (error) {
        console.error("Error fetching brands:", error);
        setBrands([]);
      }
    };

    fetchBrands();
  }, []);

  // Reset to first page when search term changes
  useEffect(() => {
    setPageNo(1);
  }, [searchTerm]);

  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Map sortOption to API parameters
        let sortBy = "idProduct";
        let sortDirection = "ASC";

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
            sortBy = "rating";
            sortDirection = "DESC";
            break;
          case "reviews-desc":
            sortBy = "reviewCount";
            sortDirection = "DESC";
            break;
          default:
            sortBy = "idProduct";
            sortDirection = "DESC"; // Newest first
        }

        // Determine which API to call
        let productsData;
        const categoryId =
          selectedCategory && selectedCategory !== "All"
            ? categories.find(
                (cat) => (cat.categoryName || cat.name) === selectedCategory
              )?.idCategory
            : null;

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
        } else if (minPrice || maxPrice) {
          // Filter by price range
          productsData = await productsService.getProductsByPriceRange({
            minPrice: minPrice ? parseInt(minPrice) : 0,
            maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
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

        setProducts(productsData?.content || []);
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
    pageNo,
    sortOption,
    selectedCategory,
    searchTerm,
    selectedBrand,
    minPrice,
    maxPrice,
    categories,
  ]);

  // Fetch latest products for sidebar
  useEffect(() => {
    const fetchLatestProducts = async () => {
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
  }, []);

  const handleMinPriceChange = (e) => {
    setMinPrice(e.target.value);
    setPageNo(1); // Reset to first page when filter changes
  };

  const handleMaxPriceChange = (e) => {
    setMaxPrice(e.target.value);
    setPageNo(1); // Reset to first page when filter changes
  };

  const handleClearPriceFilter = () => {
    setMinPrice("");
    setMaxPrice("");
    setPageNo(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
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

  if (loading && products.length === 0) {
    return (
      <section style={{ padding: "4rem 0", backgroundColor: "#f8f8f8" }}>
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
    <section style={{ padding: "4rem 0", backgroundColor: "#f8f8f8" }}>
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
              style={{ ...styles.navLink, color: "#007bff", padding: 0 }}>
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
                    onClick={() => handleCategoryChange("Tất cả")}
                    style={filterButtonStyle(
                      selectedCategory === "Tất cả" ||
                        selectedCategory === "All"
                    )}>
                    Tất cả
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.idCategory || cat.id}>
                    <button
                      onClick={() =>
                        handleCategoryChange(cat.categoryName || cat.name)
                      }
                      style={filterButtonStyle(
                        selectedCategory === (cat.categoryName || cat.name)
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
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minPrice}
                    onChange={handleMinPriceChange}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #dee2e6",
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
                    type="number"
                    min="0"
                    placeholder={formatPrice(maxPriceForDisplay)}
                    value={maxPrice}
                    onChange={handleMaxPriceChange}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #dee2e6",
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
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #dee2e6",
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

            {/* Sản phẩm mới nhất */}
            {latestProducts.length > 0 && (
              <div style={{ ...styles.sidebarSection, borderBottom: "none" }}>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                  }}>
                  Latest Additions
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}>
                  {latestProducts.map((product) => (
                    <div
                      key={product.idProduct || product.id}
                      style={{ ...styles.latestProductItem, cursor: "pointer" }}
                      onClick={() =>
                        handleViewProductDetail(product.idProduct || product.id)
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
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
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
                  ))}
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
                    border: "1px solid #ccc",
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
                  style={{ cursor: "pointer", color: "#007bff" }}
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
                      border: "1px solid #dee2e6",
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
                    border: "1px solid #ccc",
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
                            ? "1px solid #007bff"
                            : "1px solid #ccc",
                        borderRadius: "0.25rem",
                        backgroundColor:
                          pageNo === pageNumber ? "#007bff" : "#fff",
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
                    border: "1px solid #ccc",
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
