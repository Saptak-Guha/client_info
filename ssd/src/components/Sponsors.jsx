// --- src/components/Sponsors.jsx ---
export function Sponsors() {
  return (
    <section className="bg-blue-700 text-white py-10 text-center">
      <h2 className="text-xl font-semibold mb-8">Our Customers</h2>
      <div className="flex justify-center gap-10 flex-wrap">
        {["La Fashion", "Jaya Readymade", "Metafloor.store", "Sikdar Tax Consultancy"].map((sponsor) => (
          <span key={sponsor} className="text-lg font-semibold">
            {sponsor}
          </span>
        ))}
      </div>
    </section>
  );
}