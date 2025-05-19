import React, { useState, useEffect } from 'react';
import './App.css';
import ChatWindow from './ChatWindow'; 

function App() {
  const [activeChat, setActiveChat] = useState(null);
  const [formData, setFormData] = useState({ name: '', password: '', pan: '', email: '', phone: '' });
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = 'http://127.0.0.1:8000/clients/';

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(apiUrl, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(formData) });
      await fetchClients();
      setFormData({ name: '', password: '', pan: '', email: '', phone: '' });
    } finally { setLoading(false); }
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      setClients(data);
      setFilteredClients(data);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(apiUrl, { method: 'DELETE', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ _ids: selectedIds }) });
      setSelectedIds([]);
      setDeleteMode(false);
      await fetchClients();
    } finally { setLoading(false); }
  };

  const handleUpdate = async client => {
    setLoading(true);
    try {
      await fetch(apiUrl, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(client) });
      setEditingClient(null);
      await fetchClients();
    } finally { setLoading(false); }
  };

  const handleSearch = e => {
    e.preventDefault();
    setFilteredClients(clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())));
  };

  useEffect(() => { fetchClients(); }, []);

  return (
    <div className="container">
      <h1 className="title">Client Manager ✨</h1>

      <form onSubmit={handleSubmit} className="form">
        <h2>Add New Client</h2>
        {['name','password','pan','email','phone'].map(f => (
          <input
            key={f}
            type={f === 'password' ? 'password' : 'text'}
            name={f}
            placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
            value={formData[f]}
            onChange={handleChange}
            required
          />
        ))}
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Client'}
        </button>
      </form>

      <div className="controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn primary">Search</button>
          <button type="button" onClick={() => { setSearchTerm(''); fetchClients(); }} className="btn secondary">
            Clear
          </button>
        </form>
        <div className="actions">
          <button onClick={fetchClients} className="btn primary">Refresh</button>
          <button onClick={() => setDeleteMode(!deleteMode)} className="btn danger">
            {deleteMode ? 'Cancel' : 'Delete'}
          </button>
          {deleteMode && (
            <button onClick={handleDelete} className="btn danger" disabled={!selectedIds.length}>
              Delete ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      <div className="clients-grid">
        {filteredClients.map(client => (
          <div key={client._id} className="card">
            {deleteMode && (
              <div className="checkbox">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(client._id)}
                  onChange={e => setSelectedIds(s => e.target.checked ? [...s, client._id] : s.filter(id => id !== client._id))}
                />
              </div>
            )}
            <div className="card-body">
              <div className="card-header">
                <h3>Name: {client.name}</h3> 
                <button className="btn edit" onClick={() => setEditingClient(client)}>Edit</button>
              </div>
              <p>🔒 Password: {client.password}</p>
              <p>📧 Email: {client.email}</p>
              <p>📱 Phone: {client.phone}</p>
              <p>🆔 PAN: {client.pan}</p>

              <button className="btn primary" onClick={() => setActiveChat(client._id)}>Chat</button>
            </div>
          </div>
        ))}
      </div>

      {editingClient && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Client</h2>
            <form onSubmit={e => { e.preventDefault(); handleUpdate(editingClient); }}>
              {Object.keys(editingClient).filter(f => f !== '_id').map(field => (
                <div key={field} className="form-group">
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    value={editingClient[field]}
                    onChange={e => setEditingClient(prev => ({ ...prev, [field]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="modal-actions">
                <button type="button" className="btn secondary" onClick={() => setEditingClient(null)}>Cancel</button>
                <button type="submit" className="btn primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )} 
      {/* only open this window after cliet ID pass then identify easy */}
        {activeChat && (
        <ChatWindow clientId={activeChat} onClose={() => setActiveChat(null)} />
        )}
    </div>

  );

}

export default App;