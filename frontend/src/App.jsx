import React, { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    pan: '',
    email: '',
    phone: ''
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/clients/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Submission failed");

      alert("Client added successfully!");
      setFormData({ name: '', password: '', pan: '', email: '', phone: '' });
    } catch (err) {
      alert("Error submitting data!");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/clients/');
      const data = await response.json();
      setClients(data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Client Database</h1>
      <form className="client-form" onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} />
        <input name="pan" placeholder="PAN Number" value={formData.pan} onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Add Client'}
        </button>
      </form>

      <button className="retrieve-button" onClick={fetchClients}>
        {loading ? 'Loading...' : 'Retrieve Clients'}
      </button>

      <div className="client-list">
        {clients.length === 0 && !loading && <p>No clients to display</p>}
        {clients.map((client, index) => (
          <div key={index} className="client-card fade-in">
            <h3>{client.name}</h3>
            <p><strong>Email:</strong> {client.email}</p>
            <p><strong>Phone:</strong> {client.phone}</p>
            <p><strong>PAN:</strong> {client.pan}</p>
            <p><strong>Password:</strong> {client.password}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
