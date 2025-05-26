// ProductCard.jsx
import React from 'react';

function ProductCard({ product, count, addToCart }) {
  return (
    <div className="border p-4 rounded-lg shadow hover:shadow-md bg-white text-black flex items-center space-x-4">
      <img
        src={product.image_url}
        alt={product.product_name}
        className="w-10 h-10 object-cover rounded"
        style={{ maxWidth: '150px', maxHeight: '150px' }}/>
      <div className="flex-1">
        <h2 className="text-md font-semibold">{product.product_name}</h2>
        <p className="text-gray-700">Available: {product.quantity}</p>
      </div>
      <button
        onClick={() => addToCart(product._id)}
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center"
      >
        Add to Cart
        {count > 0 && (
          <span className="ml-2 bg-white text-blue-600 px-2 rounded-full text-sm"> :  {count}</span>
        )}
      </button>
    </div>
  );
}

export default ProductCard;
