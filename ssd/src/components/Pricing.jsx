"use client";
import { useRouter } from "next/navigation";

export function Pricing() {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push("/login.html");
  };

  const handleSignupRedirect = () => {
    router.push("/signup.html");
  };

  const plans = [
    {
      name: "Mini",
      price: "₹499/month",
      features: ["Mini Membership", "Basic Tools", "10 Clients"],
    },
    {
      name: "Pro",
      price: "₹999/month",
      features: ["Advanced Tools", "Advance Tools", "20 Clients"],
    },
    {
      name: "Enterprise",
      price: "₹1999/month",
      features: ["All Features", "Unlimited Clients", "24*7 support"],
    },
  ];

  return (
    <section id="pricing-section" className="py-20 px-6 bg-blue-50 text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-12">Choose Your Plan</h2>

      <div className="flex flex-wrap justify-center gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="bg-white shadow-lg rounded-xl p-6 w-full sm:w-[18rem] text-left transition hover:shadow-2xl"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">
              {plan.name}
            </h3>
            <p className="text-3xl font-bold text-blue-700 mb-4">
              {plan.price}
            </p>
            <ul className="text-gray-700 list-disc pl-5 space-y-2 mb-6 text-sm">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
