"use client";
import { useState } from "react";
import emailjs from "emailjs-com";

export function OurSolution() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleClick = () => setShowForm(true);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const emailResponse = await emailjs.send(
        "service_gapi6hn",     // ✅ Replace with your actual service ID
        "template_x4b8m5b",    // ✅ Replace with your actual template ID
        formData,
        "3ohpzHPBNDz5G1sIV"    // ✅ Replace with your actual public key
      );

      console.log("Email sent successfully:", emailResponse);
      setSubmitted(true);
    } catch (error) {
      console.error("Email send error:", error);
      alert("Failed to send email. Please try again.");
    }
  };

  return (
    <section id="our-solution-section" className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left: Text */}
        <div>
          <h2 className="text-4xl font-bold text-blue-700 mb-4">
            Empowering Brands, Simplifying Retail
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            We connect brands with retailers and local dealers, enabling seamless orders, hassle-free payments, and real-time communication. Our smart platform provides powerful tools to boost sales, gain valuable insights, and effortlessly grow your network for lasting business success.</p>

          {/* Button & Form */}
          {!showForm && !submitted && (
            <button
              className="bg-blue-700 text-white font-bold px-6 py-3 rounded hover:bg-blue-800 transition"
              onClick={handleClick}
            >
              Book a Demo
            </button>
          )}

          {showForm && !submitted && (
            <form onSubmit={handleSubmit} className="space-y-4 mt-6 max-w-md">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded text-blue-900"
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded text-blue-900"
              />
              <input
                type="text"
                name="phone"
                placeholder="Your Phone No."
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded text-blue-900"
              />
              <input
                type="text"
                name="company"
                placeholder="Your Company Name"
                value={formData.company}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded text-blue-900"
              />
              <input
                type="text"
                name="address"
                placeholder="Your Address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded text-blue-900"
              />
              <button
                type="submit"
                className="bg-green-600 text-white font-bold px-6 py-2 rounded hover:bg-green-700 transition"
              >
                Send
              </button>
            </form>
          )}

          {submitted && (
            <p className="mt-6 text-green-600 font-semibold">
              Thank you! We've received your info.
            </p>
          )}
        </div>

        {/* Right: Image */}
        <div className="flex justify-center">
          <img
            src="https://cdn.pixabay.com/photo/2020/07/08/04/12/work-5382501_1280.jpg"
            alt="Our Solution"
            className="max-w-full h-auto rounded-lg shadow-md"
          />
        </div>
      </div>
    </section>
  );
}
