import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './components/ProductCard';
import Chat from './components/Chat';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeView, setActiveView] = useState('products');
  const [clientId, setClientId] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const clientIdParam = queryParams.get('clientId');
    
    if (clientIdParam) {
      localStorage.setItem('clientId', clientIdParam);
      setClientId(clientIdParam);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const savedClientId = localStorage.getItem('clientId');
      if (savedClientId) setClientId(savedClientId);
    }
  }, []);

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

  const fetchAccountDetails = async () => {
    if (!clientId) return;
    
    try {
      const response = await fetch(`http://localhost:8000/clients/?id=${clientId}`);
      const data = await response.json();
      
      if (data.length > 0) {
        setAccountDetails(data[0]);
        setFormData(data[0]);
      }
    } catch (err) {
      console.error("Error fetching account:", err);
    }
  };

  const handleUpdateAccount = async () => {
    try {
      const response = await fetch(`http://localhost:8000/clients/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setAccountDetails(updatedData);
        setEditMode(false);
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="app">
      {/* Fixed Top Navigation */}
      <nav className="main-nav">
        <h1 style={{ margin: 0 }}>Exclusive Store</h1>
        
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ 
              backgroundColor: 'white',
              color: '#1976D2',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            My Profile
          </button>
          
          {showDropdown && (
            <div className="profile-dropdown">
              <button 
                onClick={() => {
                  fetchAccountDetails();
                  setActiveView('account');
                  setShowDropdown(false);
                }}
              >
                My Account
              </button>
              <button 
                onClick={() => {
                  setActiveView('orders');
                  setShowDropdown(false);
                }}
              >
                Orders
              </button>
              <button 
                onClick={() => {
                  setActiveView('chat');
                  setShowDropdown(false);
                }}
              >
                Chat
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="content-container">
        {activeView === 'products' && (
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
                Checkout ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)
              </button>
            </div>
          </div>
        )}
        
        {activeView === 'account' && accountDetails && (
          <div className="account-view">
            <h2>Account Details</h2>
            
            {!editMode ? (
              <div>
                <p><strong>Name:</strong> {accountDetails.name}</p>
                <p><strong>Email:</strong> {accountDetails.email}</p>
                <p><strong>Phone:</strong> {accountDetails.phone}</p>
                <p><strong>Company:</strong> {accountDetails.company}</p>
                <p><strong>PAN:</strong> {accountDetails.pan}</p>
                <p><strong>GSTR:</strong> {accountDetails.gstr}</p>
                <button 
                  onClick={() => setEditMode(true)}
                  className="edit-button"
                >
                  Edit
                </button>
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Company:</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>PAN:</label>
                  <input
                    type="text"
                    name="pan"
                    value={formData.pan || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>GSTR:</label>
                  <input
                    type="number"
                    name="gstr"
                    value={formData.gstr || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    onClick={handleUpdateAccount}
                    className="save-button"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setEditMode(false)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeView === 'orders' && (
          <div className="orders-view">
            <h2>Your Orders</h2>
            <p>No orders found</p>
          </div>
        )}
        
        {activeView === 'chat' && clientId && (
          <div className="chat-view">
            <Chat clientId={clientId} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;