/**
 * Custom Hook để lấy sản phẩm gợi ý
 * Sử dụng: const { recommendations, loading } = useRecommendations(6)
 */

import { useEffect, useState } from 'react'
import axios from 'axios'

const useRecommendations = (limit = 6) => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
        
        const response = await axios.get(
          `http://localhost:8080/api/v1/products/recommendations/home?limit=${limit}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json'
            }
          }
        )
        
        console.log('[API] -> GET http://localhost:8080/api/v1/products/recommendations/home?limit=' + limit)
        console.log('[API] <-', response.status, '/products/recommendations/home', response.data)
        
        if (response.data && response.data.code === 200 && response.data.data) {
          setRecommendations(response.data.data)
          console.log('[API] Recommendations loaded:', response.data.data.length, 'products')
        } else {
          console.warn('[API] No recommendations data')
        }
      } catch (err) {
        console.error('[API] Error loading recommendations:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [limit])

  return { recommendations, loading, error }
}

export default useRecommendations

