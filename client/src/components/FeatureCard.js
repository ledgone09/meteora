import React from 'react';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="stats-card text-center group hover:scale-105 transition-transform duration-200">
      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/70 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard; 