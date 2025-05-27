import React from 'react';

function ProductCard({ product, count, addToCart, reduceFromCart }) {
  return (
    <div className="product-card">
      <img
        src={product.image_url}
        alt={product.product_name}
        className="product-image"
      />
      <div className="product-info">
        <h2 className="product-name">{product.product_name}</h2>
        <p className="product-quantity">Available: {product.quantity}</p>

        {count === 0 ? (
  <button
    onClick={() => addToCart(product._id)}
    className="add-button"
  >
    Add to Cart
  </button>
) : (
  <div className="quantity-control">
    <button
      onClick={() => reduceFromCart(product._id)}
      className="qty-reduce-button"
    >
      -
    </button>
    <span className="quantity-count">{count}</span>
    <button
      onClick={() => addToCart(product._id)}
      className="qty-add-button"
    >
      +
    </button>
  </div>
        )}
      </div>
    </div>  
  );
}

export default ProductCard;
