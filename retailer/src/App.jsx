import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShoppingCart, FaClock, FaHeadphones, FaRegHeart } from 'react-icons/fa';

const App = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [timeLeft, setTimeLeft] = useState({
    hours: 3,
    minutes: 23,
    seconds: 19
  });

  // Mock API call
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Replace with actual API endpoint
        const response = await axios.get('https://api.example.com/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Mock data
        setProducts([
          { id: 1, name: 'HAVIT HV-G92 Gamepad', price: 169, rating: 88 },
          { id: 2, name: 'AK-900 Wired Keyboard', price: 69, rating: 75 },
          // Add other products...
        ]);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = async (itemId) => {
    try {
      await axios.post('https://api.example.com/cart', {
        itemId,
        quantity: 1
      });
      setCart([...cart, itemId]);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleCheckout = async () => {
    try {
      await axios.post('https://api.example.com/checkout', { items: cart });
      alert('Checkout successful!');
      setCart([]);
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds === 0) {
          if (prev.minutes === 0) {
            if (prev.hours === 0) {
              clearInterval(timer);
              return prev;
            }
            return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
          }
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        }
        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="ecommerce-homepage">
      {/* Top Banner */}
      <div className="top-banner">
        <p>Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%! <span>ShopNow</span></p>
        <select defaultValue="English">
          <option>English</option>
        </select>
      </div>

      {/* Navigation */}
      <nav className="main-nav">
        <h1>Exclusive</h1>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/contact">Contact</a>
          <a href="/about">About</a>
          <a href="/signup">Sign Up</a>
        </div>
        <div className="nav-icons">
          <FaShoppingCart />
          <FaRegHeart />
          <span className="cart-count">{cart.length}</span>
        </div>
      </nav>

      {/* Flash Sales Section */}
      <section className="flash-sales">
        <div className="section-header">
          <h2>Flash Sales</h2>
          <div className="timer">
            <FaClock />
            <span>{timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s</span>
          </div>
        </div>
        
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {/* Add image here */}
              </div>
              <h3>{product.name}</h3>
              <p>${product.price}</p>
              <div className="product-rating">({product.rating})</div>
              <button onClick={() => addToCart(product.id)}>Add to Cart</button>
            </div>
          ))}
        </div>
      </section>

      {/* Checkout Section */}
      <div className="checkout-section">
        <button className="checkout-button" onClick={handleCheckout}>
          Proceed to Checkout ({cart.length} items)
        </button>
      </div>

      {/* Add other sections (Categories, Best Selling, etc.) following similar patterns */}
    </div>
  );
};

export default App;