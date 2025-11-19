import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import HomePageComplete from './pages/HomePageComplete'
import ProductDetailPage from './pages/ProductDetailPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Trang chủ đơn giản */}
          <Route path="/simple" element={<HomePage />} />
          {/* Trang chủ hoàn chỉnh với design đẹp */}
          <Route path="/" element={<HomePageComplete />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

