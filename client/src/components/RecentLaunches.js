import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ExternalLink, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const RecentLaunches = () => {
  const { data: tokens, isLoading, error } = useQuery({
    queryKey: ['recent-tokens'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/tokens/recent?limit=10`);
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

  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-4">Recent Launches</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded mb-1"></div>
                  <div className="h-3 bg-white/10 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-4">Recent Launches</h3>
        <div className="text-center py-8">
          <p className="text-white/60">Failed to load recent launches</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Recent Launches</h3>
        <Link
          to="/recent"
          className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
        >
          View All
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {tokens && tokens.length > 0 ? (
        <div className="space-y-3">
          {tokens.map((token) => (
            <div
              key={token.mintAddress}
              className="token-card group"
            >
              <Link to={`/token/${token.mintAddress}`} className="block">
                <div className="flex items-center gap-3">
                  {/* Token Logo */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
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
                    <div className="w-full h-full flex items-center justify-center text-white/60 text-xs font-bold">
                      {token.symbol.slice(0, 2)}
                    </div>
                  </div>

                  {/* Token Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white truncate">
                        {token.name}
                      </h4>
                      <span className="text-white/60 text-sm">
                        ${token.symbol}
                      </span>
                      {token.launchType === 'premium' && (
                        <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded text-xs">
                          Premium
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-white/60">
                      <div className="flex items-center gap-3">
                        {token.currentPrice > 0 && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatPrice(token.currentPrice)}
                          </span>
                        )}
                        
                        {token.holdersCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {token.holdersCount}
                          </span>
                        )}
                        
                        {token.volume24h > 0 && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            ${token.volume24h.toFixed(0)}
                          </span>
                        )}
                      </div>

                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(token.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trading Links */}
                {token.poolAddress && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-white/60">Trade on:</span>
                      <a
                        href={token.trading?.jupiterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Jupiter
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={token.trading?.birdeyeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Birdeye
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-white/60" />
          </div>
          <p className="text-white/60 mb-2">No tokens launched yet</p>
          <p className="text-white/40 text-sm">Be the first to create a token!</p>
        </div>
      )}

      {/* Refresh indicator */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <p className="text-xs text-white/40 text-center">
          Updates every 30 seconds
        </p>
      </div>
    </div>
  );
};

export default RecentLaunches; 