"use client";
import { useState } from "react";

export function Hero() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" , phone: "", company: "", address: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleClick = () => {
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Submission successful:", result);
        setSubmitted(true);
      } else {
        const errorResult = await response.json();
        alert("Error: " + (errorResult.error || "Something went wrong."));
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit form. Please try again.");
    }
  };

  return (
    <section className="bg-blue-700 text-white px-6 py-20 text-center relative">
      {/* Top-right Login and Sign Up */}
      
      <h1 className="text-4xl font-bold mb-4">Get More Done with sds-comm</h1>

      <p className="mb-6 text-lg max-w-xl mx-auto">
        A powerful platform to connect offline brands directly with retailers and customers.
      </p>

      {!showForm && !submitted && (
        <button
          className="bg-white text-blue-900 font-bold px-6 py-3 rounded hover:bg-gray-100 transition"
          onClick={handleClick}
        >
          Book a Demo
        </button>
      )}

      {showForm && !submitted && (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-6">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded text-blue-900"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded text-blue-900"
          />
          <input
            type="phone"
            name="phone"
            placeholder="Your Phone No."
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded text-blue-900"
          />
          <input
            type="company"
            name="company"
            placeholder="Your Company Name"
            value={formData.comapny}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded text-blue-900"
          />
          <input
            type="address"
            name="address"
            placeholder="Your Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded text-blue-900"
          />          
          
          <button
            type="submit"
            className="bg-white text-blue-900 font-bold px-6 py-3 rounded hover:bg-gray-100 transition"
          >
            Send
          </button>
        </form>
      )}

      {submitted && (
        <p className="mt-6 text-green-300 font-semibold">
          Thank you! We've received your info.
        </p>
      )}
    </section>
  );
}
