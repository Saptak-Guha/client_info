import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, BarChart3, RefreshCw, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';
import './App.css'; // Assuming you have a CSS file for styles
const API_BASE = 'http://localhost:5000/api';

const App = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modelsReady, setModelsReady] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [training, setTraining] = useState(false);
  const [highlightFilter, setHighlightFilter] = useState(null);

  const trainModels = async () => {
    setTraining(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        setModelsReady(true);
        await fetchProducts();
      } else {
        setError(data.error || 'Failed to train models');
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure Flask backend is running.');
    } finally {
      setTraining(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/products`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (current, safety, restock) => {
    if (current <= safety) return { status: 'critical', className: 'stock-critical' };
    if (restock > 0) return { status: 'low', className: 'stock-low' };
    return { status: 'good', className: 'stock-good' };
  };

  const getPerformanceColor = (score) => {
    if (score >= 8) return 'performance-good';
    if (score >= 6) return 'performance-medium';
    return 'performance-poor';
  };

const scrollToProducts = (filterType) => {
  setHighlightFilter(filterType);

  // give React a tick to apply the “highlighted-row” class
  setTimeout(() => {
    const firstHighlighted = document.querySelector('.highlighted-row');
    if (firstHighlighted) {
      firstHighlighted.scrollIntoView({
        behavior: 'smooth',
        block: 'center',   // or "start" if you prefer
      });
    }
  }, 50);

  // clear the highlight after a few seconds
  setTimeout(() => {
    setHighlightFilter(null);
  }, 8000);
};


  const shouldHighlightRow = (product) => {
    if (highlightFilter === 'restock') {
      return product.restock_amount > 0;
    }
    if (highlightFilter === 'critical') {
      return product.current_stock <= product.safety_stock;
    }
    return false;
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <Package size={24} />
            </div>
            <div className="header-text">
              <h1>Inventory Management</h1>
              <p>Performance tracking & restock predictions</p>
            </div>
          </div>
          <button
            onClick={trainModels}
            disabled={training}
            className={`train-button ${training ? 'training' : ''}`}
          >
            <RefreshCw size={16} className={training ? 'spinning' : ''} />
            <span>{training ? 'Training...' : 'Train Models'}</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        {/* Error Alert */}
        {error && (
          <div className="error-alert">
            <div className="error-content">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Welcome Message */}
        {!modelsReady && !training && (
          <div className="welcome-section">
            <div className="welcome-icon">
              <BarChart3 size={32} />
            </div>
            <h3>Welcome to Inventory Management</h3>
            <p>Click "Train Models" to analyze your data and get predictions</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-section">
            <RefreshCw size={32} className="spinning" />
            <p>Loading products...</p>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 && (
          <>
            {/* Summary Cards */}
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-content">
                  <div className="summary-text">
                    <p className="summary-label">Total Products</p>
                    <p className="summary-value">{products.length}</p>
                  </div>
                  <Package size={32} className="summary-icon" />
                </div>
              </div>
              
              <div className="summary-card clickable-card" onClick={() => scrollToProducts('restock')}>
                <div className="summary-content">
                  <div className="summary-text">
                    <p className="summary-label">Need Restock</p>
                    <p className="summary-value restock-needed">
                      {products.filter(p => p.restock_amount > 0).length}
                    </p>
                  </div>
                  <AlertTriangle size={32} className="summary-icon restock-icon" />
                </div>
              </div>

              <div className="summary-card clickable-card" onClick={() => scrollToProducts('critical')}>
                <div className="summary-content">
                  <div className="summary-text">
                    <p className="summary-label">Critical Stock</p>
                    <p className="summary-value critical-stock">
                      {products.filter(p => p.current_stock <= p.safety_stock).length}
                    </p>
                  </div>
                  <Target size={32} className="summary-icon critical-icon" />
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-content">
                  <div className="summary-text">
                    <p className="summary-label">Avg Performance</p>
                    <p className="summary-value performance-avg">
                      {(products.reduce((sum, p) => sum + p.performance_score, 0) / products.length).toFixed(1)}
                    </p>
                  </div>
                  <TrendingUp size={32} className="summary-icon performance-icon" />
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="products-table-container">
              <div className="table-header">
                <h2>Product Analysis</h2>
              </div>
              
              <div className="table-wrapper">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Stock Status</th>
                      <th>Performance</th>
                      <th>Restock Amount</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const stockStatus = getStockStatus(product.current_stock, product.safety_stock, product.restock_amount);
                      return (
                        <tr key={product.product_id} className={`table-row ${shouldHighlightRow(product) ? 'highlighted-row' : ''}`}>
                          <td>
                            <div className="product-cell">
                              <div className="product-icon">
                                <Package size={16} />
                              </div>
                              <div className="product-info">
                                <div className="product-id">{product.product_id}</div>
                                <div className="product-price">${product.price}</div>
                              </div>
                            </div>
                          </td>
                          
                          <td>
                            <div className={`stock-badge ${stockStatus.className}`}>
                              {stockStatus.status === 'critical' && <AlertTriangle size={12} />}
                              {stockStatus.status === 'good' && <CheckCircle size={12} />}
                              {stockStatus.status === 'low' && <Clock size={12} />}
                              {product.current_stock} / {product.safety_stock}
                            </div>
                          </td>
                          
                          <td>
                            <div className="performance-cell">
                              <div className={`performance-score ${getPerformanceColor(product.performance_score)}`}>
                                {product.performance_score}/10
                              </div>
                              <div className="performance-details">
                                ★{product.avg_rating} • {product.units_sold} sold
                              </div>
                            </div>
                          </td>
                          
                          <td>
                            <div className="restock-cell">
                              {product.restock_amount > 0 ? (
                                <span className="restock-amount">+{product.restock_amount}</span>
                              ) : (
                                <span className="restock-ok">✓ OK</span>
                              )}
                            </div>
                            {product.in_transit > 0 && (
                              <div className="in-transit">
                                {product.in_transit} in transit
                              </div>
                            )}
                          </td>
                          
                          <td>
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className="details-button"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Product Details - {selectedProduct.product_id}</h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="modal-close"
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                <div className="details-grid">
                  <div className="details-section">
                    <h4>Inventory Status</h4>
                    <div className="details-list">
                      <div className="detail-row">
                        <span className="detail-label">Current Stock:</span>
                        <span className="detail-value">{selectedProduct.current_stock}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Safety Stock:</span>
                        <span className="detail-value">{selectedProduct.safety_stock}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">In Transit:</span>
                        <span className="detail-value">{selectedProduct.in_transit}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Lead Time:</span>
                        <span className="detail-value">{selectedProduct.lead_time} days</span>
                      </div>
                      <div className="detail-row highlight">
                        <span className="detail-label">Restock Amount:</span>
                        <span className={`detail-value ${selectedProduct.restock_amount > 0 ? 'restock-needed' : 'restock-ok'}`}>
                          {selectedProduct.restock_amount > 0 ? `+${selectedProduct.restock_amount}` : 'No restock needed'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="details-section">
                    <h4>Performance Metrics</h4>
                    <div className="details-list">
                      <div className="detail-row">
                        <span className="detail-label">Performance Score:</span>
                        <span className={`detail-value ${getPerformanceColor(selectedProduct.performance_score)}`}>
                          {selectedProduct.performance_score}/10
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Average Rating:</span>
                        <span className="detail-value">★{selectedProduct.avg_rating}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Units Sold:</span>
                        <span className="detail-value">{selectedProduct.units_sold.toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Return Rate:</span>
                        <span className="detail-value">{selectedProduct.return_rate}%</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Price:</span>
                        <span className="detail-value">${selectedProduct.price}</span>
                      </div>
                      <div className="detail-row highlight">
                        <span className="detail-label">Forecasted Demand:</span>
                        <span className="detail-value">{selectedProduct.forecasted_demand}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;