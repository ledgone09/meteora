import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle, 
  ExternalLink, 
  Copy, 
  Share2, 
  TrendingUp,
  Coins,
  ArrowRight,
  Twitter,
  MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const SuccessPage = () => {
  const { mintAddress } = useParams();
  const navigate = useNavigate();

  const { data: tokenData, isLoading } = useQuery({
    queryKey: ['token', mintAddress],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/tokens/${mintAddress}`);
      return response.data.data;
    },
    enabled: !!mintAddress,
  });

  // Redirect to home if no mint address
  useEffect(() => {
    if (!mintAddress) {
      navigate('/');
    }
  }, [mintAddress, navigate]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const shareOnTwitter = () => {
    if (!tokenData) return;
    
    const { token } = tokenData;
    const text = `🚀 Just launched ${token.name} ($${token.symbol}) on Solana with @MeteoraAG DLMM pools!\n\n✨ Instantly tradeable on @JupiterExchange\n💧 Professional liquidity from day one\n\nTrade now: ${window.location.origin}/token/${mintAddress}`;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareLink = () => {
    const url = `${window.location.origin}/token/${mintAddress}`;
    copyToClipboard(url, 'Token page link');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="card">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-white/10 rounded mb-4"></div>
            <div className="h-4 bg-white/10 rounded mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-2/3 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="card">
          <h1 className="text-2xl font-bold text-white mb-4">Token Not Found</h1>
          <p className="text-white/60 mb-6">The token you're looking for doesn't exist.</p>
          <Link to="/" className="btn-gradient">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const { token, pool, trading } = tokenData;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="card text-center mb-8">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">
          🎉 Token Launch Successful!
        </h1>
        
        <p className="text-xl text-white/80 mb-6">
          <span className="text-gradient font-semibold">{token.name} (${token.symbol})</span> is now live on Solana with instant Meteora liquidity!
        </p>

        <div className="flex items-center justify-center gap-4 mb-6">
          {token.logoUrl && (
            <img
              src={token.logoUrl}
              alt={token.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
          )}
          <div className="text-left">
            <div className="text-2xl font-bold text-white">{token.name}</div>
            <div className="text-white/60">${token.symbol}</div>
            <div className="text-sm text-purple-400">
              {token.launchType === 'premium' ? 'Premium Launch' : 'Basic Launch'}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href={trading?.jupiterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gradient flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            Trade on Jupiter
          </a>
          
          <button
            onClick={shareOnTwitter}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Twitter className="w-5 h-5" />
            Share on Twitter
          </button>
          
          <button
            onClick={shareLink}
            className="bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Copy Link
          </button>
        </div>
      </div>

      {/* Token Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Token Info */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Token Details
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/60">Total Supply:</span>
              <span className="text-white">1,000,000,000</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-white/60">Your Allocation:</span>
              <span className="text-white">800,000,000 (80%)</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-white/60">Liquidity Pool:</span>
              <span className="text-white">200,000,000 (20%)</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-white/60">Decimals:</span>
              <span className="text-white">{token.decimals}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-white/60">Fee Paid:</span>
              <span className="text-white">{token.feePaid} SOL</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/60 text-sm">Mint Address:</span>
              <button
                onClick={() => copyToClipboard(token.mintAddress, 'Mint address')}
                className="text-purple-400 hover:text-purple-300"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <code className="bg-white/10 px-3 py-2 rounded text-xs text-white font-mono block break-all">
              {token.mintAddress}
            </code>
          </div>
        </div>

        {/* Pool Info */}
        {pool && (
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Meteora Pool
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Pool Type:</span>
                <span className="text-white">DLMM Launch Pool</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-white/60">Bin Step:</span>
                <span className="text-white">{pool.binStep / 100}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-white/60">Base Fee:</span>
                <span className="text-white">{pool.baseFee / 100}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-white/60">Quote Token:</span>
                <span className="text-white">SOL</span>
              </div>
              
              {pool.alphaVaultEnabled && (
                <div className="flex justify-between">
                  <span className="text-white/60">Anti-Sniper:</span>
                  <span className="text-green-400">✓ Enabled</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white/60 text-sm">Pool Address:</span>
                <button
                  onClick={() => copyToClipboard(pool.poolAddress, 'Pool address')}
                  className="text-purple-400 hover:text-purple-300"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <code className="bg-white/10 px-3 py-2 rounded text-xs text-white font-mono block break-all">
                {pool.poolAddress}
              </code>
            </div>
          </div>
        )}
      </div>

      {/* Trading Links */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Start Trading</h2>
        <p className="text-white/60 mb-6">
          Your token is now live and tradeable on all major Solana DEX aggregators!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href={trading?.jupiterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            Trade on Jupiter
          </a>
          
          <a
            href={trading?.birdeyeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 hover:bg-white/20 text-white py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            View on Birdeye
          </a>
          
          <a
            href={trading?.solscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 hover:bg-white/20 text-white py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            View on Solscan
          </a>
        </div>
      </div>

      {/* Next Steps */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-white mb-4">What's Next?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Share Your Launch</h3>
                <p className="text-white/60 text-sm">
                  Announce your token on social media to build awareness and community.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Monitor Trading</h3>
                <p className="text-white/60 text-sm">
                  Track your token's performance on Birdeye and other analytics platforms.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Build Community</h3>
                <p className="text-white/60 text-sm">
                  Create Discord/Telegram groups and engage with your token holders.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">4</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Add Utility</h3>
                <p className="text-white/60 text-sm">
                  Develop use cases and utility for your token to drive long-term value.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to={`/token/${mintAddress}`}
          className="btn-gradient flex items-center justify-center gap-2"
        >
          View Token Details
          <ArrowRight className="w-4 h-4" />
        </Link>
        
        <Link
          to="/"
          className="bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Create Another Token
          <Coins className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default SuccessPage; 