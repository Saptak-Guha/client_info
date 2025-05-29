export function Features() {
  const features = [
    {
      title: "Branded Seller Website",
      description: "Your own customized online store to showcase and sell products directly to retailers."
    },
    {
      title: "Retailer Management",
      description: "Easily onboard and manage retailers with streamlined communication and control tools."
    },
    {
      title: "Order Management",
      description: "Efficiently handle order placement, tracking, and fulfillment with minimal effort."
    },
    {
      title: "Product Management",
      description: "Track and manage your product catalog, including pricing, availability, and updates."
    },
    
    {
      title: "AI Analytics & Reports",
      description: "AI dashboards to monitor performance and gain insights and generate custom reports."
    },
    {
      title: "Payments & Delivery",
      description: "Includes GST billing & invoicing, delivery tracking, and secure transactions to run your business smoothly."
    },
  ];

  return (
    <section className="bg-white py-20 px-6 text-center">
      <h2 className="text-4xl font-bold text-blue-700 mb-12">Core Features</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
