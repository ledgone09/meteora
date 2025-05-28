import React from 'react';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, sans-serif',
      color: 'white',
      padding: '20px'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: '10px',
        padding: '15px 20px',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(45deg, #9333ea, #3b82f6)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            🚀
          </div>
          <div>
            <h1 style={{ fontSize: '24px', margin: 0 }}>
              <span style={{
                background: 'linear-gradient(45deg, #a855f7, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Meteora
              </span> Launcher
            </h1>
            <p style={{ fontSize: '12px', margin: 0, opacity: 0.7 }}>
              Create tokens + liquidity
            </p>
          </div>
        </div>
        <button style={{
          background: 'linear-gradient(45deg, #9333ea, #3b82f6)',
          border: 'none',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          Connect Wallet
        </button>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ 
            fontSize: '60px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            <span style={{
              background: 'linear-gradient(45deg, #a855f7, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Meteora
            </span> Token Launcher
          </h1>
          <p style={{ 
            fontSize: '24px', 
            opacity: 0.9, 
            maxWidth: '600px', 
            margin: '0 auto 30px',
            lineHeight: '1.4'
          }}>
            Create tokens + liquidity in under 60 seconds. 
            Powered by professional-grade Meteora DLMM technology.
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '8px 16px',
            fontSize: '14px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#4ade80',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            Mainnet Ready
          </div>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '50px'
        }}>
          {[
            { icon: "⚡", title: "Instant Trading", description: "Immediately tradable on Jupiter and all major DEX aggregators" },
            { icon: "🛡️", title: "Anti-Sniper Protection", description: "Optional Alpha Vault integration for premium launches" },
            { icon: "🪙", title: "Professional Setup", description: "Meteora DLMM pools with dynamic fees and optimal liquidity" },
            { icon: "📈", title: "Single-Sided Liquidity", description: "No initial SOL/USDC capital required for liquidity" }
          ].map((feature, index) => (
            <div key={index} style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '15px',
              padding: '25px',
              textAlign: 'center',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(45deg, #9333ea, #3b82f6)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px',
                fontSize: '24px'
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px', fontWeight: 'bold' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '14px', opacity: 0.8, lineHeight: '1.4' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '30px',
          marginBottom: '50px'
        }}>
          {/* Token Creation Form */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '30px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(45deg, #9333ea, #3b82f6)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                🪙
              </div>
              <div>
                <h2 style={{ fontSize: '24px', margin: 0, fontWeight: 'bold' }}>Create Your Token</h2>
                <p style={{ fontSize: '14px', margin: 0, opacity: 0.7 }}>Launch with instant Meteora liquidity</p>
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '24px'
              }}>
                🪙
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '10px', fontWeight: 'bold' }}>Connect Your Wallet</h3>
              <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '25px' }}>
                Connect your Solana wallet to start creating tokens
              </p>
              <button style={{
                background: 'linear-gradient(45deg, #9333ea, #3b82f6)',
                border: 'none',
                color: 'white',
                padding: '12px 30px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'transform 0.2s ease'
              }}>
                Connect Wallet
              </button>
            </div>
          </div>

          {/* Recent Launches Sidebar */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '30px'
          }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: 'bold' }}>Recent Launches</h3>
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '24px'
              }}>
                ⏰
              </div>
              <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '5px' }}>No tokens launched yet</p>
              <p style={{ fontSize: '12px', opacity: 0.5 }}>Be the first to create a token!</p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '30px' }}>Simple Pricing</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {/* Basic Plan */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '20px',
              padding: '30px',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Basic Launch</h3>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #a855f7, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '15px'
              }}>
                0.02 SOL
              </div>
              <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '20px' }}>~$1 • Perfect for getting started</p>
              
              <div style={{ textAlign: 'left' }}>
                {['Token creation', 'Standard Meteora DLMM pool', 'Jupiter integration'].map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#4ade80',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{ fontSize: '14px', opacity: 0.9 }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Plan */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '2px solid #9333ea',
              borderRadius: '20px',
              padding: '30px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(45deg, #9333ea, #3b82f6)',
                color: 'white',
                padding: '5px 15px',
                borderRadius: '15px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                Recommended
              </div>
              
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Premium Launch</h3>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #a855f7, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '15px'
              }}>
                0.1 SOL
              </div>
              <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '20px' }}>~$2.5 • Professional features</p>
              
              <div style={{ textAlign: 'left' }}>
                {[
                  'Everything in Basic',
                  'Alpha Vault anti-sniper protection',
                  'Custom pool parameters'
                ].map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: i === 0 ? '#4ade80' : '#a855f7',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{ fontSize: '14px', opacity: 0.9 }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 