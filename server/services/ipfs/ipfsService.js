const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const config = require('../../config');

class IPFSService {
  constructor() {
    // Initialize IPFS client configuration for Infura
    this.apiUrl = config.ipfs.apiUrl || 'https://ipfs.infura.io:5001';
    this.auth = config.ipfs.projectId && config.ipfs.projectSecret 
      ? `Basic ${Buffer.from(`${config.ipfs.projectId}:${config.ipfs.projectSecret}`).toString('base64')}`
      : null;
    this.gateway = config.ipfs.gateway || 'https://ipfs.io/ipfs/';
  }

  /**
   * Upload file to IPFS via Infura API
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} filename - Original filename
   * @param {string} mimeType - File MIME type
   * @returns {Object} Upload result
   */
  async uploadFile(fileBuffer, filename, mimeType) {
    try {
      console.log('📤 Uploading file to IPFS:', filename);

      // Calculate file hash for deduplication
      const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Create form data
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: filename,
        contentType: mimeType
      });

      // Upload to IPFS via Infura
      const response = await axios.post(`${this.apiUrl}/api/v0/add`, formData, {
        headers: {
          ...formData.getHeaders(),
          ...(this.auth && { Authorization: this.auth })
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      const ipfsHash = response.data.Hash;
      const ipfsUrl = `${this.gateway}${ipfsHash}`;

      console.log('✅ File uploaded to IPFS:', ipfsHash);

      return {
        fileHash,
        ipfsHash,
        ipfsUrl,
        filename,
        mimeType,
        fileSize: fileBuffer.length
      };

    } catch (error) {
      console.error('❌ IPFS upload failed:', error.response?.data || error.message);
      
      // Fallback: return a mock response for development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Using mock IPFS response for development');
        const mockHash = crypto.createHash('sha256').update(fileBuffer).digest('hex').substring(0, 46);
        return {
          fileHash: crypto.createHash('sha256').update(fileBuffer).digest('hex'),
          ipfsHash: `Qm${mockHash}`,
          ipfsUrl: `https://ipfs.io/ipfs/Qm${mockHash}`,
          filename,
          mimeType,
          fileSize: fileBuffer.length
        };
      }
      
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  /**
   * Upload token logo and create metadata
   * @param {Buffer} logoBuffer - Logo image buffer
   * @param {string} logoFilename - Logo filename
   * @param {string} logoMimeType - Logo MIME type
   * @param {Object} tokenData - Token metadata
   * @returns {Object} Metadata upload result
   */
  async uploadTokenMetadata(logoBuffer, logoFilename, logoMimeType, tokenData) {
    try {
      console.log('📋 Creating token metadata for:', tokenData.name);

      // Upload logo first
      const logoUpload = await this.uploadFile(logoBuffer, logoFilename, logoMimeType);

      // Create token metadata JSON
      const metadata = {
        name: tokenData.name,
        symbol: tokenData.symbol,
        description: this.generateDescription(tokenData.name, tokenData.symbol),
        image: logoUpload.ipfsUrl,
        external_url: '',
        attributes: [
          {
            trait_type: 'Total Supply',
            value: `${tokenData.supply.toLocaleString()} ${tokenData.symbol}`
          },
          {
            trait_type: 'Decimals',
            value: tokenData.decimals
          },
          {
            trait_type: 'Launch Type',
            value: tokenData.launchType === 'premium' ? 'Premium Launch' : 'Basic Launch'
          },
          {
            trait_type: 'Platform',
            value: 'Meteora Token Launcher'
          },
          {
            trait_type: 'Created',
            value: new Date().toISOString().split('T')[0]
          }
        ],
        properties: {
          files: [
            {
              uri: logoUpload.ipfsUrl,
              type: logoMimeType
            }
          ],
          category: 'image',
          creators: [
            {
              address: tokenData.creatorWallet,
              share: 100
            }
          ]
        }
      };

      // Upload metadata JSON
      const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
      const metadataUpload = await this.uploadFile(
        metadataBuffer,
        `${tokenData.symbol.toLowerCase()}-metadata.json`,
        'application/json'
      );

      console.log('✅ Token metadata uploaded:', metadataUpload.ipfsHash);

      return {
        logoUpload,
        metadataUpload,
        metadata,
        metadataUri: metadataUpload.ipfsUrl
      };

    } catch (error) {
      console.error('❌ Token metadata upload failed:', error);
      throw new Error(`Metadata upload failed: ${error.message}`);
    }
  }

  /**
   * Generate auto description for token
   * @param {string} name - Token name
   * @param {string} symbol - Token symbol
   * @returns {string} Generated description
   */
  generateDescription(name, symbol) {
    const templates = [
      `${name} (${symbol}) is a community-driven token launched on Solana with instant liquidity via Meteora DLMM pools.`,
      `${name} represents innovation in the Solana ecosystem. ${symbol} tokens are immediately tradeable on Jupiter and all major DEX aggregators.`,
      `Welcome to ${name}! ${symbol} is powered by professional-grade Meteora liquidity infrastructure for seamless trading.`,
      `${name} (${symbol}) - Built for the community, powered by Meteora's advanced DLMM technology for optimal price discovery.`,
      `${name} brings new possibilities to Solana. Trade ${symbol} instantly on Jupiter with deep liquidity from day one.`
    ];

    // Select random template
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }

  /**
   * Upload JSON data to IPFS
   * @param {Object} data - JSON data to upload
   * @param {string} filename - Filename for the JSON
   * @returns {Object} Upload result
   */
  async uploadJSON(data, filename) {
    try {
      const jsonBuffer = Buffer.from(JSON.stringify(data, null, 2));
      return await this.uploadFile(jsonBuffer, filename, 'application/json');
    } catch (error) {
      console.error('❌ JSON upload failed:', error);
      throw error;
    }
  }

  /**
   * Fetch content from IPFS
   * @param {string} ipfsHash - IPFS hash
   * @returns {Buffer} File content
   */
  async fetchContent(ipfsHash) {
    try {
      const response = await axios.get(`${this.gateway}${ipfsHash}`, {
        responseType: 'arraybuffer',
        timeout: 10000
      });
      return Buffer.from(response.data);
    } catch (error) {
      console.error('❌ IPFS fetch failed:', error);
      throw new Error(`IPFS fetch failed: ${error.message}`);
    }
  }

  /**
   * Pin content to ensure persistence
   * @param {string} ipfsHash - IPFS hash to pin
   * @returns {boolean} Pin success
   */
  async pinContent(ipfsHash) {
    try {
      if (!this.auth) {
        console.log('⚠️ No IPFS auth configured, skipping pin');
        return true;
      }

      const response = await axios.post(`${this.apiUrl}/api/v0/pin/add?arg=${ipfsHash}`, null, {
        headers: {
          Authorization: this.auth
        }
      });

      console.log('📌 Content pinned:', ipfsHash);
      return true;
    } catch (error) {
      console.error('❌ IPFS pinning failed:', error);
      return false;
    }
  }

  /**
   * Validate image file
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} mimeType - MIME type
   * @returns {boolean} Is valid image
   */
  validateImage(fileBuffer, mimeType) {
    // Check MIME type
    if (!config.upload.allowedMimeTypes.includes(mimeType)) {
      throw new Error(`Invalid file type. Allowed: ${config.upload.allowedMimeTypes.join(', ')}`);
    }

    // Check file size
    if (fileBuffer.length > config.upload.maxFileSize) {
      throw new Error(`File too large. Max size: ${config.upload.maxFileSize / 1024 / 1024}MB`);
    }

    // Basic image validation (check for image headers)
    const imageHeaders = {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'image/gif': [0x47, 0x49, 0x46],
      'image/webp': [0x52, 0x49, 0x46, 0x46]
    };

    const header = imageHeaders[mimeType];
    if (header) {
      for (let i = 0; i < header.length; i++) {
        if (fileBuffer[i] !== header[i]) {
          throw new Error('Invalid image file format');
        }
      }
    }

    return true;
  }

  /**
   * Get IPFS gateway URL
   * @param {string} ipfsHash - IPFS hash
   * @returns {string} Gateway URL
   */
  getGatewayUrl(ipfsHash) {
    return `${config.ipfs.gateway}${ipfsHash}`;
  }

  /**
   * Check if IPFS content exists
   * @param {string} ipfsHash - IPFS hash
   * @returns {boolean} Content exists
   */
  async contentExists(ipfsHash) {
    try {
      const response = await axios.head(this.getGatewayUrl(ipfsHash), {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get content stats
   * @param {string} ipfsHash - IPFS hash
   * @returns {Object} Content statistics
   */
  async getContentStats(ipfsHash) {
    try {
      const response = await axios.head(`${this.gateway}${ipfsHash}`, {
        timeout: 5000
      });
      
      return {
        hash: ipfsHash,
        size: parseInt(response.headers['content-length']) || 0,
        type: response.headers['content-type'] || 'unknown',
        exists: response.status === 200
      };
    } catch (error) {
      console.error('❌ Failed to get content stats:', error);
      return {
        hash: ipfsHash,
        size: 0,
        type: 'unknown',
        exists: false
      };
    }
  }
}

module.exports = IPFSService; 