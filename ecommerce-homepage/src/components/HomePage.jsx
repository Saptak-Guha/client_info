// File: components/HomePage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/products')
      .then(response => setProducts(response.data))
      .catch(error => console.error('Failed to fetch products:', error));
  }, []);

  const addToCart = (productId) => {
    const existing = cart.find(item => item.id === productId);
    const updatedCart = existing
      ? cart.map(item =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        )
      : [...cart, { id: productId, quantity: 1 }];

    setCart(updatedCart);

    axios.post('https://api.example.com/add-to-cart', {
      itemId: productId,
      quantity: 1,
    })
    .catch(error => console.error('Failed to add to cart:', error));
  };

  const checkout = () => {
    axios.post('https://api.example.com/checkout', {
      items: cart
    })
    .then(() => {
      alert('Checkout successful!');
      setCart([]);
    })
    .catch(error => console.error('Checkout failed:', error));
  };

  return (
    <div className="px-6 py-4">
      <h1 className="text-3xl font-bold mb-6">Explore Our Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} addToCart={addToCart} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <button
          onClick={checkout}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}

export default HomePage;
