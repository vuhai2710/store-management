
import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating }) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        style={{
          color: i < Math.floor(rating) ? '#facc15' : '#d1d5db',
          fill: i < Math.floor(rating) ? '#facc15' : 'none'
        }}
      />
    ))}
  </div>
);

export default StarRating;
