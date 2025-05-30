import Image from 'next/image';
import { Header } from '@/components/Header';

export default function Blog() {
  const features = [
    {
      id: 1,
      title: "Secure Login System",
      description: "Enterprise-grade authentication protecting manufacturer and retailer accounts with role-based access controls.",
      image: "/demo/login-secure.png"
    },
    {
      id: 2,
      title: "AI-Powered Product Delivery",
      description: "Intelligent logistics optimization predicting delivery times with 98% accuracy using machine learning.",
      image: "/demo/ai-delivery.png"
    },
    {
      id: 3,
      title: "Smart Dashboard Analytics",
      description: "AI-driven product ranking based on real-time reviews, sales performance, and market trends.",
      image: "/demo/ai-dashboard.png"
    },
    {
      id: 4,
      title: "Retailer Registration Portal",
      description: "Streamlined onboarding with integrated search and live chat support for new retailers.",
      image: "/demo/registration.png"
    },
    {
      id: 5,
      title: "Product Management Suite",
      description: "End-to-end inventory control with bulk editing capabilities and SKU management.",
      image: "/demo/product-management.png"
    },
    {
      id: 6,
      title: "Real-Time Client Chat",
      description: "Integrated messaging system connecting manufacturers and retailers with instant notifications.",
      image: "/demo/chat.png"
    },
    {
      id: 7,
      title: "Add New Products",
      description: "Automated system with realtime reflection of newly added and updated products.",
      image: "/demo/inventory.png"
    },
    {
      id: 8,
      title: "Retailer Catalog",
      description: "Searchable client cards and chat system integration.",
      image: "/demo/product-listing.png"
    }
  ];
    
  // Container styles
  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  };

  // Grid styles
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '30px',
    margin: '60px 0'
  };

  // Card styles
  const cardStyles = {
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    border: '1px solid #eaeaea'
  };

  // Image container styles
  const imageContainerStyles = {
    position: 'relative',
    width: '100%',
    height: '240px',
    borderBottom: '3px solid #1976d2'
  };

  // Content styles
  const contentStyles = {
    padding: '25px'
  };

  // Title styles
  const titleStyles = {
    color: '#1976d2',
    marginTop: '0',
    marginBottom: '12px',
    fontSize: '1.4rem'
  };

  // Description styles
  const descStyles = {
    color: '#444',
    lineHeight: '1.6',
    margin: '0'
  };

  // Header block styles
  const headerBlockStyles = {
    backgroundColor: '#1976d2',
    padding: '80px 0',
    marginTop: '60px' // Space for fixed header
  };

  // Page header styles
  const pageHeaderStyles = {
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto'
  };

  // Main title styles
  const mainTitleStyles = {
    color: 'white',
    fontSize: '2.5rem',
    fontWeight: '700',
    margin: '0 0 20px 0'
  };

  // Subtitle styles
  const subtitleStyles = {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '1.2rem',
    lineHeight: '1.6',
    margin: '0'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`
    }}>
      <Header />
      
      {/* Colored header block */}
      <div style={headerBlockStyles}>
        <div style={containerStyles}>
          <div style={pageHeaderStyles}>
            <h1 style={mainTitleStyles}>Platform Features</h1>
            <p style={subtitleStyles}>Designed for B2B manufacturing efficiency</p>
          </div>
        </div>
      </div>
      
      <div style={containerStyles}>
        <div style={gridStyles}>
          {features.map(feature => (
            <div 
              key={feature.id} 
              style={cardStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(25, 118, 210, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div style={imageContainerStyles}>
                <Image 
                  src={feature.image} 
                  alt={feature.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  quality={100}
                />
              </div>
              <div style={contentStyles}>
                <h2 style={titleStyles}>{feature.title}</h2>
                <p style={descStyles}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}