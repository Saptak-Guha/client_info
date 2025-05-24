// File: src/components/ui/button.jsx
"use client";

export function Button({ children, ...props }) {
  return (
    <button
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
      {...props}
    >
      {children}
    </button>
  );
}
