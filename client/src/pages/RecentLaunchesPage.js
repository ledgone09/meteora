import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ExternalLink, 
  Filter,
  Search,
  ArrowUpDown,
  Shield,
  Coins
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const RecentLaunchesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [filterType, setFilterType] = useState('all');

  const { data: tokens, isLoading, error } = useQuery({
    queryKey: ['recent-tokens', sortBy],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/tokens/recent?limit=50`);
      return response.data.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return '$0.0001';
    if (price < 0.001) return `$${price.toExponential(2)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toLocaleString();
  };

  // Filter and sort tokens
  const filteredTokens = tokens?.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         token.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'premium' && token.launch_type === 'premium') ||
                         (filterType === 'basic' && token.launch_type === 'basic');
    
    return matchesSearch && matchesFilter;
  }) || [];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Recent Token Launches</h1>
          <p className="text-white/60">Discover the latest tokens launched on Meteora</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 bg-white/10 rounded w-2/3"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-white/10 rounded"></div>
                <div className="h-3 bg-white/10 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load</h2>
          <p className="text-white/60">Unable to fetch recent token launches</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Recent Token Launches</h1>
        <p className="text-white/60">
          Discover the latest tokens launched with Meteora DLMM pools
        </p>
      </div>

      {/* Filters and Search */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tokens by name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Filter by Type */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/60" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="basic">Basic Launch</option>
              <option value="premium">Premium Launch</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-white/60" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="created_at">Newest First</option>
              <option value="volume_24h">24h Volume</option>
              <option value="holders_count">Most Holders</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{tokens?.length || 0}</div>
              <div className="text-white/60 text-sm">Total Launches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {tokens?.filter(t => t.launch_type === 'premium').length || 0}
              </div>
              <div className="text-white/60 text-sm">Premium Launches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {tokens?.reduce((sum, t) => sum + (t.volume_24h || 0), 0).toFixed(0) || 0}
              </div>
              <div className="text-white/60 text-sm">24h Volume ($)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {tokens?.reduce((sum, t) => sum + (t.holders_count || 1), 0) || 0}
              </div>
              <div className="text-white/60 text-sm">Total Holders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Token Grid */}
      {filteredTokens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTokens.map((token) => (
            <Link
              key={token.mintAddress}
              to={`/token/${token.mintAddress}`}
              className="card hover:scale-105 transition-transform duration-200 group"
            >
              {/* Token Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
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
                  <div className="w-full h-full flex items-center justify-center text-white/60 text-sm font-bold">
                    {token.symbol.slice(0, 2)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                      {token.name}
                    </h3>
                    {token.launch_type === 'premium' && (
                      <Shield className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm">${token.symbol}</span>
                    <span className="text-xs text-white/40">•</span>
                    <span className="text-xs text-white/60">
                      {formatTimeAgo(token.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Token Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign className="w-3 h-3 text-white/60" />
                    <span className="text-xs text-white/60">Price</span>
                  </div>
                  <div className="text-sm font-medium text-white">
                    {formatPrice(token.current_price)}
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="w-3 h-3 text-white/60" />
                    <span className="text-xs text-white/60">Holders</span>
                  </div>
                  <div className="text-sm font-medium text-white">
                    {token.holders_count || 1}
                  </div>
                </div>

                {token.volume_24h > 0 && (
                  <div className="bg-white/5 rounded-lg p-3 col-span-2">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-white/60" />
                      <span className="text-xs text-white/60">24h Volume</span>
                    </div>
                    <div className="text-sm font-medium text-white">
                      ${formatNumber(token.volume_24h)}
                    </div>
                  </div>
                )}
              </div>

              {/* Launch Type Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  token.launch_type === 'premium' 
                    ? 'bg-purple-500/20 text-purple-300' 
                    : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {token.launch_type === 'premium' ? 'Premium Launch' : 'Basic Launch'}
                </span>

                {/* Trading Links */}
                {token.poolAddress && (
                  <div className="flex items-center gap-1">
                    <a
                      href={token.trading?.jupiterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 p-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-white/60" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Tokens Found</h3>
          <p className="text-white/60 mb-6">
            {searchTerm 
              ? `No tokens match "${searchTerm}"`
              : 'No tokens have been launched yet'
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="btn-gradient"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Load More (if needed) */}
      {filteredTokens.length >= 50 && (
        <div className="text-center mt-8">
          <button className="bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg transition-colors">
            Load More Tokens
          </button>
        </div>
      )}

      {/* Auto-refresh indicator */}
      <div className="mt-8 text-center">
        <p className="text-xs text-white/40">
          Updates automatically every 30 seconds
        </p>
      </div>
    </div>
  );
};

export default RecentLaunchesPage; 