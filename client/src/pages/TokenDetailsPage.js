import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  ExternalLink, 
  Copy, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Shield,
  Clock,
  Coins
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const TokenDetailsPage = () => {
  const { mintAddress } = useParams();

  const { data: tokenData, isLoading, error } = useQuery({
    queryKey: ['token', mintAddress],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/tokens/${mintAddress}`);
      return response.data.data;
    },
    enabled: !!mintAddress,
  });

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toLocaleString();
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return '$0.0001';
    if (price < 0.001) return `$${price.toExponential(2)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded mb-6 w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="card">
                <div className="h-64 bg-white/10 rounded"></div>
              </div>
            </div>
            <div className="card">
              <div className="h-48 bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tokenData) {
    return (
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="card text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Token Not Found</h2>
          <p className="text-white/60">The token you're looking for doesn't exist or hasn't been created yet.</p>
        </div>
      </div>
    );
  }

  const { token, pool, statistics, trading } = tokenData;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Token Header */}
      <div className="card mb-8">
        <div className="flex items-start gap-6">
          {/* Token Logo */}
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
            {token.logoUrl ? (
              <img
                src={token.logoUrl}
                alt={token.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-full h-full flex items-center justify-center text-white/60 text-xl font-bold">
              {token.symbol.slice(0, 2)}
            </div>
          </div>

          {/* Token Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{token.name}</h1>
              <span className="text-xl text-white/60">${token.symbol}</span>
              {token.launchType === 'premium' && (
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Premium
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-white/60">Total Supply:</span>
                <div className="text-white font-medium">{formatNumber(token.totalSupply / Math.pow(10, token.decimals))}</div>
              </div>
              <div>
                <span className="text-white/60">Decimals:</span>
                <div className="text-white font-medium">{token.decimals}</div>
              </div>
              <div>
                <span className="text-white/60">Launch Type:</span>
                <div className="text-white font-medium capitalize">{token.launchType}</div>
              </div>
              <div>
                <span className="text-white/60">Fee Paid:</span>
                <div className="text-white font-medium">{token.feePaid} SOL</div>
              </div>
            </div>

            {/* Addresses */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">Mint Address:</span>
                <code className="bg-white/10 px-2 py-1 rounded text-xs text-white font-mono">
                  {token.mintAddress}
                </code>
                <button
                  onClick={() => copyToClipboard(token.mintAddress, 'Mint address')}
                  className="text-purple-400 hover:text-purple-300"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">Creator:</span>
                <code className="bg-white/10 px-2 py-1 rounded text-xs text-white font-mono">
                  {token.creatorWallet}
                </code>
                <button
                  onClick={() => copyToClipboard(token.creatorWallet, 'Creator address')}
                  className="text-purple-400 hover:text-purple-300"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pool Information */}
          {pool && (
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Meteora Pool Details
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="stats-card">
                  <div className="text-2xl font-bold text-gradient mb-1">
                    {formatPrice(statistics?.currentPrice || pool.initialPrice)}
                  </div>
                  <div className="text-white/60 text-sm">Current Price</div>
                </div>
                
                <div className="stats-card">
                  <div className="text-2xl font-bold text-white mb-1">
                    {pool.binStep / 100}%
                  </div>
                  <div className="text-white/60 text-sm">Bin Step</div>
                </div>
                
                <div className="stats-card">
                  <div className="text-2xl font-bold text-white mb-1">
                    {pool.baseFee / 100}%
                  </div>
                  <div className="text-white/60 text-sm">Base Fee</div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white/60">Pool Address:</span>
                  <code className="bg-white/10 px-2 py-1 rounded text-xs text-white font-mono">
                    {pool.poolAddress}
                  </code>
                  <button
                    onClick={() => copyToClipboard(pool.poolAddress, 'Pool address')}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-xs text-white/60">
                  <div>Created: {formatDate(pool.createdAt)}</div>
                  {pool.alphaVaultEnabled && (
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="w-3 h-3" />
                      Anti-sniper protection enabled
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          {statistics && (
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trading Statistics
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stats-card">
                  <div className="text-xl font-bold text-white mb-1">
                    ${formatNumber(statistics.volume24h)}
                  </div>
                  <div className="text-white/60 text-sm">24h Volume</div>
                </div>
                
                <div className="stats-card">
                  <div className="text-xl font-bold text-white mb-1">
                    {statistics.trades24h}
                  </div>
                  <div className="text-white/60 text-sm">24h Trades</div>
                </div>
                
                <div className="stats-card">
                  <div className="text-xl font-bold text-white mb-1">
                    {statistics.holdersCount}
                  </div>
                  <div className="text-white/60 text-sm">Holders</div>
                </div>
                
                <div className="stats-card">
                  <div className={`text-xl font-bold mb-1 ${
                    statistics.priceChange24h > 0 ? 'text-green-400' : 
                    statistics.priceChange24h < 0 ? 'text-red-400' : 'text-white'
                  }`}>
                    {statistics.priceChange24h > 0 ? '+' : ''}{statistics.priceChange24h.toFixed(2)}%
                  </div>
                  <div className="text-white/60 text-sm">24h Change</div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-white/60">
                Last updated: {formatDate(statistics.lastUpdated)}
              </div>
            </div>
          )}

          {/* Transaction Info */}
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Launch Information
            </h2>
            
            <div className="space-y-3">
              <div>
                <span className="text-white/60">Launch Date:</span>
                <div className="text-white">{formatDate(token.createdAt)}</div>
              </div>
              
              {token.transactionSignature && (
                <div>
                  <span className="text-white/60">Transaction:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-white/10 px-2 py-1 rounded text-xs text-white font-mono">
                      {token.transactionSignature}
                    </code>
                    <a
                      href={`https://solscan.io/tx/${token.transactionSignature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trading Links */}
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Trade {token.symbol}
            </h3>
            
            <div className="space-y-3">
              <a
                href={trading?.jupiterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full btn-gradient text-center"
              >
                Trade on Jupiter
                <ExternalLink className="w-4 h-4 ml-2 inline" />
              </a>
              
              <a
                href={trading?.birdeyeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-colors text-center"
              >
                View on Birdeye
                <ExternalLink className="w-4 h-4 ml-2 inline" />
              </a>
              
              <a
                href={trading?.solscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-colors text-center"
              >
                View on Solscan
                <ExternalLink className="w-4 h-4 ml-2 inline" />
              </a>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Market Cap</span>
                <span className="text-white">${formatNumber(statistics?.marketCap || 0)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-white/60">Liquidity</span>
                <span className="text-white">${formatNumber(statistics?.liquidityUsd || 0)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-white/60">Total Trades</span>
                <span className="text-white">{formatNumber(statistics?.tradesTotal || 0)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-white/60">Total Volume</span>
                <span className="text-white">${formatNumber(statistics?.volumeTotal || 0)}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          {token.metadataUri && (
            <div className="card">
              <h3 className="text-lg font-bold text-white mb-4">Metadata</h3>
              
              <a
                href={token.metadataUri}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-colors text-center"
              >
                View Metadata
                <ExternalLink className="w-4 h-4 ml-2 inline" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenDetailsPage; 