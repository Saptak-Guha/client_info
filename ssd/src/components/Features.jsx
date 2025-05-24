// --- src/components/Features.jsx ---
export function Features() {
  return (
    <section className="bg-white py-20 px-6 text-center">
      <h2 className="text-4xl font-bold text-blue-700 mb-12">Core Features</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
        {[
          "Branded Seller Website",
          "Retailer Management",
          "Order Management",
          "Payment & Invoicing",
          "Analytics & Reports",
          "Support Tools",
        ].map((feature) => (
          <div
            key={feature}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {feature}
            </h3>
            <p className="text-sm text-gray-600">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio, laborum.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
