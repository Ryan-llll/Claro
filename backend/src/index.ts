import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { extractTextAndHash } from './parser.js';
import { generateLectureDigest } from './ai.js';
import { DigestResponse } from './types.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4001;
const prisma = new PrismaClient();

// Multer in-memory storage (accepts PDF, DOCX, PPTX up to 25MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

app.use(cors());
app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      service: 'claro-backend',
      timestamp: new Date().toISOString(),
      database: 'connected (PostgreSQL)',
    });
  } catch (error) {
    res.status(500).json({
      status: 'degraded',
      service: 'claro-backend',
      error: error instanceof Error ? error.message : 'Database unavailable',
    });
  }
});

/**
 * Auth: Register a new student account
 */
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    if (cleanEmail.length < 5 || !cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = crypto.createHash('sha256').update(String(password) + 'claro_salt').digest('hex');

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    console.log(`[Auth] ✨ Created new account for: ${user.name} (${user.email})`);

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

/**
 * Auth: Sign In
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const hashedPassword = crypto.createHash('sha256').update(String(password) + 'claro_salt').digest('hex');

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user || user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    console.log(`[Auth] ✨ Logged in: ${user.name} (${user.email})`);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    res.status(500).json({ error: 'Failed to sign in.' });
  }
});

/**
 * Settings Status: Check if Gemini API key is configured
 */
app.get('/api/settings/status', (_req: Request, res: Response) => {
  const key = process.env.GEMINI_API_KEY?.trim();
  res.json({
    hasKey: Boolean(key && key.length > 8 && key !== 'your_gemini_key_here'),
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  });
});

/**
 * Settings Key: Save API key in memory and in .env
 */
app.post('/api/settings/key', (req: Request, res: Response) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 8) {
    return res.status(400).json({ error: 'Please enter a valid Google Gemini API key.' });
  }

  const cleanKey = apiKey.trim();
  process.env.GEMINI_API_KEY = cleanKey;

  // Persist to .env file if available
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, 'utf-8');
      if (content.includes('GEMINI_API_KEY=')) {
        content = content.replace(/GEMINI_API_KEY=.*$/m, `GEMINI_API_KEY="${cleanKey}"`);
      } else {
        content += `\nGEMINI_API_KEY="${cleanKey}"\n`;
      }
      fs.writeFileSync(envPath, content, 'utf-8');
    }
  } catch (err) {
    console.warn('[Settings] Note: could not write to .env:', err);
  }

  console.log('[Settings] ✨ Gemini API key updated successfully!');
  return res.json({ success: true, message: 'Gemini API key configured successfully!' });
});

/**
 * List all cached digests from PostgreSQL
 */
app.get('/api/digests', async (_req: Request, res: Response) => {
  try {
    const digests = await prisma.digest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        fileName: true,
        title: true,
        createdAt: true,
      },
    });
    res.json(digests);
  } catch (error) {
    console.error('[API] Error fetching digests:', error);
    res.status(500).json({ error: 'Failed to retrieve digests' });
  }
});

/**
 * Get a specific digest by ID
 */
app.get('/api/digests/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const digest = await prisma.digest.findUnique({
      where: { id },
    });

    if (!digest) {
      return res.status(404).json({ error: 'Digest not found' });
    }

    const payload = digest.payload as any;
    const response: DigestResponse = {
      id: digest.id,
      fileName: digest.fileName,
      title: digest.title,
      overview: payload.overview,
      glossary: payload.glossary,
      microCards: payload.microCards,
      audioScript: payload.audioScript,
      cached: true,
    };

    return res.json(response);
  } catch (error) {
    console.error('[API] Error getting digest:', error);
    return res.status(500).json({ error: 'Failed to retrieve digest' });
  }
});

/**
 * Delete a specific digest by ID
 */
app.delete('/api/digests/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.digest.delete({
      where: { id },
    });
    console.log(`[API] 🗑️ Deleted digest ID: ${id}`);
    return res.json({ success: true, message: 'Lecture deleted successfully' });
  } catch (error) {
    console.error('[API] Error deleting digest:', error);
    return res.status(500).json({ error: 'Failed to delete lecture' });
  }
});

/**
 * Main Digest Generation / Cache Endpoint
 */
app.post('/api/digest', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a PDF, DOCX, or PPTX file.' });
    }

    const file = req.file;
    console.log(`[API] Processing upload: ${file.originalname} (${(file.size / 1024).toFixed(1)} KB)`);

    // 1. Extract text, slide images, and compute SHA-256 hash
    const extractedDoc = await extractTextAndHash(file.buffer, file.originalname);
    const { fileHash, charCount } = extractedDoc;
    console.log(`[API] File SHA-256: ${fileHash.substring(0, 16)}... | Length: ${charCount} chars | Images: ${extractedDoc.slideImages?.length || 0}`);

    // 2. Check PostgreSQL cache
    const existing = await prisma.digest.findUnique({
      where: { fileHash },
    });

    if (existing) {
      console.log(`[API] ⚡ Cache HIT for file: ${file.originalname}`);
      const payload = existing.payload as any;
      const cachedResponse: DigestResponse = {
        id: existing.id,
        fileName: existing.fileName,
        title: existing.title,
        overview: payload.overview,
        glossary: payload.glossary,
        microCards: payload.microCards,
        audioScript: payload.audioScript,
        cached: true,
      };
      return res.json(cachedResponse);
    }

    // 3. Cache miss: invoke Gemini AI
    console.log(`[API] ✨ Cache MISS. Generating structured digest with Gemini AI...`);
    const aiResult = await generateLectureDigest(extractedDoc, file.originalname);

    // 4. Save to PostgreSQL database
    const userIdHeader = req.headers['x-user-id'] || req.body?.userId;
    const userId = typeof userIdHeader === 'string' && userIdHeader.length > 5 ? userIdHeader : undefined;

    const saved = await prisma.digest.create({
      data: {
        fileHash,
        fileName: file.originalname,
        title: aiResult.title,
        payload: aiResult as any,
        ...(userId ? { userId } : {}),
      },
    });

    console.log(`[API] Saved new digest to database with ID: ${saved.id}`);

    const freshResponse: DigestResponse = {
      id: saved.id,
      fileName: saved.fileName,
      title: saved.title,
      overview: aiResult.overview,
      glossary: aiResult.glossary,
      microCards: aiResult.microCards,
      audioScript: aiResult.audioScript,
      cached: false,
    };

    return res.json(freshResponse);
  } catch (error) {
    console.error('[API] Error processing digest request:', error);
    const msg = error instanceof Error ? error.message : String(error);
    const isMissingKey = msg.includes('MISSING_GEMINI_KEY');

    return res.status(isMissingKey ? 400 : 500).json({
      error: msg,
      code: isMissingKey ? 'MISSING_GEMINI_KEY' : 'PROCESSING_ERROR',
      details: msg,
    });
  }
});

// Start Express Server
app.listen(port, () => {
  console.log(`===============================================`);
  console.log(`🚀 Claro Backend running on http://localhost:${port}`);
  console.log(`📚 PostgreSQL connection active on database "claro"`);
  console.log(`⚡ API ready: POST /api/digest | GET /api/health`);
  console.log(`===============================================`);
});
