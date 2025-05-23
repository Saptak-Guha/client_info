// --- src/components/Pricing.jsx ---
export function Pricing() {
  return (
    <section className="py-20 px-6 bg-blue-50 text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-12">Choose Your Plan</h2>
      <div className="flex flex-wrap justify-center gap-10">
        {[
          { name: "Free", price: "₹0", features: ["1 Week","Basic Tools", "2 Clients"] },
          { name: "Pro", price: "₹999 per month", features: ["Advanced Tools", "15 Clients"] },
          { name: "Enterprise", price: "Contact Sales", features: ["All Features", "Unlimited Clients","24*7 support"] }
        ].map((plan) => (
          <div
            key={plan.name}
            className="bg-white shadow-lg rounded-xl p-8 w-72 text-left transition hover:shadow-2xl"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">{plan.name}</h3>
            <p className="text-3xl font-bold text-blue-700 mb-4">{plan.price}</p>
            <ul className="text-gray-700 list-disc pl-5 space-y-2 mb-6 text-sm">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
              Get Started
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
