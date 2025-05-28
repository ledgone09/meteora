import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Coins, Zap, Shield, TrendingUp } from 'lucide-react';

import TokenCreationForm from '../components/TokenCreationForm';
import RecentLaunches from '../components/RecentLaunches';
import FeatureCard from '../components/FeatureCard';

const HomePage = () => {
  const { connected } = useWallet();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Trading",
      description: "Immediately tradable on Jupiter and all major DEX aggregators"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Anti-Sniper Protection",
      description: "Optional Alpha Vault integration for premium launches"
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Professional Setup",
      description: "Meteora DLMM pools with dynamic fees and optimal liquidity"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Single-Sided Liquidity",
      description: "No initial SOL/USDC capital required for liquidity"
    }
  ];

  return (
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
        
        {/* Network indicator */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white/80 text-sm">
            {process.env.REACT_APP_SOLANA_NETWORK === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}
          </span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Token Creation Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Create Your Token</h2>
                <p className="text-white/60">Launch with instant Meteora liquidity</p>
              </div>
            </div>

            {connected ? (
              <TokenCreationForm />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-white/60" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-white/60 mb-6">
                  Connect your Solana wallet to start creating tokens
                </p>
                <WalletMultiButton className="btn-gradient" />
              </div>
            )}
          </div>
        </div>

        {/* Recent Launches Sidebar */}
        <div className="lg:col-span-1">
          <RecentLaunches />
        </div>
      </div>

      {/* Pricing Section */}
      <div className="mt-16 mb-12">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Simple Pricing
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Basic Plan */}
          <div className="card relative">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Basic Launch</h3>
              <div className="text-3xl font-bold text-gradient mb-4">0.2 SOL</div>
              <p className="text-white/60 mb-6">~$5 • Perfect for getting started</p>
              
              <ul className="text-left space-y-3 mb-6">
                <li className="flex items-center gap-2 text-white/80">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  Token creation
                </li>
                <li className="flex items-center gap-2 text-white/80">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  Standard Meteora DLMM pool
                </li>
                <li className="flex items-center gap-2 text-white/80">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  Jupiter integration
                </li>
                <li className="flex items-center gap-2 text-white/80">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  IPFS metadata storage
                </li>
              </ul>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="card relative border-purple-500/50">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Recommended
              </span>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Premium Launch</h3>
              <div className="text-3xl font-bold text-gradient mb-4">0.5 SOL</div>
              <p className="text-white/60 mb-6">~$12 • Professional features</p>
              
              <ul className="text-left space-y-3 mb-6">
                <li className="flex items-center gap-2 text-white/80">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  Everything in Basic
                </li>
                <li className="flex items-center gap-2 text-white/80">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Alpha Vault anti-sniper protection
                </li>
                <li className="flex items-center gap-2 text-white/80">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Custom pool parameters
                </li>
                <li className="flex items-center gap-2 text-white/80">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Priority support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "1",
              title: "Connect Wallet",
              description: "Connect your Phantom, Solflare, or other Solana wallet"
            },
            {
              step: "2", 
              title: "Fill Form",
              description: "Enter token name, symbol, and upload your logo"
            },
            {
              step: "3",
              title: "Choose Plan",
              description: "Select Basic (0.2 SOL) or Premium (0.5 SOL) launch"
            },
            {
              step: "4",
              title: "Launch!",
              description: "Token + Meteora pool created, instantly tradeable"
            }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">{item.step}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-white/60 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 