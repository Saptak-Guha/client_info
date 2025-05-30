"use client";
import { use, useState } from "react";
import emailjs from 'emailjs-com';

export function Hero() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", company: "", address: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleClick = () => {
    setShowForm(true); // Show the form instead of mailto link
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
      // Send email via EmailJS
      const emailResponse = await emailjs.send(
        'service_gapi6hn',           // Replace with your actual EmailJS service ID
        'template_x4b8m5b',          // Replace with your actual template ID
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          address: formData.address,
        },
        '3ohpzHPBNDz5G1sIV'          // Replace with your actual EmailJS public key
      );

      console.log('Email sent successfully:', emailResponse);
      setSubmitted(true);
    } catch (error) {
      console.error("Error during submission or email:", error);
      alert("Failed to submit form. Please try again.");
    }
  };

  return (
    <section className="bg-blue-700 text-white px-6 py-20 text-center relative">
      <br></br> <br></br>
      <h1 className="text-4xl font-bold mb-4">B2S: Bridging Brands to Retailers</h1>
      
      <p className="mb-6 text-lg max-w-5xl mx-auto">
  A smart platform that connects brands directly with retailers and local dealers, removing middlemen and simplifying operations.
  Powered by AI, it offers GST billing, real-time delivery tracking, and secure, seamless transactions.
</p>

      <br></br>
        <a className="bg-white text-blue-700 font-bold px-6 py-3 rounded hover:bg-gray-100 transition"
          href="mailto:b2s.co.in@gmail.com"> Contact Us!
        </a>
      

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
            type="text"
            name="phone"
            placeholder="Your Phone No."
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded text-blue-900"
          />
          <input
            type="text"
            name="company"
            placeholder="Your Company Name"
            value={formData.company}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded text-blue-900"
          />
          <input
            type="text"
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
