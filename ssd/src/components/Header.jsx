"use client";

import { Link as ScrollLink } from "react-scroll";

export function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand on the left */}
        <div className="text-xl font-bold text-blue-700 cursor-pointer">
          <a href="/">B2S</a>
        </div>

        {/* Navigation on the right */}
        <nav className="flex items-center space-x-6">
          <a
            href="https://www.linkedin.com/in/sarbeswar-nandi-9041a31aa/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-blue-700 transition"
          >
            Blog
          </a>

          <ScrollLink
            to="pricing-section"
            smooth={true}
            duration={600}
            className="cursor-pointer text-gray-700 hover:text-blue-700 transition"
          >
            Plans
          </ScrollLink>

          <ScrollLink
            to="our-solution-section"
            smooth={true}
            duration={600}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition cursor-pointer"
          >
            Book a Demo
          </ScrollLink>
        </nav>
      </div>
    </header>
  );
}
