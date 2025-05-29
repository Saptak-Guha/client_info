import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/clients/api/products/')
      .then(response => setProducts(response.data))
      .catch(error => console.error('Failed to fetch products:', error));
  }, []);

  const addToCart = (productId) => {
    const existing = cart.find(item => item.id === productId);
    let updatedCart;

    if (existing) {
      updatedCart = cart.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cart, { id: productId, quantity: 1 }];
    }

    setCart(updatedCart);
    const productInCart = updatedCart.find(item => item.id === productId);

  };

  const reduceFromCart = (productId) => {
    const existing = cart.find(item => item.id === productId);
    if (!existing) return;

    let updatedCart;
    if (existing.quantity === 1) {
      updatedCart = cart.filter(item => item.id !== productId);
    } else {
      updatedCart = cart.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    }

    setCart(updatedCart);

    const productInCart = updatedCart.find(item => item.id === productId);
};

  const checkout = () => {
    axios.post('http://127.0.0.1:8000/clients/api/checkout/', {
      items: cart
    })
    .then(() => {
      axios.get('http://127.0.0.1:8000/clients/api/products/')
        .then(response => setProducts(response.data));
      setCart([]);
      alert('Checkout successful!');
    })
    .catch(error => {
      console.error('Checkout failed:', error);
    });
  };

  return (
    <div className="homepage">
      <h1 className="homepage-title">Explore Our Products</h1>
      <div className="product-grid">
        {products.map(product => {
          const itemInCart = cart.find(item => item.id === product._id);
          const quantity = itemInCart ? itemInCart.quantity : 0;

          return (
            <ProductCard
              key={product._id}
              product={product}
              count={quantity}
              addToCart={addToCart}
              reduceFromCart={reduceFromCart}
            />
          );
        })}
      </div>
      <div className="checkout-section">
        <button onClick={checkout} className="checkout-button">
          Checkout
        </button>
      </div>
    </div>
  );
}

export default HomePage;
