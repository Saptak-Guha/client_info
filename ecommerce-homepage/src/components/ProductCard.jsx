// ProductCard.jsx (fixed layout)
import React from 'react';

function ProductCard({ product, count, addToCart, reduceFromCart }) {
  return (
    <div className="product-card" style={{ 
      backgroundColor: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <div style={{ 
        height: '200px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f8ff'
      }}>
        <img
          src={product.image_url}
          alt={product.product_name}
          style={{ 
            width: '100%', 
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
      <div className="product-info" style={{ 
        padding: '1rem',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 className="product-name" style={{ 
          margin: '0 0 0.5rem',
          fontSize: '1.1rem',
          color: '#1976D2'
        }}>
          {product.product_name}
        </h2>
        <p className="product-category" style={{ 
          margin: '0 0 0.5rem',
          color: '#666',
          fontSize: '0.9rem'
        }}>
          {product.product_category}
        </p>
        <p className="product-quantity" style={{ 
          margin: '0 0 0.5rem',
          color: '#333'
        }}>
          Available: {product.quantity}
        </p>
        <p className="product-price" style={{ 
          margin: '0 0 1rem',
          fontWeight: 'bold',
          color: '#1976D2'
        }}>
          ${product.price}
        </p>

        <div style={{ marginTop: 'auto' }}>
          {count === 0 ? (
            <button
              onClick={() => addToCart(product._id)}
              className="add-button"
              style={{
                backgroundColor: '#1976D2',
                color: 'white',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '4px',
                width: '100%',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Add to Cart
            </button>
          ) : (
            <div className="quantity-control" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <button
                onClick={() => reduceFromCart(product._id)}
                className="qty-reduce-button"
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#1976D2',
                  border: '1px solid #1976D2',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                -
              </button>
              <span className="quantity-count" style={{
                fontWeight: 'bold',
                color: '#1976D2'
              }}>
                {count}
              </span>
              <button
                onClick={() => addToCart(product._id)}
                className="qty-add-button"
                style={{
                  backgroundColor: '#1976D2',
                  color: 'white',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>  
  );
}

export default ProductCard;