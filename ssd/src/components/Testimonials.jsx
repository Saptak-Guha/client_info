// --- src/components/Testimonials.jsx ---
export function Testimonials() {
  const testimonials = [
    {
      name: "La Fashion",
      company: "Undergarments Store",
      feedback: "The platform helped us streamline orders from multiple retailers. It's intuitive and efficient!",
    },
    {
      name: "Jaya Readymade",
      company: "Saree Store",
      feedback: "Managing our saree inventory and connecting with local dealers has never been easier. Great support too!",
    },
    {
      name: "Sikdar Tax Consultancy",
      company: "GST & ITR Services",
      feedback: "Excellent platform for tracking business transactions and integrating billing for our clients.",
    },
  ];

  return (
    <section className="bg-white py-20 px-6 text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-12">What Our Clients Say</h2>
      <div className="flex flex-wrap justify-center gap-8">
        {testimonials.map((client, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition w-72 text-left"
          >
            <p className="italic text-gray-700 mb-4">
              "{client.feedback}"
            </p>
            <div className="font-semibold text-gray-800">{client.name}</div>
            <div className="text-sm text-gray-600">{client.company}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
