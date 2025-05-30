"use client";
import Link from "next/link";
import { Link as ScrollLink } from "react-scroll";

// Change to default export
export function Header() {
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
          <Link href="/blog" style={{
            color: '#4a5568',
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}>
            Blog
          </Link>
          
          <ScrollLink
            to="pricing-section"
            smooth={true}
            duration={600}
            style={{
              color: '#4a5568',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              cursor: 'pointer'
            }}
          >
            Plans
          </ScrollLink>
          
          <ScrollLink
            to="our-solution-section"
            smooth={true}
            duration={600}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              textDecoration: 'none',
              transition: 'background-color 0.2s ease',
              cursor: 'pointer'
            }}
          >
            Book a Demo
          </ScrollLink>
        </nav>
      </div>
    </header>
  );
}