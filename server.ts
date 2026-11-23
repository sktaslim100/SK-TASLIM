import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

const ALLOWED_SOURCES = new Set([
  'contact_appointment',
  'callback_request',
  'syllabus_download',
]);

interface AppointmentBody {
  firstName?: unknown;
  lastName?: unknown;
  fullName?: unknown;
  phone?: unknown;
  email?: unknown;
  course?: unknown;
  preferredDate?: unknown;
  preferredTime?: unknown;
  source?: unknown;
}

function cleanString(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function normalizeEnvValue(raw: string | undefined): string {
  if (!raw) return '';
  return raw
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/^Bearer\s+/i, '')
    .trim();
}

function resolveSupabaseConfig(): { supabaseUrl: string | null; supabaseKey: string } {
  let rawUrl = normalizeEnvValue(process.env.SUPABASE_URL);
  let projectId = normalizeEnvValue(process.env.SUPABASE_PROJECT_ID);
  let supabaseKey = normalizeEnvValue(
    process.env.SUPABASE_API_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_KEY
  );

  // Recover gracefully if SUPABASE_PROJECT_ID and SUPABASE_API_KEY were swapped in Secrets
  const looksLikeKey = (v: string) => v.startsWith('sb_') || v.split('.').length === 3;
  const looksLikeProjectId = (v: string) => /^[a-z0-9]{15,30}$/i.test(v);

  if (looksLikeKey(projectId) && looksLikeProjectId(supabaseKey)) {
    const tmp = projectId;
    projectId = supabaseKey;
    supabaseKey = tmp;
  }

  let candidate = rawUrl || projectId;
  if (candidate && /^[a-z0-9-]+$/i.test(candidate)) {
    candidate = `https://${candidate}.supabase.co`;
  }

  let supabaseUrl: string | null = null;
  if (candidate) {
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co')) {
        supabaseUrl = parsed.origin;
      }
    } catch {
      supabaseUrl = null;
    }
  }

  return { supabaseUrl, supabaseKey };
}

function resolveTableName(): string {
  const raw = normalizeEnvValue(process.env.SUPABASE_APPOINTMENTS_TABLE || 'appointments');
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(raw) ? raw : 'appointments';
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/appointments', async (req: Request, res: Response) => {
    try {
      const body = (req.body || {}) as AppointmentBody;

      let firstName = cleanString(body.firstName, 80);
      let lastName = cleanString(body.lastName, 80);
      const fullName = cleanString(body.fullName, 160);

      if (!firstName && fullName) {
        const parts = fullName.split(/\s+/);
        firstName = parts[0] || '';
        lastName = parts.slice(1).join(' ');
      }

      const phone = cleanString(body.phone, 24);
      const email = cleanString(body.email, 160);
      const course = cleanString(body.course, 140) || 'VMware Certification Master Program';
      const preferredDate = cleanString(body.preferredDate, 20);
      const preferredTime = cleanString(body.preferredTime, 40);
      const rawSource = cleanString(body.source, 40);
      const source = ALLOWED_SOURCES.has(rawSource) ? rawSource : 'contact_appointment';

      const phoneDigits = phone.replace(/\D/g, '');
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!firstName || phoneDigits.length < 10 || phoneDigits.length > 15 || !isEmailValid) {
        res.status(400).json({
          error: 'Please provide a valid name, 10-15 digit phone number, and email address.',
        });
        return;
      }

      if (preferredDate && !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
        res.status(400).json({ error: 'Invalid appointment date format.' });
        return;
      }

      const { supabaseUrl, supabaseKey } = resolveSupabaseConfig();

      if (!supabaseUrl || !supabaseKey) {
        res.status(503).json({
          error:
            'Supabase storage is not configured yet. Please add SUPABASE_PROJECT_ID and SUPABASE_API_KEY in Settings -> Secrets.',
        });
        return;
      }

      const tableName = resolveTableName();
      const endpoint = `${supabaseUrl}/rest/v1/${tableName}`;

      const record = {
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        course,
        preferred_date: preferredDate || null,
        preferred_time: preferredTime || null,
        source,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Prefer: 'return=minimal',
      };

      // Legacy Supabase JWT keys (3 dot-separated segments) require Authorization: Bearer;
      // modern sb_publishable_ / sb_secret_ keys must only be sent in the apikey header.
      if (supabaseKey.split('.').length === 3) {
        headers.Authorization = `Bearer ${supabaseKey}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(record),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase insert error:', response.status, errorText);

        if (response.status === 404 || errorText.includes('42P01')) {
          res.status(502).json({
            error: `Supabase table "${tableName}" was not found. Please create the "${tableName}" table in your Supabase SQL Editor.`,
          });
          return;
        }

        if (errorText.includes('Invalid API key')) {
          res.status(502).json({
            error:
              'Supabase rejected the API key ("Invalid API key"). Verify SUPABASE_API_KEY in Settings -> Secrets matches your project\'s sb_publishable_... or anon key without extra characters.',
          });
          return;
        }

        if (response.status === 401 || response.status === 403 || errorText.includes('42501')) {
          res.status(502).json({
            error: `Supabase rejected the insert due to permissions or RLS policy on "${tableName}". Ensure an INSERT policy is enabled.`,
          });
          return;
        }

        res.status(502).json({
          error: 'Unable to save appointment to Supabase. Please verify your table schema and API key.',
        });
        return;
      }

      res.status(201).json({
        ok: true,
        appointment: record,
      });
    } catch (err) {
      console.error('Appointment submission error:', err);
      res.status(500).json({ error: 'Unexpected server error while saving your appointment.' });
    }
  });

  if (IS_PROD) {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
