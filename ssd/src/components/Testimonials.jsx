// --- src/components/Testimonials.jsx ---
export function Testimonials() {
  return (
    <section className="bg-white py-20 px-6 text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-12">What Our Clients Say</h2>
      <div className="flex flex-wrap justify-center gap-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition w-72 text-left"
          >
            <p className="italic text-gray-700 mb-4">
              "Amazing platform! It simplified our distribution process."
            </p>
            <div className="font-semibold text-gray-800">Client {i}</div>
            <div className="text-sm text-gray-600">Company {i}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
