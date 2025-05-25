
// File: components/ProductCard.jsx
import React from 'react';

function ProductCard({ product, addToCart }) {
  return (
    <div className="border p-4 rounded-lg shadow hover:shadow-md">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded mb-2"
      />
      <h2 className="text-lg font-semibold mb-1">{product.name}</h2>
      <p className="text-gray-700 mb-2">${product.price}</p>
      <button
        onClick={() => addToCart(product.id)}
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
      >
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;
