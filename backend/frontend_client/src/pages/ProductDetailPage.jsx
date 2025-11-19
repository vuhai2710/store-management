import React from 'react'
import { useParams } from 'react-router-dom'
import ProductRecommendations from '../components/ProductRecommendations'
import './ProductDetailPage.css'

const ProductDetailPage = () => {
  const { id } = useParams()

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <h1>Chi tiết sản phẩm #{id}</h1>
        <p>Trang chi tiết sản phẩm - Đang phát triển</p>
      </div>

      {/* Sản phẩm tương tự */}
      <ProductRecommendations 
        productId={parseInt(id)}
        limit={5}
        title="Sản phẩm tương tự"
      />
    </div>
  )
}

export default ProductDetailPage

