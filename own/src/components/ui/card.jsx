// File: src/components/ui/card.jsx
export function Card({ children }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return <div className="text-gray-800">{children}</div>;
}
