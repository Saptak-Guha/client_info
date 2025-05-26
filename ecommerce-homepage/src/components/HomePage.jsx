// HomePage.jsx
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

    // Send current quantity of this product to API
    const productInCart = updatedCart.find(item => item.id === productId);

    axios.post('https://api.example.com/add-to-cart', {
      itemId: productId,
      quantity: productInCart.quantity,
    })
    .catch(error => console.error('Failed to add to cart:', error));
  };

  const checkout = () => {
  axios.post('http://127.0.0.1:8000/clients/api/checkout/', {
    items: cart
  })
  .then(response => {
    // response.data contains updated products with new quantities
    setProducts(response.data);  //updated state
    setCart([]);                // clear the cart after successful
    alert('Checkout successful!');
  })
  .catch(error => {
    console.error('Checkout failed:', error);
  });
};


  return (
    <div className="px-6 py-4 bg-black min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">
        Explore Our Products
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => {
          // find quantity in cart or 0
          const itemInCart = cart.find(item => item.id === product._id);
          const quantity = itemInCart ? itemInCart.quantity : 0;

          return (
            <ProductCard
              key={product._id}
              product={product}
              count={quantity}
              addToCart={addToCart}
            />
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={checkout}
          className="bg-white text-black py-2 px-4 rounded hover:bg-gray-300 transition"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}

export default HomePage;
