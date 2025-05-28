import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { Upload, Image, Loader2, AlertCircle, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const TokenCreationForm = () => {
  // Placeholder for wallet - will be replaced with real wallet integration
  const publicKey = { toString: () => 'MockWalletAddress123456789012345678901234567890' };
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    launchType: 'basic'
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});

  // File upload handling
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Please upload a valid image file (PNG, JPG, GIF, WebP)');
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors
      setErrors(prev => ({ ...prev, logo: null }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Token name is required';
    } else if (formData.name.length > 32) {
      newErrors.name = 'Token name must be 32 characters or less';
    }

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Token symbol is required';
    } else if (formData.symbol.length > 10) {
      newErrors.symbol = 'Token symbol must be 10 characters or less';
    } else if (!/^[A-Z0-9]+$/.test(formData.symbol)) {
      newErrors.symbol = 'Token symbol must contain only uppercase letters and numbers';
    }

    if (!logoFile) {
      newErrors.logo = 'Logo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Token creation mutation
  const createTokenMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      formDataToSend.append('name', data.name);
      formDataToSend.append('symbol', data.symbol.toUpperCase());
      formDataToSend.append('creatorWallet', publicKey.toString());
      formDataToSend.append('launchType', data.launchType);
      formDataToSend.append('logo', data.logoFile);

      const response = await axios.post(`${API_URL}/tokens/create`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Token created successfully!');
      navigate(`/success/${data.data.token.mintAddress}`);
    },
    onError: (error) => {
      console.error('Token creation failed:', error);
      const message = error.response?.data?.message || 'Token creation failed';
      toast.error(message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    createTokenMutation.mutate({
      ...formData,
      logoFile
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'symbol' ? value.toUpperCase() : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const isLoading = createTokenMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Token Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
          Token Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g., My Awesome Token"
          className={`input-field ${errors.name ? 'border-red-500' : ''}`}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.name}
          </p>
        )}
      </div>

      {/* Token Symbol */}
      <div>
        <label htmlFor="symbol" className="block text-sm font-medium text-white mb-2">
          Token Symbol * <span className="text-white/60">(3-10 characters)</span>
        </label>
        <input
          type="text"
          id="symbol"
          name="symbol"
          value={formData.symbol}
          onChange={handleInputChange}
          placeholder="e.g., MAT"
          className={`input-field ${errors.symbol ? 'border-red-500' : ''}`}
          maxLength={10}
          disabled={isLoading}
        />
        {errors.symbol && (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.symbol}
          </p>
        )}
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Token Logo * <span className="text-white/60">(PNG, JPG, GIF, WebP - Max 5MB)</span>
        </label>
        
        <div
          {...getRootProps()}
          className={`upload-area ${isDragActive ? 'dragover' : ''} ${errors.logo ? 'border-red-500' : ''}`}
        >
          <input {...getInputProps()} disabled={isLoading} />
          
          {logoPreview ? (
            <div className="flex flex-col items-center">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-20 h-20 object-cover rounded-lg mb-3"
              />
              <p className="text-white/80 text-sm mb-2">{logoFile?.name}</p>
              <p className="text-white/60 text-xs">
                Click or drag to replace
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-white/60 mb-3" />
              <p className="text-white/80 text-sm mb-2">
                {isDragActive ? 'Drop your logo here' : 'Click or drag logo to upload'}
              </p>
              <p className="text-white/60 text-xs">
                Recommended: 512x512px square image
              </p>
            </div>
          )}
        </div>
        
        {errors.logo && (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.logo}
          </p>
        )}
      </div>

      {/* Launch Type */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Launch Type *
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Option */}
          <label className={`cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input
              type="radio"
              name="launchType"
              value="basic"
              checked={formData.launchType === 'basic'}
              onChange={handleInputChange}
              className="sr-only"
              disabled={isLoading}
            />
            <div className={`card-dark border-2 transition-all ${
              formData.launchType === 'basic' 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Basic Launch</h3>
                <div className="text-lg font-bold text-gradient">0.2 SOL</div>
              </div>
              <p className="text-white/60 text-sm mb-3">~$5 • Perfect for getting started</p>
              <ul className="space-y-1 text-xs text-white/70">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-400" />
                  Standard DLMM pool
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-400" />
                  Jupiter integration
                </li>
              </ul>
            </div>
          </label>

          {/* Premium Option */}
          <label className={`cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input
              type="radio"
              name="launchType"
              value="premium"
              checked={formData.launchType === 'premium'}
              onChange={handleInputChange}
              className="sr-only"
              disabled={isLoading}
            />
            <div className={`card-dark border-2 transition-all relative ${
              formData.launchType === 'premium' 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}>
              <div className="absolute -top-2 -right-2">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  Recommended
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Premium Launch</h3>
                <div className="text-lg font-bold text-gradient">0.5 SOL</div>
              </div>
              <p className="text-white/60 text-sm mb-3">~$12 • Professional features</p>
              <ul className="space-y-1 text-xs text-white/70">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-400" />
                  Everything in Basic
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-purple-400" />
                  Anti-sniper protection
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-purple-400" />
                  Custom parameters
                </li>
              </ul>
            </div>
          </label>
        </div>
      </div>

      {/* Auto-generated Info */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Auto-Generated Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-white/60">Total Supply:</span>
            <span className="text-white ml-2">1,000,000,000</span>
          </div>
          <div>
            <span className="text-white/60">Decimals:</span>
            <span className="text-white ml-2">9</span>
          </div>
          <div>
            <span className="text-white/60">Your Allocation:</span>
            <span className="text-white ml-2">800,000,000 (80%)</span>
          </div>
          <div>
            <span className="text-white/60">Liquidity:</span>
            <span className="text-white ml-2">200,000,000 (20%)</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-gradient flex items-center justify-center gap-2 text-lg py-4"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating Token + Pool...
          </>
        ) : (
          <>
            <Image className="w-5 h-5" />
            Create Token + Pool ({formData.launchType === 'premium' ? '0.5' : '0.2'} SOL)
          </>
        )}
      </button>

      {/* Disclaimer */}
      <p className="text-xs text-white/60 text-center">
        By creating a token, you agree that this is for educational/testing purposes. 
        Always verify contracts and do your own research.
      </p>
    </form>
  );
};

export default TokenCreationForm; 