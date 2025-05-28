import React from 'react';
import './App.css';

// Simple components without external dependencies
const Header = () => (
  <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">🚀</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              <span className="text-gradient">Meteora</span> Launcher
            </h1>
            <p className="text-xs text-white/60">Create tokens + liquidity</p>
          </div>
        </div>
        <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg">
          Connect Wallet
        </button>
      </div>
    </div>
  </header>
);

const HomePage = () => (
  <div className="max-w-7xl mx-auto">
    {/* Hero Section */}
    <div className="text-center mb-12 animate-fadeInUp">
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
        <span className="text-gradient">Meteora</span> Token Launcher
      </h1>
      <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
        Create tokens + liquidity in under 60 seconds. 
        Powered by professional-grade Meteora DLMM technology.
      </p>
    </div>

    {/* Features Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {[
        { icon: "⚡", title: "Instant Trading", description: "Immediately tradable on Jupiter and all major DEX aggregators" },
        { icon: "🛡️", title: "Anti-Sniper Protection", description: "Optional Alpha Vault integration for premium launches" },
        { icon: "🪙", title: "Professional Setup", description: "Meteora DLMM pools with dynamic fees and optimal liquidity" },
        { icon: "📈", title: "Single-Sided Liquidity", description: "No initial SOL/USDC capital required for liquidity" }
      ].map((feature, index) => (
        <div key={index} className="stats-card text-center group hover:scale-105 transition-transform duration-200">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <span className="text-2xl">{feature.icon}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
          <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </div>

    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Token Creation Form */}
      <div className="lg:col-span-2">
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🪙</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Create Your Token</h2>
              <p className="text-white/60">Launch with instant Meteora liquidity</p>
            </div>
          </div>

          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🪙</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-white/60 mb-6">Connect your Solana wallet to start creating tokens</p>
            <button className="btn-gradient">Connect Wallet</button>
          </div>
        </div>
      </div>

      {/* Recent Launches Sidebar */}
      <div className="lg:col-span-1">
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-4">Recent Launches</h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏰</span>
            </div>
            <p className="text-white/60 mb-2">No tokens launched yet</p>
            <p className="text-white/40 text-sm">Be the first to create a token!</p>
          </div>
        </div>
      </div>
    </div>

    {/* Pricing Section */}
    <div className="mt-16 mb-12">
      <h2 className="text-3xl font-bold text-white text-center mb-8">Simple Pricing</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Basic Plan */}
        <div className="card">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Basic Launch</h3>
            <div className="text-3xl font-bold text-gradient mb-4">0.02 SOL</div>
            <p className="text-white/60 mb-6">~$1 • Perfect for getting started</p>
            
            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-center gap-2 text-white/80">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Token creation
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Standard Meteora DLMM pool
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Jupiter integration
              </li>
            </ul>
          </div>
        </div>

        {/* Premium Plan */}
        <div className="card border-purple-500/50">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Premium Launch</h3>
            <div className="text-3xl font-bold text-gradient mb-4">0.1 SOL</div>
            <p className="text-white/60 mb-6">~$2.5 • Professional features</p>
            
            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-center gap-2 text-white/80">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Everything in Basic
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                Alpha Vault anti-sniper protection
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                Custom pool parameters
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <HomePage />
      </main>
    </div>
  );
}

export default App; 