const express = require('express');
const multer = require('multer');
const router = express.Router();

// Import services
const IPFSService = require('../services/ipfs/ipfsService');

// Import database models (with fallback)
let Upload;
try {
  const db = require('../models/database');
  Upload = db.Upload;
  console.log('✅ Upload database models loaded');
} catch (error) {
  console.warn('⚠️  Database not available for uploads, using mock mode');
  // Create mock database operations
  Upload = {
    create: async (data) => ({ id: Math.random(), ...data }),
    findByHash: async () => null
  };
}

const config = require('../config');

// Initialize services
const ipfsService = new IPFSService(config.ipfs);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

/**
 * POST /api/upload/logo
 * Upload logo to IPFS
 */
router.post('/logo', upload.single('logo'), async (req, res) => {
  try {
    console.log('📤 Logo upload request received');

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    // Validate image
    try {
      ipfsService.validateImage(req.file.buffer, req.file.mimetype);
    } catch (validationError) {
      return res.status(400).json({
        error: 'Invalid image file',
        message: validationError.message
      });
    }

    // Upload to IPFS
    const uploadResult = await ipfsService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Save upload record to database
    const uploadRecord = await Upload.create({
      fileHash: uploadResult.fileHash,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      ipfsHash: uploadResult.ipfsHash,
      ipfsUrl: uploadResult.ipfsUrl,
      uploadedBy: req.body.walletAddress || null
    });

    console.log('✅ Logo uploaded successfully:', uploadResult.ipfsHash);

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: {
        fileHash: uploadResult.fileHash,
        ipfsHash: uploadResult.ipfsHash,
        ipfsUrl: uploadResult.ipfsUrl,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        uploadId: uploadRecord.id
      }
    });

  } catch (error) {
    console.error('❌ Logo upload failed:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

/**
 * POST /api/upload/metadata
 * Upload JSON metadata to IPFS
 */
router.post('/metadata', async (req, res) => {
  try {
    console.log('📋 Metadata upload request received');

    const { metadata, filename } = req.body;

    if (!metadata || !filename) {
      return res.status(400).json({
        error: 'Metadata and filename are required'
      });
    }

    // Validate metadata structure
    if (!metadata.name || !metadata.symbol) {
      return res.status(400).json({
        error: 'Metadata must include name and symbol'
      });
    }

    // Upload to IPFS
    const uploadResult = await ipfsService.uploadJSON(metadata, filename);

    console.log('✅ Metadata uploaded successfully:', uploadResult.ipfsHash);

    res.json({
      success: true,
      message: 'Metadata uploaded successfully',
      data: {
        ipfsHash: uploadResult.ipfsHash,
        ipfsUrl: uploadResult.ipfsUrl,
        filename: filename,
        metadata: metadata
      }
    });

  } catch (error) {
    console.error('❌ Metadata upload failed:', error);
    res.status(500).json({
      error: 'Metadata upload failed',
      message: error.message
    });
  }
});

/**
 * GET /api/upload/:ipfsHash
 * Get upload information by IPFS hash
 */
router.get('/:ipfsHash', async (req, res) => {
  try {
    const { ipfsHash } = req.params;

    if (!ipfsHash) {
      return res.status(400).json({
        error: 'IPFS hash is required'
      });
    }

    // Find upload record
    const upload = await Upload.findByHash(ipfsHash);
    
    if (!upload) {
      return res.status(404).json({
        error: 'Upload not found'
      });
    }

    // Check if content still exists on IPFS
    const exists = await ipfsService.contentExists(ipfsHash);

    res.json({
      success: true,
      data: {
        id: upload.id,
        fileHash: upload.file_hash,
        originalName: upload.original_name,
        mimeType: upload.mime_type,
        fileSize: upload.file_size,
        ipfsHash: upload.ipfs_hash,
        ipfsUrl: upload.ipfs_url,
        uploadedBy: upload.uploaded_by,
        createdAt: upload.created_at,
        exists: exists
      }
    });

  } catch (error) {
    console.error('❌ Failed to get upload info:', error);
    res.status(500).json({
      error: 'Failed to get upload info',
      message: error.message
    });
  }
});

/**
 * POST /api/upload/validate
 * Validate file before upload
 */
router.post('/validate', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided'
      });
    }

    // Validate image
    try {
      ipfsService.validateImage(req.file.buffer, req.file.mimetype);
      
      res.json({
        success: true,
        message: 'File is valid',
        data: {
          filename: req.file.originalname,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          valid: true
        }
      });

    } catch (validationError) {
      res.status(400).json({
        success: false,
        error: 'Invalid file',
        message: validationError.message,
        data: {
          filename: req.file.originalname,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          valid: false
        }
      });
    }

  } catch (error) {
    console.error('❌ File validation failed:', error);
    res.status(500).json({
      error: 'Validation failed',
      message: error.message
    });
  }
});

/**
 * GET /api/upload/stats/summary
 * Get upload statistics summary
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const { pool } = require('../models/database');
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total_uploads,
        SUM(file_size) as total_size,
        COUNT(DISTINCT uploaded_by) as unique_uploaders,
        AVG(file_size) as avg_file_size
      FROM uploads
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `;

    const result = await pool.query(statsQuery);
    const stats = result.rows[0];

    res.json({
      success: true,
      data: {
        totalUploads: parseInt(stats.total_uploads) || 0,
        totalSize: parseInt(stats.total_size) || 0,
        uniqueUploaders: parseInt(stats.unique_uploaders) || 0,
        avgFileSize: parseFloat(stats.avg_file_size) || 0,
        period: '30 days'
      }
    });

  } catch (error) {
    console.error('❌ Failed to get upload stats:', error);
    res.status(500).json({
      error: 'Failed to get upload stats',
      message: error.message
    });
  }
});

/**
 * DELETE /api/upload/:ipfsHash
 * Remove upload record (content remains on IPFS)
 */
router.delete('/:ipfsHash', async (req, res) => {
  try {
    const { ipfsHash } = req.params;

    if (!ipfsHash) {
      return res.status(400).json({
        error: 'IPFS hash is required'
      });
    }

    // Find and remove upload record
    const { pool } = require('../models/database');
    const result = await pool.query(
      'DELETE FROM uploads WHERE ipfs_hash = $1 RETURNING *',
      [ipfsHash]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Upload record not found'
      });
    }

    res.json({
      success: true,
      message: 'Upload record removed',
      data: {
        ipfsHash: ipfsHash,
        note: 'Content remains available on IPFS network'
      }
    });

  } catch (error) {
    console.error('❌ Failed to remove upload record:', error);
    res.status(500).json({
      error: 'Failed to remove upload record',
      message: error.message
    });
  }
});

module.exports = router; 