# Hướng dẫn thêm text "Đã xem gần đây" cho 4 sản phẩm đầu

## Bước 1: Tìm file HomePage.js

File thường nằm tại: `frontend_client/src/components/pages/HomePage.js`

## Bước 2: Tìm phần hiển thị recommendedProducts

Tìm đoạn code có dạng:
```javascript
{recommendedProducts.length > 0 && (
  <div>
    <h2>Gợi ý dành cho bạn</h2>
    <div className="product-grid">
      {recommendedProducts.map((product) => (
        <ProductCard key={product.idProduct} product={product} />
      ))}
    </div>
  </div>
)}
```

## Bước 3: Thay thế bằng code sau:

```javascript
{/* Phần Gợi ý dành cho bạn */}
{recommendedProducts.length > 0 && (
  <div className="recommended-section" style={{ marginBottom: '40px' }}>
    {/* 4 sản phẩm đầu - Đã xem gần đây */}
    {recommendedProducts.slice(0, 4).length > 0 && (
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          color: '#333',
          paddingLeft: '10px'
        }}>
          Bạn đã xem các sản phẩm này gần đây
        </h2>
        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {recommendedProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.idProduct} product={product} />
          ))}
        </div>
      </div>
    )}
    
    {/* 6 sản phẩm sau - Gợi ý */}
    {recommendedProducts.slice(4).length > 0 && (
      <div>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          color: '#333',
          paddingLeft: '10px'
        }}>
          Gợi ý dành cho bạn
        </h2>
        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {recommendedProducts.slice(4).map((product) => (
            <ProductCard key={product.idProduct} product={product} />
          ))}
        </div>
      </div>
    )}
  </div>
)}
```

## Lưu ý:

- Đảm bảo `recommendedProducts` là một array
- 4 sản phẩm đầu sẽ hiển thị với text "Bạn đã xem các sản phẩm này gần đây"
- 6 sản phẩm sau sẽ hiển thị với text "Gợi ý dành cho bạn"

