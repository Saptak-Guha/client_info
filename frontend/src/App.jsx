import React, { useState, useEffect } from 'react';
import './App.css';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    pan: '',
    email: '',
    phone: '',
  });

  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const apiUrl = 'http://127.0.0.1:8000/clients/';

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    fetchClients();
  };

  const fetchClients = async () => {
    const res = await fetch(apiUrl);
    const data = await res.json();
    setClients(data);
    setFilteredClients(data);
  };

  const handleDelete = async () => {
    await fetch(apiUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ names: selectedClients }),
    });
    setSelectedClients([]);
    setDeleteMode(false);
    fetchClients();
  };

  const handleSearch = () => {
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="container">
      <h1>Client Manager</h1>

      <form onSubmit={handleSubmit} className="form">
        {['name', 'password', 'pan', 'email', 'phone'].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            placeholder={field.toUpperCase()}
            value={formData[field]}
            onChange={handleChange}
            required
          />
        ))}
        <button type="submit">Add Client</button>
      </form>

      <div className="buttons">
        <button onClick={fetchClients}>Retrieve All Clients</button>
        <button onClick={() => setDeleteMode(!deleteMode)}>
          {deleteMode ? 'Cancel Delete' : 'Delete Clients'}
        </button>
        {deleteMode && (
          <button className="confirm" onClick={handleDelete}>
            Confirm Delete
          </button>
        )}
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <motion.div layout className="clients-list">
        <AnimatePresence>
          {filteredClients.map((client, idx) => (
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="client-card"
            >
              {deleteMode && (
                <input
                  type="checkbox"
                  checked={selectedClients.includes(client.name)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectedClients((prev) =>
                      checked
                        ? [...prev, client.name]
                        : prev.filter((n) => n !== client.name)
                    );
                  }}
                />
              )}
              <div>
                <strong>{client.name}</strong> <br />
                📧 {client.email} <br />
                📞 {client.phone} <br />
                🆔 {client.pan}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default App;
