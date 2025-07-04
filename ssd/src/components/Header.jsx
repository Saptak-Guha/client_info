"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Common styles
  const linkStyle = {
    color: '#4a5568',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    cursor: 'pointer'
  };

  const buttonStyle = {
    backgroundColor: '#1976d2',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '4px',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease',
    cursor: 'pointer'
  };

  // Handle scroll navigation
  const handleScrollClick = (sectionId) => {
    if (isHomePage) {
      const section = document.getElementById(sectionId);
      if (section) {
        window.scrollTo({
          top: section.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    } else {
      // Navigate to home page with hash
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link href="/" style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#1976d2',
          textDecoration: 'none'
        }}>
          B2S
        </Link>
        
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/blog" style={linkStyle}>
            Blog
          </Link>
          
          <a 
            onClick={() => handleScrollClick('pricing-section')}
            style={linkStyle}
          >
            Plans
          </a>
          
          <a 
            onClick={() => handleScrollClick('our-solution-section')}
            style={buttonStyle}
          >
            Book a Demo
          </a>
        </nav>
      </div>
    </header>
  );
}