import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file. Supports both ts-node and compiled execution.
const envPath = path.resolve(process.cwd(), 'backend/private/.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

import express, { Request, Response } from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import multer from 'multer';
import fs from 'fs';
import { insert, selectAll, selectColumn, loginUser } from './queries';
import { hashPassword, sanitizeUser } from './security/password';
import { verifyToken, generateToken } from './security/auth';

// Initialize Express application with middleware.
const server = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Setup middleware
server.use(express.json()); // Parse incoming JSON request bodies
server.use(cors()); // Enable Cross-Origin Resource Sharing

// Serve static files from public directory for file downloads
server.use('/uploads', express.static(uploadsDir));
console.log('Static files path configured:', uploadsDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Only allow PDF and common document formats
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
    }
  }
});

/**
 * MySQL database connection pool.
 * Credentials are loaded from environment variables defined in backend/private/.env
 */
const db = mysql.createConnection({
  host: process.env['DB_HOST'],
  port: Number(process.env['DB_PORT']),
  user: process.env['DB_USER'],
  password: process.env['DB_PASS'],
  database: process.env['DB_NAME']
});

// Export database connection for use in queries.ts
export { db };

/**
 * Establish database connection and log connection status.
 */
db.connect((error: mysql.QueryError | null) => {
  if (error) {
    console.error('Error connecting to database:', error);
  } else {
    console.log('Connected to database.');
  }
});

/**
 * Start Express server and listen on the configured port.
 */
server.listen(process.env['PORT'], (error?: Error) => {
  if (error) {
    console.error('Error starting server:', error);
  } else {
    console.log(`Server is running on port ${process.env['PORT']}`);
  }
});

// ============================================
// ROUTES
// ============================================

/**
 * GET /users
 * Retrieves all users from the database.
 */
server.get('/users', (req: Request, res: Response) => {
  selectAll('users')(req, res);
});

/**
 * GET /users/email
 * Retrieves all user email addresses.
 */
server.get('/users/email', (req: Request, res: Response) => {
  selectColumn('users', 'email')(req, res);
});

/**
 * POST /users
 * Creates a new user account with email and password.
 * - Validates required fields (email, password)
 * - Derives username from email
 * - Hashes password using bcrypt
 * - Returns JWT token and sanitized user object (without password)
 */
server.post('/users', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }
    const username = email.split('@')[0];
    const hashed = await hashPassword(password);

    // Insert user directly
    db.query(
      'INSERT INTO users (email, password, username) VALUES (?, ?, ?)',
      [email, hashed, username],
      (error: any, results: any) => {
        if (error) {
          console.error('User creation failed:', error);
          return res.status(500).json({ error: 'internal error' });
        }
        
        // Generate JWT token
        const token = generateToken(results.insertId, email);
        return res.status(201).json({
          token,
          user: { id: results.insertId, email }
        });
      }
    );
  } catch (e) {
    console.error('User creation failed:', e);
    res.status(500).json({ error: 'internal error' });
  }
});

/**
 * POST /users/login
 * Authenticates a user by email and password.
 * - Verifies credentials against bcrypt-hashed password
 * - Returns JWT token and sanitized user object (without password) on success
 * - Returns 401 Unauthorized on invalid credentials
 */
server.post('/users/login', loginUser('users'));

/**
 * GET /users/me
 * Protected endpoint - requires valid JWT token in Authorization header
 * Returns the current authenticated user's information
 */
server.get('/users/me', verifyToken, (req: Request, res: Response) => {
  res.json({
    id: req.user?.id,
    email: req.user?.email
  });
});

/**
 * POST /upload
 * Uploads a CV file and stores metadata in database
 * - Requires authentication (userId in request body or headers)
 * - Accepts PDF, DOC, DOCX, and TXT files (10MB max)
 * - Stores file in public/uploads directory
 * - Records file metadata in file_uploads table
 */
server.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const { originalname, filename, size, mimetype } = req.file;
    const filePath = `/uploads/${filename}`;

    // Insert file metadata into database
    const query = 'INSERT INTO file_uploads (fileName, originalFileName, fileSize, mimeType, filePath, createdBy) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [filename, originalname, size, mimetype, filePath, userId], (error: mysql.QueryError | null, results: any) => {
      if (error) {
        console.error('Error saving file metadata:', error);
        // Clean up uploaded file if database insert fails
        fs.unlink(path.join(uploadsDir, filename), (unlinkError) => {
          if (unlinkError) console.error('Error deleting file:', unlinkError);
        });
        return res.status(500).json({ error: 'Failed to save file metadata' });
      }

      res.json({
        success: true,
        fileId: results.insertId,
        fileName: originalname,
        filePath: filePath,
        fileSize: size,
        message: 'File uploaded successfully'
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

/**
 * GET /uploads/:userId
 * Retrieves all uploaded files for a user
 */
server.get('/uploads/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const query = 'SELECT id, fileName, originalFileName, fileSize, mimeType, filePath, createdAt FROM file_uploads WHERE createdBy = ? ORDER BY createdAt DESC';
    
    db.query(query, [userId], (error: mysql.QueryError | null, results: any) => {
      if (error) {
        console.error('Error retrieving files:', error);
        return res.status(500).json({ error: 'Failed to retrieve files' });
      }
      
      res.json(results || []);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

