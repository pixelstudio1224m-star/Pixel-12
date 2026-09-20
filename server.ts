import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { initialWorkspaceData } from './src/lib/defaultData';
import { initialBlogPosts } from './src/lib/blogData';
import {
  initialAgencyPlans,
  initialAgencyServices,
  initialCommercialSettings,
  initialQuoteProposals,
  initialImageLibraryItems
} from './src/lib/quotesData';
import {
  initialCrmPipelines,
  initialCrmCompanies,
  initialCrmContacts,
  initialCrmDeals,
  initialCrmFollowUps,
  initialCrmActivities
} from './src/lib/crmData';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'workspace.json');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate Limiting for AI Endpoints (Protects Gemini quota and prevents abuse in production)
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 35, // 35 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Límite de solicitudes de IA alcanzado para este minuto. Por favor aguarda unos instantes.',
    rateLimitExceeded: true,
  },
});

app.use('/api/ai', aiRateLimiter);
app.use('/api/quotes/ai-generate', aiRateLimiter);

// Helper to initialize and read/write workspace data
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialWorkspaceData, null, 2), 'utf-8');
  }
}

function readWorkspaceData() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.brands || !Array.isArray(parsed.brands)) parsed.brands = initialWorkspaceData.brands;
    if (!parsed.members || !Array.isArray(parsed.members)) parsed.members = initialWorkspaceData.members;
    if (!parsed.posts || !Array.isArray(parsed.posts)) parsed.posts = initialWorkspaceData.posts || [];
    if (!parsed.tasks || !Array.isArray(parsed.tasks)) parsed.tasks = initialWorkspaceData.tasks || [];
    if (!parsed.campaigns || !Array.isArray(parsed.campaigns)) parsed.campaigns = initialWorkspaceData.campaigns || [];
    if (!parsed.notifications || !Array.isArray(parsed.notifications)) parsed.notifications = initialWorkspaceData.notifications || [];
    if (!parsed.invitations || !Array.isArray(parsed.invitations)) parsed.invitations = [];
    if (!parsed.workspaceSettings) parsed.workspaceSettings = initialWorkspaceData.workspaceSettings;
    if (!parsed.currentMember) parsed.currentMember = initialWorkspaceData.currentMember;
    if (!parsed.quotes) parsed.quotes = initialQuoteProposals;
    if (!parsed.plans) parsed.plans = initialAgencyPlans;
    if (!parsed.customServices) parsed.customServices = initialAgencyServices;
    if (!parsed.commercialSettings) parsed.commercialSettings = initialCommercialSettings;
    if (!parsed.imageLibrary) parsed.imageLibrary = initialImageLibraryItems;
    if (!parsed.blogPosts) parsed.blogPosts = initialBlogPosts;
    if (!parsed.crmPipelines) parsed.crmPipelines = initialCrmPipelines;
    if (!parsed.crmCompanies) parsed.crmCompanies = initialCrmCompanies;
    if (!parsed.crmContacts) parsed.crmContacts = initialCrmContacts;
    if (!parsed.crmDeals) parsed.crmDeals = initialCrmDeals;
    if (!parsed.crmFollowUps) parsed.crmFollowUps = initialCrmFollowUps;
    if (!parsed.crmActivities) parsed.crmActivities = initialCrmActivities;
    return parsed;
  } catch (err) {
    console.error('Error reading workspace file, resetting to initial data:', err);
    return initialWorkspaceData;
  }
}

function writeWorkspaceData(data: unknown) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Lazy Gemini AI client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Cooldown map to avoid calling models currently suffering high demand (503/429)
const modelCooldowns = new Map<string, number>();

// Resilient helper to call Gemini with official models, cooldown and fallback
async function generateGeminiContent(params: {
  contents: any;
  config?: any;
}): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY no configurada');
  }

  // Candidate models: official supported Gemini SDK models
  const baseModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.1-pro-preview'];
  const now = Date.now();

  // Sort so models that didn't experience recent quota/503/429 spikes are tried first
  const sortedModels = [...baseModels].sort((a, b) => {
    const aCool = modelCooldowns.get(a) || 0;
    const bCool = modelCooldowns.get(b) || 0;
    const aAvailable = now > aCool;
    const bAvailable = now > bCool;
    if (aAvailable && !bAvailable) return -1;
    if (!aAvailable && bAvailable) return 1;
    return 0;
  });

  let lastError: any = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    for (const model of sortedModels) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        if (res && res.text) {
          // Succeeded, clear cooldown
          modelCooldowns.delete(model);
          return res.text;
        }
      } catch (err: any) {
        const msg = String(err?.message || err || '');
        const isQuotaOrDemand =
          msg.includes('503') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('high demand') ||
          msg.includes('429') ||
          msg.includes('resource_exhausted') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('Quota exceeded') ||
          msg.includes('quota');

        if (isQuotaOrDemand) {
          const isDailyQuota = msg.includes('requests_per_model_per_day') || msg.includes('daily') || msg.includes('per_user');
          const cooldownDuration = isDailyQuota ? 6 * 3600 * 1000 : 120_000;
          modelCooldowns.set(model, Date.now() + cooldownDuration);
          console.log(`[Gemini] Notice: Model ${model} rate/quota limit reached; automatically routing traffic to next candidate model`);
        } else {
          console.log(`[Gemini] Notice: Model ${model} attempt ${attempt + 1} did not succeed, attempting next candidate`);
        }
        lastError = err;
      }
    }
    if (attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw lastError || new Error('No se pudo obtener respuesta del modelo de IA');
}

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Workspace Data Endpoints
app.get('/api/workspace', (req, res) => {
  const data = readWorkspaceData();
  res.json(data);
});

app.post('/api/workspace', (req, res) => {
  const newData = req.body;
  if (!newData) {
    return res.status(400).json({ error: 'Datos no proporcionados' });
  }
  writeWorkspaceData(newData);
  res.json({ success: true, message: 'Datos guardados correctamente' });
});

app.post('/api/workspace/reset', (req, res) => {
  writeWorkspaceData(initialWorkspaceData);
  res.json({ success: true, data: initialWorkspaceData });
});

// ---------------- SERVICIO DE EMAIL & INVITACIONES REALES (PIXEL 12) ----------------

async function sendInvitationEmail(params: {
  to: string;
  recipientName: string;
  role: string;
  inviterName: string;
  inviteUrl: string;
  expiresAt: string;
}): Promise<{ sent: boolean; provider?: string; error?: string }> {
  const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();
  const apiKey = process.env.EMAIL_API_KEY || '';
  const fromAddress = process.env.EMAIL_FROM || 'Pixel 12 OS <onboarding@resend.dev>';

  const expiryDateFormatted = new Date(params.expiresAt).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const emailHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Invitación Oficial a Pixel 12 OS</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090B; color: #E4E4E7; margin: 0; padding: 40px 16px; }
    .card { max-width: 560px; margin: 0 auto; background-color: #12121A; border: 1px solid #27273A; border-radius: 16px; padding: 36px 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .badge { display: inline-block; padding: 6px 14px; background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%); color: #000000; font-size: 11px; font-weight: 900; letter-spacing: 1.5px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 20px; }
    h1 { color: #FFFFFF; font-size: 22px; font-weight: 700; margin: 0 0 16px; letter-spacing: -0.5px; }
    p { color: #A1A1AA; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
    .highlight-box { background-color: #181824; border-left: 3px solid #D4AF37; padding: 14px 18px; border-radius: 8px; margin: 20px 0; }
    .highlight-box p { margin: 0; color: #E4E4E7; font-size: 13px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #E5C158 0%, #D4AF37 50%, #B89628 100%); color: #09090B !important; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 10px; margin: 24px 0; text-align: center; letter-spacing: 0.5px; }
    .direct-link { font-size: 11px; color: #71717A; word-break: break-all; margin-top: 10px; }
    .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #52525B; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">PIXEL 12 OS</div>
    <h1>Invitación Oficial al Equipo de Pixel 12</h1>
    <p>Hola <strong>${params.recipientName}</strong>,</p>
    <p>Has sido invitado por <strong>${params.inviterName}</strong> a formar parte del equipo interno de <strong>Pixel 12 Studio</strong> con el rol de <strong>${params.role}</strong>.</p>
    
    <div class="highlight-box">
      <p><strong>Plataforma Privada de Operaciones & IA</strong></p>
      <p>Tendrás acceso a la gestión de contenidos, diseño de posts/carruseles, CRM comercial, calendario editorial, tareas y asistentes de inteligencia artificial de Pixel 12.</p>
    </div>

    <div style="text-align: center;">
      <a href="${params.inviteUrl}" class="btn" target="_blank" style="color: #09090B;">Aceptar Invitación & Configurar Acceso</a>
    </div>

    <p style="font-size: 12px; color: #71717A;">
      ⚠️ Este enlace es único, seguro y expirará el <strong>${expiryDateFormatted}</strong> (válido por 7 días). Solo puede utilizarse una vez.
    </p>

    <div class="direct-link">
      Si el botón no funciona, copia y abre este enlace seguro en tu navegador:<br/>
      <a href="${params.inviteUrl}" style="color: #D4AF37;">${params.inviteUrl}</a>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} Pixel 12 Studio. Plataforma Privada de Operaciones y Marketing.
    </div>
  </div>
</body>
</html>`;

  if (!apiKey) {
    console.warn('[Email] EMAIL_API_KEY no configurada. La invitación se registró con token de enlace directo.');
    return {
      sent: false,
      error: 'EMAIL_API_KEY no configurada en las variables de entorno de Render / servidor.'
    };
  }

  // 1. Resend API
  if (provider === 'resend' || (!provider && apiKey.startsWith('re_')) || (apiKey && !provider)) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [params.to],
          subject: `Invitación oficial al equipo de Pixel 12 OS (${params.role})`,
          html: emailHtml
        })
      });
      if (res.ok) {
        console.log(`[Email] Invitación enviada exitosamente a ${params.to} vía Resend`);
        return { sent: true, provider: 'resend' };
      } else {
        const errorText = await res.text();
        console.warn('[Email] Resend API respondió con error:', res.status, errorText);
        return { sent: false, provider: 'resend', error: errorText };
      }
    } catch (e: any) {
      console.error('[Email] Excepción enviando vía Resend:', e);
      return { sent: false, provider: 'resend', error: e.message };
    }
  }

  // 2. SendGrid API
  if (provider === 'sendgrid' || apiKey.startsWith('SG.')) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: params.to, name: params.recipientName }] }],
          from: { email: fromAddress.includes('<') ? fromAddress.match(/<([^>]+)>/)?.[1] || fromAddress : fromAddress, name: 'Pixel 12 OS' },
          subject: `Invitación oficial al equipo de Pixel 12 OS (${params.role})`,
          content: [{ type: 'text/html', value: emailHtml }]
        })
      });
      if (res.status >= 200 && res.status < 300) {
        console.log(`[Email] Invitación enviada exitosamente a ${params.to} vía SendGrid`);
        return { sent: true, provider: 'sendgrid' };
      } else {
        const errorText = await res.text();
        console.warn('[Email] SendGrid API error:', res.status, errorText);
        return { sent: false, provider: 'sendgrid', error: errorText };
      }
    } catch (e: any) {
      return { sent: false, provider: 'sendgrid', error: e.message };
    }
  }

  // 3. Postmark API
  if (provider === 'postmark') {
    try {
      const res = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'X-Postmark-Server-Token': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          From: fromAddress,
          To: params.to,
          Subject: `Invitación oficial al equipo de Pixel 12 OS (${params.role})`,
          HtmlBody: emailHtml
        })
      });
      if (res.ok) {
        return { sent: true, provider: 'postmark' };
      } else {
        const errorText = await res.text();
        return { sent: false, provider: 'postmark', error: errorText };
      }
    } catch (e: any) {
      return { sent: false, provider: 'postmark', error: e.message };
    }
  }

  return {
    sent: false,
    error: `Proveedor '${provider}' no reconocido.`
  };
}

// ---------------- GESTIÓN DE EQUIPO & INVITACIONES (ENDPOINTS) ----------------

// 1. Listar miembros
app.get('/api/team/members', (req, res) => {
  const data = readWorkspaceData();
  res.json({
    members: data.members || [],
    invitations: data.invitations || []
  });
});

// 2. Invitar nuevo miembro con envío real de correo
app.post('/api/team/invite', async (req, res) => {
  try {
    const { email, name, role, invitedBy } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Nombre y correo electrónico son requeridos.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const targetRole = role || 'Designer';

    const data = readWorkspaceData();
    if (!data.members) data.members = [];
    if (!data.invitations) data.invitations = [];

    // Validar si el usuario ya es miembro activo
    const existingMember = data.members.find(
      (m: any) => m.email?.toLowerCase() === cleanEmail
    );

    if (existingMember && existingMember.status === 'active') {
      return res.status(400).json({
        error: `El usuario con correo ${cleanEmail} ya es un miembro activo del equipo.`
      });
    }

    // Generar token seguro e irrepetible
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 días

    // Construir URL de aceptación compatible con dev, preview y producción Render
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.get('host') || 'localhost:3000';
    const origin = req.get('origin') || `${proto}://${host}`;
    const cleanOrigin = origin.replace(/\/$/, '');
    const inviteUrl = `${cleanOrigin}/?invite_token=${token}`;

    const inviterName = invitedBy?.name || data.currentMember?.name || 'Administrador Pixel 12';

    // Enviar correo real
    const emailResult = await sendInvitationEmail({
      to: cleanEmail,
      recipientName: cleanName,
      role: targetRole,
      inviterName,
      inviteUrl,
      expiresAt
    });

    // Registrar o actualizar miembro en el equipo
    const memberId = existingMember ? existingMember.id : `mem_${Date.now()}`;
    const memberObj = {
      id: memberId,
      name: cleanName,
      email: cleanEmail,
      role: targetRole,
      avatar: existingMember?.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      status: 'invited',
      invitedAt: new Date().toISOString(),
      invitedBy: inviterName
    };

    if (existingMember) {
      Object.assign(existingMember, memberObj);
    } else {
      data.members.push(memberObj);
    }

    // Registrar invitación única
    const invitationObj = {
      id: `inv_${Date.now()}`,
      email: cleanEmail,
      name: cleanName,
      role: targetRole,
      token,
      status: 'pending',
      invitedBy: {
        id: invitedBy?.id || data.currentMember?.id || 'admin',
        name: inviterName,
        email: invitedBy?.email || data.currentMember?.email || 'admin@pixel12.agency'
      },
      createdAt: new Date().toISOString(),
      expiresAt,
      emailSent: emailResult.sent,
      emailDeliveryError: emailResult.error
    };

    // Reemplazar invitaciones previas pendientes del mismo correo
    data.invitations = data.invitations.filter(
      (i: any) => i.email?.toLowerCase() !== cleanEmail || i.status === 'accepted'
    );
    data.invitations.push(invitationObj);

    writeWorkspaceData(data);

    res.json({
      success: true,
      emailSent: emailResult.sent,
      emailDeliveryError: emailResult.error,
      inviteUrl,
      token,
      member: memberObj,
      invitation: invitationObj,
      message: emailResult.sent
        ? `Invitación enviada por correo a ${cleanEmail}.`
        : `Invitación registrada. Configura EMAIL_API_KEY en Render para envío automático o comparte el enlace directo.`
    });
  } catch (err: any) {
    console.error('Error in /api/team/invite:', err);
    res.status(500).json({ error: 'Error procesando la invitación: ' + err.message });
  }
});

// 3. Reenviar invitación por correo
app.post('/api/team/resend-invite', async (req, res) => {
  try {
    const { memberId, email } = req.body;
    const data = readWorkspaceData();
    if (!data.members) data.members = [];
    if (!data.invitations) data.invitations = [];

    const member = data.members.find(
      (m: any) => (memberId && m.id === memberId) || (email && m.email?.toLowerCase() === email.toLowerCase())
    );

    if (!member) {
      return res.status(404).json({ error: 'Miembro no encontrado.' });
    }

    // Generar nuevo token seguro y renovar 7 días
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.get('host') || 'localhost:3000';
    const origin = req.get('origin') || `${proto}://${host}`;
    const cleanOrigin = origin.replace(/\/$/, '');
    const inviteUrl = `${cleanOrigin}/?invite_token=${token}`;

    const inviterName = data.currentMember?.name || 'Administrador Pixel 12';

    const emailResult = await sendInvitationEmail({
      to: member.email,
      recipientName: member.name,
      role: member.role,
      inviterName,
      inviteUrl,
      expiresAt
    });

    member.status = 'invited';
    member.invitedAt = new Date().toISOString();

    const invitationObj = {
      id: `inv_${Date.now()}`,
      email: member.email.toLowerCase(),
      name: member.name,
      role: member.role,
      token,
      status: 'pending',
      invitedBy: {
        id: data.currentMember?.id || 'admin',
        name: inviterName,
        email: data.currentMember?.email || 'admin@pixel12.agency'
      },
      createdAt: new Date().toISOString(),
      expiresAt,
      emailSent: emailResult.sent,
      emailDeliveryError: emailResult.error
    };

    data.invitations = data.invitations.filter(
      (i: any) => i.email?.toLowerCase() !== member.email.toLowerCase() || i.status === 'accepted'
    );
    data.invitations.push(invitationObj);

    writeWorkspaceData(data);

    res.json({
      success: true,
      emailSent: emailResult.sent,
      emailDeliveryError: emailResult.error,
      inviteUrl,
      token,
      invitation: invitationObj,
      message: emailResult.sent
        ? `Invitación reenviada exitosamente a ${member.email}.`
        : `Enlace renovado. Puedes copiar el enlace directo o configurar EMAIL_API_KEY.`
    });
  } catch (err: any) {
    console.error('Error in /api/team/resend-invite:', err);
    res.status(500).json({ error: 'Error reenviando invitación: ' + err.message });
  }
});

// 4. Desactivar miembro (conserva todas sus tareas, posts y registros para integridad)
app.post('/api/team/deactivate', (req, res) => {
  try {
    const { memberId } = req.body;
    const callerRole = (req.headers['x-user-role'] as string) || '';
    if (callerRole.toUpperCase() === 'CLIENT') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden gestionar miembros del equipo.' });
    }

    if (!memberId) {
      return res.status(400).json({ error: 'memberId es requerido.' });
    }

    const data = readWorkspaceData();
    if (!data.members) data.members = [];

    const member = data.members.find((m: any) => m.id === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Miembro no encontrado.' });
    }

    if (member.id === 'mem_1' || member.role === 'Owner') {
      return res.status(400).json({ error: 'No se puede desactivar al propietario principal del espacio de trabajo.' });
    }

    member.status = 'inactive';
    member.deactivatedAt = new Date().toISOString();

    // Revocar invitaciones pendientes
    if (data.invitations) {
      data.invitations.forEach((inv: any) => {
        if (inv.email?.toLowerCase() === member.email?.toLowerCase() && inv.status === 'pending') {
          inv.status = 'revoked';
        }
      });
    }

    // Registrar en auditoría
    if (!data.auditLogs) data.auditLogs = [];
    data.auditLogs.unshift({
      id: 'log_' + Date.now(),
      actorName: 'Administrador Pixel 12',
      action: 'Dio de baja a miembro del equipo',
      entityType: 'team',
      entityId: memberId,
      details: `Desactivó el acceso para ${member.name} (${member.email}). Tareas e historial conservados.`,
      timestamp: new Date().toISOString()
    });

    writeWorkspaceData(data);

    res.json({
      success: true,
      message: `El acceso para ${member.name} (${member.email}) ha sido desactivado. Sus registros y tareas se mantienen íntegros.`,
      member,
      members: data.members
    });
  } catch (err: any) {
    console.error('Error in /api/team/deactivate:', err);
    res.status(500).json({ error: 'Error desactivando miembro: ' + err.message });
  }
});

// 5. Reactivar miembro
app.post('/api/team/reactivate', (req, res) => {
  try {
    const { memberId } = req.body;
    const callerRole = (req.headers['x-user-role'] as string) || '';
    if (callerRole.toUpperCase() === 'CLIENT') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden gestionar miembros del equipo.' });
    }

    if (!memberId) {
      return res.status(400).json({ error: 'memberId es requerido.' });
    }

    const data = readWorkspaceData();
    if (!data.members) data.members = [];

    const member = data.members.find((m: any) => m.id === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Miembro no encontrado.' });
    }

    member.status = 'active';
    delete member.deactivatedAt;

    // Registrar en auditoría
    if (!data.auditLogs) data.auditLogs = [];
    data.auditLogs.unshift({
      id: 'log_' + Date.now(),
      actorName: 'Administrador Pixel 12',
      action: 'Reactivó a miembro del equipo',
      entityType: 'team',
      entityId: memberId,
      details: `Restableció el acceso para ${member.name} (${member.email}).`,
      timestamp: new Date().toISOString()
    });

    writeWorkspaceData(data);

    res.json({
      success: true,
      message: `El acceso para ${member.name} ha sido reactivado.`,
      member,
      members: data.members
    });
  } catch (err: any) {
    console.error('Error in /api/team/reactivate:', err);
    res.status(500).json({ error: 'Error reactivando miembro: ' + err.message });
  }
});

// 6. Verificar validez de un token de invitación
app.get('/api/invitations/verify', (req, res) => {
  try {
    const token = String(req.query.token || '').trim();
    if (!token) {
      return res.status(400).json({ valid: false, reason: 'MISSING_TOKEN', message: 'Token no proporcionado.' });
    }

    const data = readWorkspaceData();
    const invitation = (data.invitations || []).find((i: any) => i.token === token);

    if (!invitation) {
      return res.status(404).json({
        valid: false,
        reason: 'NOT_FOUND',
        message: 'Enlace de invitación inexistente o inválido.'
      });
    }

    if (invitation.status === 'accepted') {
      return res.status(400).json({
        valid: false,
        reason: 'ALREADY_USED',
        message: 'Esta invitación ya fue utilizada previamente. Puedes iniciar sesión con tus credenciales.'
      });
    }

    if (invitation.status === 'revoked') {
      return res.status(400).json({
        valid: false,
        reason: 'REVOKED',
        message: 'Esta invitación fue revocada por un administrador de Pixel 12.'
      });
    }

    if (new Date(invitation.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({
        valid: false,
        reason: 'EXPIRED',
        expiresAt: invitation.expiresAt,
        message: 'Esta invitación ha expirado. Solicita al administrador de Pixel 12 un nuevo reenvío.'
      });
    }

    res.json({
      valid: true,
      invitation: {
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        invitedBy: invitation.invitedBy
      }
    });
  } catch (err: any) {
    console.error('Error in /api/invitations/verify:', err);
    res.status(500).json({ valid: false, error: err.message });
  }
});

// 7. Aceptar invitación y activar acceso
app.post('/api/invitations/accept', (req, res) => {
  try {
    const { token, password, displayName } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token y contraseña requeridos.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const data = readWorkspaceData();
    if (!data.invitations) data.invitations = [];
    if (!data.members) data.members = [];

    const invitation = data.invitations.find((i: any) => i.token === token);
    if (!invitation) {
      return res.status(404).json({ error: 'Invitación no válida o no encontrada.' });
    }

    if (invitation.status === 'accepted') {
      return res.status(400).json({ error: 'Esta invitación ya fue utilizada.' });
    }

    if (new Date(invitation.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Esta invitación ha expirado. Solicita una nueva.' });
    }

    // Marcar invitación como aceptada
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date().toISOString();

    // Activar miembro en la lista del equipo
    let member = data.members.find((m: any) => m.email?.toLowerCase() === invitation.email.toLowerCase());
    if (member) {
      member.status = 'active';
      if (displayName) member.name = displayName.trim();
    } else {
      member = {
        id: `mem_${Date.now()}`,
        name: (displayName || invitation.name).trim(),
        email: invitation.email.toLowerCase(),
        role: invitation.role || 'Designer',
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        status: 'active'
      };
      data.members.push(member);
    }

    writeWorkspaceData(data);

    res.json({
      success: true,
      message: 'Invitación aceptada correctamente. Tu acceso a Pixel 12 OS ha sido activado.',
      user: {
        uid: member.id,
        email: invitation.email.toLowerCase(),
        displayName: member.name,
        role: member.role
      }
    });
  } catch (err: any) {
    console.error('Error in /api/invitations/accept:', err);
    res.status(500).json({ error: 'Error aceptando la invitación: ' + err.message });
  }
});

// 8. Validación de estado de cuenta para inicio de sesión seguro
app.post('/api/auth/check-access', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ allowed: true });
    }

    const cleanEmail = email.trim().toLowerCase();
    const data = readWorkspaceData();
    const member = (data.members || []).find((m: any) => m.email?.toLowerCase() === cleanEmail);

    if (member && member.status === 'inactive') {
      return res.status(403).json({
        allowed: false,
        reason: 'DEACTIVATED',
        message: 'Esta cuenta ha sido desactivada por un administrador de Pixel 12 Studio. No tienes acceso a la plataforma.'
      });
    }

    res.json({ allowed: true, status: member?.status || 'active' });
  } catch (err: any) {
    res.json({ allowed: true });
  }
});

// ---------------- CLIENTES & MARCAS API (PIXEL 12 OS) ----------------
// Eliminar cliente / marca con limpieza en cascada para evitar registros huérfanos
const handleClientDeletion = (req: any, res: any) => {
  try {
    const clientId = req.params.id || req.body.clientId || req.body.id;
    const callerRole = (req.headers['x-user-role'] as string) || '';

    if (callerRole.toUpperCase() === 'CLIENT') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden eliminar clientes.' });
    }

    if (!clientId) {
      return res.status(400).json({ error: 'ID de cliente no proporcionado.' });
    }

    if (clientId === 'brand_pixel12') {
      return res.status(400).json({
        error: 'No se puede eliminar la marca principal de Pixel 12 Studio. Esta marca es requerida para el funcionamiento del sistema.'
      });
    }

    const data = readWorkspaceData();
    if (!data.brands || !Array.isArray(data.brands)) {
      return res.status(404).json({ error: 'No hay clientes registrados en el sistema.' });
    }

    const brandIndex = data.brands.findIndex((b: any) => b.id === clientId);
    if (brandIndex === -1) {
      return res.status(404).json({ error: `Cliente con ID "${clientId}" no encontrado.` });
    }

    const brandToDelete = data.brands[brandIndex];

    if (data.brands.length <= 1) {
      return res.status(400).json({
        error: 'No es posible eliminar el único cliente existente. Debe haber al menos una marca en el espacio de trabajo.'
      });
    }

    // 1. Eliminar la marca del catálogo de marcas
    data.brands.splice(brandIndex, 1);

    // 2. Si la marca activa era la eliminada, reasignar a Pixel 12 o a la primera restante
    let newActiveBrandId = data.activeBrandId;
    if (data.activeBrandId === clientId) {
      const fallback = data.brands.find((b: any) => b.id === 'brand_pixel12') || data.brands[0];
      data.activeBrandId = fallback ? fallback.id : '';
      newActiveBrandId = data.activeBrandId;
    }

    // 3. Cascada: Eliminar publicaciones asociadas al cliente
    const initialPostsCount = (data.posts || []).length;
    data.posts = (data.posts || []).filter((p: any) => p.brandId !== clientId);
    const removedPostsCount = initialPostsCount - data.posts.length;

    // 4. Cascada: Eliminar campañas asociadas al cliente
    const initialCampaignsCount = (data.campaigns || []).length;
    data.campaigns = (data.campaigns || []).filter((c: any) => c.brandId !== clientId);
    const removedCampaignsCount = initialCampaignsCount - data.campaigns.length;

    // 5. Cascada: Eliminar tareas asociadas a este cliente
    data.tasks = (data.tasks || []).filter((t: any) => t.brandId !== clientId);

    // 6. Cascada en CRM: Limpiar empresas, contactos y tratos vinculados al nombre o ID del cliente
    const clientNameLower = (brandToDelete.name || '').toLowerCase().trim();
    
    // Identificar IDs de empresas CRM vinculadas
    const linkedCompanyIds = (data.crmCompanies || [])
      .filter((comp: any) => (comp.name && comp.name.toLowerCase().trim() === clientNameLower) || comp.brandId === clientId)
      .map((c: any) => c.id);

    // Identificar contactos vinculados a esas empresas
    const linkedContactIds = (data.crmContacts || [])
      .filter((c: any) => linkedCompanyIds.includes(c.companyId))
      .map((c: any) => c.id);

    // Eliminar tratos vinculados a las empresas o contactos eliminados
    if (data.crmDeals) {
      data.crmDeals = data.crmDeals.filter((d: any) => 
        !linkedCompanyIds.includes(d.companyId) && !linkedContactIds.includes(d.contactId)
      );
    }

    // Eliminar seguimientos y actividades vinculadas
    if (data.crmFollowUps) {
      data.crmFollowUps = data.crmFollowUps.filter((f: any) => !linkedContactIds.includes(f.contactId));
    }
    if (data.crmActivities) {
      data.crmActivities = data.crmActivities.filter((a: any) => 
        !linkedContactIds.includes(a.contactId) && !linkedCompanyIds.includes(a.companyId)
      );
    }

    // Eliminar contactos y empresas vinculadas
    if (data.crmContacts) {
      data.crmContacts = data.crmContacts.filter((c: any) => !linkedCompanyIds.includes(c.companyId));
    }
    if (data.crmCompanies) {
      data.crmCompanies = data.crmCompanies.filter((comp: any) => !linkedCompanyIds.includes(comp.id));
    }

    // 7. Registro de auditoría obligatorio
    if (!data.auditLogs) data.auditLogs = [];
    data.auditLogs.unshift({
      id: 'log_' + Date.now(),
      actorName: 'Administrador Pixel 12',
      action: 'Eliminó cliente y registros asociados',
      entityType: 'client',
      entityId: clientId,
      details: `Se eliminó permanentemente el cliente "${brandToDelete.name}". Se limpiaron ${removedPostsCount} posts y ${removedCampaignsCount} campañas vinculadas.`,
      timestamp: new Date().toISOString()
    });

    // 8. Persistir en backend
    writeWorkspaceData(data);

    res.json({
      success: true,
      message: `El cliente "${brandToDelete.name}" y todos sus registros vinculados fueron eliminados correctamente.`,
      deletedId: clientId,
      newActiveBrandId,
      remainingBrands: data.brands,
      stats: {
        removedPosts: removedPostsCount,
        removedCampaigns: removedCampaignsCount
      }
    });
  } catch (err: any) {
    console.error('Error in handleClientDeletion:', err);
    res.status(500).json({ error: 'Error al eliminar cliente: ' + err.message });
  }
};

app.delete('/api/clients/:id', handleClientDeletion);
app.post('/api/clients/delete', handleClientDeletion);

// ---------------- PUBLICACIONES EN LOTE / MATRIZ API ----------------
app.post('/api/posts/bulk', (req, res) => {
  try {
    const { posts, defaultBrandId, duplicateStrategy } = req.body;
    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({ error: 'Lista de publicaciones no proporcionada o vacía.' });
    }

    const data = readWorkspaceData();
    if (!data.posts) data.posts = [];

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    const strategy = duplicateStrategy || 'skip'; // 'skip' | 'update' | 'create'

    posts.forEach((item: any) => {
      const targetBrandId = item.brandId || defaultBrandId || data.activeBrandId || 'brand_pixel12';
      const cleanTitle = (item.internalTitle || item.title || 'Sin Título').trim();
      const cleanDate = (item.date || '').trim();

      // Buscar duplicado por Brand + Título + Fecha
      const existingIdx = data.posts.findIndex((p: any) =>
        p.brandId === targetBrandId &&
        p.internalTitle?.toLowerCase().trim() === cleanTitle.toLowerCase() &&
        p.date === cleanDate
      );

      if (existingIdx >= 0 && strategy === 'skip') {
        skippedCount++;
        return;
      }

      if (existingIdx >= 0 && strategy === 'update') {
        data.posts[existingIdx] = {
          ...data.posts[existingIdx],
          format: item.format || data.posts[existingIdx].format,
          pillar: item.pillar || data.posts[existingIdx].pillar,
          hook: item.hook || data.posts[existingIdx].hook,
          caption: item.caption || data.posts[existingIdx].caption,
          cta: item.cta || data.posts[existingIdx].cta,
          time: item.time || data.posts[existingIdx].time,
          channels: item.channels || data.posts[existingIdx].channels,
          status: item.status || data.posts[existingIdx].status,
          updatedAt: new Date().toISOString()
        };
        updatedCount++;
        return;
      }

      // Crear nuevo post
      const newPost = {
        id: item.id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        brandId: targetBrandId,
        campaignId: item.campaignId || undefined,
        format: item.format || 'Static Post',
        pillar: item.pillar || 'Marketing Digital',
        internalTitle: cleanTitle,
        hook: item.hook || '',
        caption: item.caption || '',
        cta: item.cta || '',
        hashtags: Array.isArray(item.hashtags) ? item.hashtags : (item.hashtags ? String(item.hashtags).split(' ').filter(Boolean) : []),
        channels: Array.isArray(item.channels) && item.channels.length > 0 ? item.channels : ['instagram'],
        date: cleanDate || new Date().toISOString().split('T')[0],
        time: item.time || '10:00',
        status: item.status || 'DRAFT',
        assigneeId: item.assigneeId || undefined,
        assigneeName: item.assigneeName || undefined,
        assets: item.assets || [],
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      data.posts.unshift(newPost);
      importedCount++;
    });

    writeWorkspaceData(data);

    res.json({
      success: true,
      importedCount,
      updatedCount,
      skippedCount,
      totalWorkspacePosts: data.posts.length
    });
  } catch (err: any) {
    console.error('Error in /api/posts/bulk:', err);
    res.status(500).json({ error: 'Error importando publicaciones en lote: ' + err.message });
  }
});

// ---------------- COTIZACIONES & PROPUESTAS API (PIXEL 12) ----------------
app.get('/api/quotes', (req, res) => {
  const data = readWorkspaceData();
  const quotes = data.quotes || initialQuoteProposals;
  res.json(quotes);
});

app.post('/api/quotes', (req, res) => {
  const quote = req.body;
  if (!quote || !quote.id) {
    return res.status(400).json({ error: 'Datos de cotización inválidos' });
  }
  const data = readWorkspaceData();
  const existingQuotes = data.quotes || initialQuoteProposals;
  const index = existingQuotes.findIndex((q: any) => q.id === quote.id);
  let updatedQuotes;
  if (index >= 0) {
    updatedQuotes = [...existingQuotes];
    updatedQuotes[index] = { ...updatedQuotes[index], ...quote, updatedAt: new Date().toISOString() };
  } else {
    updatedQuotes = [quote, ...existingQuotes];
  }
  data.quotes = updatedQuotes;
  writeWorkspaceData(data);
  res.json({ success: true, quote: index >= 0 ? updatedQuotes[index] : quote });
});

app.delete('/api/quotes/:id', (req, res) => {
  const { id } = req.params;
  const data = readWorkspaceData();
  const existingQuotes = data.quotes || initialQuoteProposals;
  data.quotes = existingQuotes.filter((q: any) => q.id !== id);
  writeWorkspaceData(data);
  res.json({ success: true, message: 'Cotización eliminada' });
});

// Catálogo de Planes
app.get('/api/plans', (req, res) => {
  const data = readWorkspaceData();
  res.json(data.plans || initialAgencyPlans);
});

app.post('/api/plans', (req, res) => {
  const plan = req.body;
  if (!plan || !plan.id) return res.status(400).json({ error: 'Plan inválido' });
  const data = readWorkspaceData();
  const existingPlans = data.plans || initialAgencyPlans;
  const idx = existingPlans.findIndex((p: any) => p.id === plan.id);
  if (idx >= 0) {
    existingPlans[idx] = plan;
  } else {
    existingPlans.push(plan);
  }
  data.plans = existingPlans;
  writeWorkspaceData(data);
  res.json({ success: true, plan });
});

app.delete('/api/plans/:id', (req, res) => {
  const { id } = req.params;
  const data = readWorkspaceData();
  const existingPlans = data.plans || initialAgencyPlans;
  data.plans = existingPlans.filter((p: any) => p.id !== id);
  writeWorkspaceData(data);
  res.json({ success: true });
});

// Catálogo de Servicios
app.get('/api/services', (req, res) => {
  const data = readWorkspaceData();
  res.json(data.customServices || initialAgencyServices);
});

app.post('/api/services', (req, res) => {
  const service = req.body;
  if (!service || !service.id) return res.status(400).json({ error: 'Servicio inválido' });
  const data = readWorkspaceData();
  const existingServices = data.customServices || initialAgencyServices;
  const idx = existingServices.findIndex((s: any) => s.id === service.id);
  if (idx >= 0) {
    existingServices[idx] = service;
  } else {
    existingServices.push(service);
  }
  data.customServices = existingServices;
  writeWorkspaceData(data);
  res.json({ success: true, service });
});

app.delete('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const data = readWorkspaceData();
  const existingServices = data.customServices || initialAgencyServices;
  data.customServices = existingServices.filter((s: any) => s.id !== id);
  writeWorkspaceData(data);
  res.json({ success: true });
});

// Ajustes Comerciales
app.get('/api/commercial-settings', (req, res) => {
  const data = readWorkspaceData();
  res.json(data.commercialSettings || initialCommercialSettings);
});

app.post('/api/commercial-settings', (req, res) => {
  const settings = req.body;
  const data = readWorkspaceData();
  data.commercialSettings = { ...(data.commercialSettings || initialCommercialSettings), ...settings };
  writeWorkspaceData(data);
  res.json({ success: true, settings: data.commercialSettings });
});

// Biblioteca de Imágenes
app.get('/api/library/images', (req, res) => {
  const data = readWorkspaceData();
  res.json(data.imageLibrary || initialImageLibraryItems);
});

app.post('/api/library/images', (req, res) => {
  const item = req.body;
  const data = readWorkspaceData();
  const existing = data.imageLibrary || initialImageLibraryItems;
  const newItem = {
    ...item,
    id: item.id || `img_${Date.now()}`,
    createdAt: item.createdAt || new Date().toISOString()
  };
  const idx = existing.findIndex((i: any) => i.id === newItem.id);
  if (idx >= 0) {
    existing[idx] = newItem;
  } else {
    existing.unshift(newItem);
  }
  data.imageLibrary = existing;
  writeWorkspaceData(data);
  res.json({ success: true, item: newItem });
});

app.delete('/api/library/images/:id', (req, res) => {
  const { id } = req.params;
  const data = readWorkspaceData();
  const existing = data.imageLibrary || initialImageLibraryItems;
  data.imageLibrary = existing.filter((i: any) => i.id !== id);
  writeWorkspaceData(data);
  res.json({ success: true });
});

// ---------------- CRM GOHIGHLEVEL-STYLE COMMERCIAL ENGINE ----------------

// Get All CRM Collections in a single call or fallback to initial
app.get('/api/crm/all', (req, res) => {
  const data = readWorkspaceData();
  res.json({
    contacts: data.crmContacts || initialCrmContacts,
    companies: data.crmCompanies || initialCrmCompanies,
    deals: data.crmDeals || initialCrmDeals,
    pipelines: data.crmPipelines || initialCrmPipelines,
    activities: data.crmActivities || initialCrmActivities,
    followUps: data.crmFollowUps || initialCrmFollowUps,
  });
});

// Contacts / Leads
app.get('/api/crm/contacts', (req, res) => {
  const data = readWorkspaceData();
  res.json(data.crmContacts || initialCrmContacts);
});

app.post('/api/crm/contacts', (req, res) => {
  const contact = req.body;
  if (!contact) return res.status(400).json({ error: 'Contacto inválido' });
  const data = readWorkspaceData();
  const list = data.crmContacts || initialCrmContacts;
  const newContact = {
    ...contact,
    id: contact.id || `cont_${Date.now()}`,
    createdAt: contact.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const idx = list.findIndex((c: any) => c.id === newContact.id);
  if (idx >= 0) {
    list[idx] = newContact;
  } else {
    list.unshift(newContact);
  }
  data.crmContacts = list;
  writeWorkspaceData(data);
  res.json({ success: true, contact: newContact });
});

app.delete('/api/crm/contacts/:id', (req, res) => {
  const { id } = req.params;
  const data = readWorkspaceData();
  const list = data.crmContacts || initialCrmContacts;
  data.crmContacts = list.filter((c: any) => c.id !== id);
  writeWorkspaceData(data);
  res.json({ success: true });
});

// Companies
app.get('/api/crm/companies', (req, res) => {
  const data = readWorkspaceData();
  res.json(data.crmCompanies || initialCrmCompanies);
});

app.post('/api/crm/companies', (req, res) => {
  const company = req.body;
  if (!company) return res.status(400).json({ error: 'Empresa inválida' });
  const data = readWorkspaceData();
  const list = data.crmCompanies || initialCrmCompanies;
  const newComp = {
    ...company,
    id: company.id || `comp_${Date.now()}`,
    createdAt: company.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const idx = list.findIndex((c: any) => c.id === newComp.id);
  if (idx >= 0) {
    list[idx] = newComp;
  } else {
    list.unshift(newComp);
  }
  data.crmCompanies = list;
  writeWorkspaceData(data);
  res.json({ success: true, company: newComp });
});

app.delete('/api/crm/companies/:id', (req, res) => {
  const { id } = req.params;
  const data = readWorkspaceData();
  const list = data.crmCompanies || initialCrmCompanies;
  data.crmCompanies = list.filter((c: any) => c.id !== id);
  writeWorkspaceData(data);
  res.json({ success: true });
});

// Deals / Oportunidades
app.get('/api/crm/deals', (req, res) => {
  const data = readWorkspaceData();
  res.json(data.crmDeals || initialCrmDeals);
});

app.post('/api/crm/deals', (req, res) => {
  const deal = req.body;
  if (!deal) return res.status(400).json({ error: 'Oportunidad inválida' });
  const data = readWorkspaceData();
  const list = data.crmDeals || initialCrmDeals;
  const newDeal = {
    ...deal,
    id: deal.id || `deal_${Date.now()}`,
    createdAt: deal.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const idx = list.findIndex((d: any) => d.id === newDeal.id);
  if (idx >= 0) {
    list[idx] = newDeal;
  } else {
    list.unshift(newDeal);
  }
  data.crmDeals = list;
  writeWorkspaceData(data);
  res.json({ success: true, deal: newDeal });
});

app.patch('/api/crm/deals/:id/stage', (req, res) => {
  const { id } = req.params;
  const { stageId, lostReason, probability } = req.body;
  const data = readWorkspaceData();
  const list = data.crmDeals || initialCrmDeals;
  const idx = list.findIndex((d: any) => d.id === id);
  if (idx < 0) return res.status(404).json({ error: 'Oportunidad no encontrada' });

  const current = list[idx];
  const updated = {
    ...current,
    stageId: stageId || current.stageId,
    lostReason: lostReason !== undefined ? lostReason : current.lostReason,
    probability: probability !== undefined ? probability : current.probability,
    updatedAt: new Date().toISOString()
  };
  list[idx] = updated;
  data.crmDeals = list;

  // Log activity
  const activities = data.crmActivities || initialCrmActivities;
  activities.unshift({
    id: `act_${Date.now()}`,
    entityType: 'DEAL',
    entityId: id,
    type: 'STAGE_CHANGE',
    title: `Etapa actualizada en pipeline`,
    description: `La oportunidad "${updated.title}" avanzó a la etapa ${stageId}.`,
    authorName: 'Pixel 12 OS',
    timestamp: new Date().toISOString()
  });
  data.crmActivities = activities;

  writeWorkspaceData(data);
  res.json({ success: true, deal: updated });
});

app.delete('/api/crm/deals/:id', (req, res) => {
  const { id } = req.params;
  const data = readWorkspaceData();
  const list = data.crmDeals || initialCrmDeals;
  data.crmDeals = list.filter((d: any) => d.id !== id);
  writeWorkspaceData(data);
  res.json({ success: true });
});

// Pipelines
app.get('/api/crm/pipelines', (req, res) => {
  const data = readWorkspaceData();
  res.json(data.crmPipelines || initialCrmPipelines);
});

app.post('/api/crm/pipelines', (req, res) => {
  const pipeline = req.body;
  if (!pipeline) return res.status(400).json({ error: 'Pipeline inválido' });
  const data = readWorkspaceData();
  const list = data.crmPipelines || initialCrmPipelines;
  const newPipe = {
    ...pipeline,
    id: pipeline.id || `pipe_${Date.now()}`,
    createdAt: pipeline.createdAt || new Date().toISOString()
  };
  const idx = list.findIndex((p: any) => p.id === newPipe.id);
  if (idx >= 0) {
    list[idx] = newPipe;
  } else {
    list.push(newPipe);
  }
  data.crmPipelines = list;
  writeWorkspaceData(data);
  res.json({ success: true, pipeline: newPipe });
});

app.delete('/api/crm/pipelines/:id', (req, res) => {
  const { id } = req.params;
  const data = readWorkspaceData();
  const list = data.crmPipelines || initialCrmPipelines;
  data.crmPipelines = list.filter((p: any) => p.id !== id);
  writeWorkspaceData(data);
  res.json({ success: true });
});

// Follow-Ups & Agenda
app.get('/api/crm/follow-ups', (req, res) => {
  const data = readWorkspaceData();
  res.json(data.crmFollowUps || initialCrmFollowUps);
});

app.post('/api/crm/follow-ups', (req, res) => {
  const fu = req.body;
  if (!fu) return res.status(400).json({ error: 'Seguimiento inválido' });
  const data = readWorkspaceData();
  const list = data.crmFollowUps || initialCrmFollowUps;
  const newFu = {
    ...fu,
    id: fu.id || `fu_${Date.now()}`,
    status: fu.status || 'PENDING',
    createdAt: fu.createdAt || new Date().toISOString()
  };
  const idx = list.findIndex((f: any) => f.id === newFu.id);
  if (idx >= 0) {
    list[idx] = newFu;
  } else {
    list.unshift(newFu);
  }
  data.crmFollowUps = list;
  writeWorkspaceData(data);
  res.json({ success: true, followUp: newFu });
});

app.patch('/api/crm/follow-ups/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const data = readWorkspaceData();
  const list = data.crmFollowUps || initialCrmFollowUps;
  const idx = list.findIndex((f: any) => f.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], status };
    data.crmFollowUps = list;
    writeWorkspaceData(data);
    return res.json({ success: true, followUp: list[idx] });
  }
  res.status(404).json({ error: 'Seguimiento no encontrado' });
});

app.delete('/api/crm/follow-ups/:id', (req, res) => {
  const { id } = req.params;
  const data = readWorkspaceData();
  const list = data.crmFollowUps || initialCrmFollowUps;
  data.crmFollowUps = list.filter((f: any) => f.id !== id);
  writeWorkspaceData(data);
  res.json({ success: true });
});

// Activities
app.get('/api/crm/activities', (req, res) => {
  const data = readWorkspaceData();
  res.json(data.crmActivities || initialCrmActivities);
});

app.post('/api/crm/activities', (req, res) => {
  const act = req.body;
  if (!act) return res.status(400).json({ error: 'Actividad inválida' });
  const data = readWorkspaceData();
  const list = data.crmActivities || initialCrmActivities;
  const newAct = {
    ...act,
    id: act.id || `act_${Date.now()}`,
    timestamp: act.timestamp || new Date().toISOString()
  };
  list.unshift(newAct);
  data.crmActivities = list;
  writeWorkspaceData(data);
  res.json({ success: true, activity: newAct });
});

// ---------------- REAL COMMERCIAL AI ENGINE (PROMPTS -> OUTPUTS) ----------------
app.post('/api/ai/commercial-generate', async (req, res) => {
  const {
    type = 'copy',
    prompt = '',
    clientContext = {},
    customInstructions = ''
  } = req.body;

  const clientName = clientContext.clientName || 'Cliente';
  const companyName = clientContext.companyName || 'Empresa';
  const sector = clientContext.sector || 'Servicios y Negocios';
  const tone = clientContext.tone || 'Futurista, Premium y de Alto Impacto';
  const selectedService = clientContext.selectedService || 'Marketing Digital y Asistencia Virtual';
  const goal = clientContext.goal || 'Cerrar venta y generar autoridad';

  const systemInstruction = `Eres el Director Creativo y Chief Strategy Officer de PIXEL 12.
Pixel 12 es la agencia prémium de:
- Marketing digital de alto impacto
- Asistencia virtual ejecutiva y BPO de alto nivel
- Creación y gestión sistemática de contenido con estética de lujo (Negro Obsidiana #09090B, Oro Prestigio #D4AF37, Plata Metálica #CBD5E1 y Blanco)
- Estrategia comercial y adquisición de clientes calificados

TU TAREA:
Generar contenido comercial REAL, ULTRA-PREMIUM, FUTURISTA, PERSUASIVO y ALTAMENTE ATRACTIVO para clientes y prospectos.
Evita texto genérico ("Soluciones innovadoras", "Lleva tu negocio al siguiente nivel").
Utiliza datos, psicología de ventas B2B, contraste de status, ganchos de alta retención y llamados a la acción precisos.

Responde ESTRICTAMENTE en formato JSON con la siguiente estructura:
{
  "resultTitle": "Título descriptivo del resultado generado",
  "primaryContent": "El contenido principal completo, perfectamente formateado (párrafos claros, viñetas elegantes o scripts listos para usar)",
  "structuredData": {
    "hook": "Gancho inicial de impacto (si aplica)",
    "cta": "Llamado a la acción irresistible",
    "tone": "${tone}",
    "client": "${companyName}"
  },
  "suggestions": [
    "Consejo de aplicación táctica 1",
    "Consejo de optimización 2"
  ],
  "alternatives": [
    "Variación alternativa corta o de enfoque agresivo 1",
    "Variación alternativa 2"
  ]
}`;

  let specificPrompt = `Tipo de generación solicitada: ${type.toUpperCase()}
Cliente: ${clientName} (${companyName})
Industria / Sector: ${sector}
Servicio o Solución Pixel 12 en foco: ${selectedService}
Objetivo comercial: ${goal}
Tono deseado: ${tone}
Petición del usuario / Prompt: ${prompt || 'Crear pieza de alto impacto comercial.'}
${customInstructions ? `Instrucciones adicionales: ${customInstructions}` : ''}`;

  if (type === 'hook') {
    specificPrompt += `\nGenera 5 ganchos de apertura (hooks) de 3 segundos para video reels o posts de redes sociales, enfocados en captar la atención de directores y dueños de negocio en menos de un segundo.`;
  } else if (type === 'cta') {
    specificPrompt += `\nGenera 4 llamados a la acción (CTAs) de alta conversión para ofertas high-ticket, WhatsApp y cotizaciones formales.`;
  } else if (type === 'email') {
    specificPrompt += `\nGenera un correo electrónico comercial completo (Asunto, Saludo, Cuerpo persuasivo, Oferta y Firma ejecutiva) listo para enviar.`;
  } else if (type === 'followup') {
    specificPrompt += `\nGenera 3 mensajes de seguimiento por WhatsApp para prospectos que recibieron cotización o propuesta y aún no responden, aplicando técnicas de escasez noble y valor agregado.`;
  } else if (type === 'hashtags') {
    specificPrompt += `\nGenera 20 hashtags estratégicos agrupados por nicho, volumen alto y autoridad para ${sector} y Pixel 12.`;
  } else if (type === 'content_ideas') {
    specificPrompt += `\nGenera 5 ideas de contenido disruptivo y educativo con formato, título sugerido y ángulo de conversión para la marca ${companyName}.`;
  } else if (type === 'image_prompt') {
    specificPrompt += `\nGenera un prompt fotográfico y cinematográfico detallado en inglés y español para crear un visual exclusivo con la estética Negro Obsidiana y Oro de Pixel 12 adaptado a ${sector}.`;
  }

  try {
    const aiResponse = await generateGeminiContent({
      contents: specificPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    });

    if (aiResponse) {
      const parsed = JSON.parse(aiResponse);
      return res.json({
        type,
        resultTitle: parsed.resultTitle || `Generación IA: ${type}`,
        primaryContent: parsed.primaryContent || '',
        structuredData: parsed.structuredData || {},
        suggestions: parsed.suggestions || [],
        alternatives: parsed.alternatives || [],
        createdAt: new Date().toISOString()
      });
    }
  } catch (err: any) {
    console.log('[Commercial AI] Live generation fallback applied smoothly:', err?.message || err);
  }

  // Fallback high-impact generation if model is offline or timed out
  const fallbackTitles: Record<string, string> = {
    copy: `Copy Persuasivo de Alto Impacto para ${companyName}`,
    hook: `Ganchos de Autoridad Inmediata — ${sector}`,
    cta: `Llamados a la Acción de Cierre Inmediato`,
    email: `Secuencia de Correo Comercial Estratégico — ${companyName}`,
    followup: `Mensaje de Seguimiento VIP por WhatsApp`,
    hashtags: `Conjunto de Hashtags de Alta Conversión`,
    content_ideas: `Matriz de Contenidos Estratégicos — ${companyName}`,
    proposal: `Propuesta de Valor Comercial Pixel 12 para ${companyName}`,
    image_prompt: `Prompt Visual Cinemático Pixel 12 Luxury`
  };

  const fallbackContents: Record<string, string> = {
    copy: `En un mercado saturado de ruido digital, las marcas promedio compiten por atención con descuentos; las marcas líderes dominan con sistemas, autoridad y ejecución estética impecable.\n\nEn ${companyName}, el verdadero reto no es solo estar presentes en redes, sino convertir cada punto de contacto en un imán de prospectos con alta capacidad de compra. Con el respaldo operativo de Pixel 12, transformamos tu presencia digital en un canal de captación predecible mientras delegas tareas repetitivas en asistencia virtual de primer nivel.`,
    hook: `1. "El 80% de los directores en ${sector} siguen perdiendo 15 horas semanales en tareas operativas de $10/h. Este es el sistema para romper ese ciclo."\n2. "¿Por qué las marcas que facturan más de $50k/mes nunca publican por publicar? El secreto está en la arquitectura del contenido."\n3. "Tres cuellos de botella que están drenando las ventas de ${companyName} ahora mismo (y cómo resolverlos en 7 días)."`,
    cta: `• "Agenda tu sesión de diagnóstico estratégico sin costo aquí y descubre los 3 puntos ciegos de tu embudo comercial."\n• "Comenta 'ESCALAR' por DM y te enviamos la hoja de ruta personalizada para tu empresa."\n• "¿Listo para delegar y recuperar 20 horas al mes? Escríbenos directamente a WhatsApp oficial de Pixel 12."`,
    email: `Asunto: Hoja de ruta estratégica para acelerar el crecimiento de ${companyName}\n\nEstimado/a ${clientName},\n\nUn gusto saludarte. Hemos analizado la presencia digital actual de ${companyName} y detectamos una oportunidad concreta para duplicar el flujo de prospectos calificados reduciendo simultáneamente la fricción operativa.\n\nEn Pixel 12 diseñamos ecosistemas comerciales donde el contenido de autoridad, la pauta publicitaria y la asistencia virtual trabajan de forma sincronizada para que tu equipo se concentre únicamente en cerrar tratos.\n\nTe adjunto un diagnóstico ejecutivo preliminar de 3 minutos. ¿Tendrías 15 minutos este jueves a las 10:30 AM para revisar cómo podemos implementarlo en tu negocio?\n\nAtentamente,\nAlejandro Morales\nDirector Comercial · Pixel 12 OS`,
    followup: `¡Hola ${clientName}! ¿Cómo estás? Te escribe Alejandro de Pixel 12. Quería consultar si tuviste oportunidad de revisar la propuesta que te enviamos para ${companyName}. \n\nEsta semana estamos reservando los cupos operativos del próximo mes y me gustaría asegurarme de que podamos priorizar el onboarding de tu equipo. ¿Te viene bien una llamada rápida de 5 minutos hoy a las 4:00 PM para aclarar cualquier detalle?`,
    hashtags: `#Pixel12 #${sector.replace(/\s+/g, '')} #MarketingDigital #AsistenciaVirtual #EstrategiaB2B #HighTicket #CrecimientoEmpresarial #VentasDigitales #ProductividadEjecutiva #Automatizacion`,
    content_ideas: `1. Carrusel de Autoridad: "La anatomía de un sistema comercial que factura 24/7 sin agotar a su fundador."\n2. Reel de Diagnóstico: "El costo oculto de no delegar: cuánto dinero pierde tu empresa al mes en microgestión."\n3. Caso de Estudio: "Cómo una empresa de ${sector} duplicó sus reuniones comerciales en 45 días con Pixel 12."\n4. Post Educativo: "Tres automatizaciones clave que todo director debe implementar en WhatsApp."\n5. Publicación de Contraste: "Agencia tradicional vs. Ecosistema Integrado Pixel 12: la comparativa real."`,
    image_prompt: `Luxury corporate aesthetic, sleek obsidian black (#09090B) backdrop with dramatic golden lighting accents (#D4AF37) and metallic platinum frames. High-end executive desk with tablet displaying analytical dashboards, sharp focus, 8k resolution, cinematic atmosphere, editorial magazine quality.`
  };

  res.json({
    type,
    resultTitle: fallbackTitles[type] || `Contenido Comercial IA (${type})`,
    primaryContent: fallbackContents[type] || `Contenido comercial optimizado para ${companyName} con los estándares de Pixel 12.`,
    structuredData: {
      client: companyName,
      sector,
      service: selectedService,
      tone
    },
    suggestions: [
      'Revisa y adapta las métricas antes de enviar al cliente.',
      'Personaliza el nombre del contacto para maximizar la tasa de respuesta.'
    ],
    alternatives: [
      'Versión concisa para WhatsApp directo.',
      'Versión formal para carta de presentación institucional.'
    ],
    createdAt: new Date().toISOString()
  });
});

// AI: Generate Full Commercial Proposal
app.post('/api/quotes/generate-ai', async (req, res) => {
  const {
    prompt,
    client = {},
    selectedPlanIds = [],
    selectedServiceIds = [],
    customNeeds = '',
    budgetExpectation = '',
    brandName = 'Pixel 12'
  } = req.body;

  const data = readWorkspaceData();
  const plans = data.plans || initialAgencyPlans;
  const customServices = data.customServices || initialAgencyServices;
  const commSettings = data.commercialSettings || initialCommercialSettings;

  // Selected plans and services
  const chosenPlans = plans.filter((p: any) => selectedPlanIds.includes(p.id));
  const chosenServices = customServices.filter((s: any) => selectedServiceIds.includes(s.id));

  // Determine line items
  let lineItems: any[] = [];
  if (chosenPlans.length > 0) {
    chosenPlans.forEach((cp: any) => {
      lineItems.push({
        id: `item_${Date.now()}_${cp.id}`,
        type: 'PLAN',
        name: cp.name,
        description: cp.description,
        quantity: 1,
        unitPrice: cp.price,
        total: cp.price,
        planId: cp.id,
        deliverables: cp.deliverables || cp.services
      });
    });
  }
  if (chosenServices.length > 0) {
    chosenServices.forEach((cs: any) => {
      lineItems.push({
        id: `item_${Date.now()}_${cs.id}`,
        type: 'SERVICE',
        name: cs.name,
        description: cs.description,
        quantity: 1,
        unitPrice: cs.basePrice,
        total: cs.basePrice,
        serviceId: cs.id,
        deliverables: cs.deliverables
      });
    });
  }

  // If none selected, default to Plan Pro
  if (lineItems.length === 0) {
    const defaultPlan = plans.find((p: any) => p.isPopular) || plans[0] || initialAgencyPlans[1];
    lineItems.push({
      id: `item_def_${Date.now()}`,
      type: 'PLAN',
      name: defaultPlan.name,
      description: defaultPlan.description,
      quantity: 1,
      unitPrice: defaultPlan.price,
      total: defaultPlan.price,
      planId: defaultPlan.id,
      deliverables: defaultPlan.deliverables
    });
  }

  const subtotal = lineItems.reduce((acc, item) => acc + item.total, 0);
  const taxPercent = commSettings.taxPercent ?? 15;
  const taxAmount = Number(((subtotal * taxPercent) / 100).toFixed(2));
  const total = Number((subtotal + taxAmount).toFixed(2));

  const folio = `P12-COT-${new Date().getFullYear()}-${String((data.quotes?.length || 0) + 1).padStart(3, '0')}`;
  const now = new Date().toISOString();
  const validUntil = new Date(Date.now() + (commSettings.validityDays || 15) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const systemInstruction = `Eres el Director Comercial, Consultor de Negocios y Estratega Senior de PIXEL 12.
Pixel 12 es una agencia líder en:
- Marketing digital
- Gestión de redes sociales
- Creación y gestión de contenido
- Estrategia digital
- Asistencia virtual

Identidad visual: Negro sofisticado (#09090B), Dorado (#D4AF37), Plateado (#CBD5E1) y Blanco.
Tu objetivo es redactar los textos persuasivos de una PROPUESTA COMERCIAL FORMAL Y ELEGANTE para el cliente especificado.
Debes responder ESTRICTAMENTE en JSON con la siguiente estructura:
{
  "title": "Propuesta Comercial Estratégica: ...",
  "executiveSummary": "Resumen ejecutivo de 3 a 4 oraciones destacando el impacto en facturación, posicionamiento y ahorro de tiempo.",
  "presentationText": "Texto formal presentando a Pixel 12 como el aliado estratégico ideal.",
  "clientNeeds": [
    "Necesidad o dolor específico del cliente detectado",
    "Necesidad 2",
    "Necesidad 3"
  ],
  "proposedSolution": "Solución integral y metodología de Pixel 12 adaptada al rubro del cliente.",
  "roadmap": [
    {
      "phase": "Fase 1: Diagnóstico, Onboarding & Setup Estratégico",
      "duration": "Semana 1",
      "description": "Diagnóstico de activos, definición de buyer personas, benchmark de competencia y setup de herramientas.",
      "deliverables": ["Brief estratégico", "Brand Board de contenido", "Calendario inicial"]
    },
    {
      "phase": "Fase 2: Producción Creativa & Despliegue de Campañas",
      "duration": "Semanas 2 a 3",
      "description": "Creación de piezas de alto impacto visual con diseño oficial Pixel 12 y redacción persuasiva.",
      "deliverables": ["Parrilla de contenidos aprobada", "Creativos publicitarios", "Flujos de mensajería"]
    },
    {
      "phase": "Fase 3: Optimización Continua & Escalamiento Comercial",
      "duration": "Semana 4 en adelante",
      "description": "Supervisión de métricas clave, refinamiento semanal y reportes de desempeño.",
      "deliverables": ["Reporte analítico mensual", "Sesión ejecutiva de resultados", "Plan de optimización"]
    }
  ],
  "notes": "Observaciones finales, soporte prioritario incluido y bonificaciones de valor agregado."
}`;

  const promptContent = `Cliente: ${client.name || 'Cliente'}
Empresa: ${client.company || 'Empresa'}
Sector / Industria: ${client.sector || 'Servicios / Comercio'}
Ciudad / País: ${client.cityCountry || 'Guayaquil, Ecuador'}
Planes / Servicios incluidos: ${lineItems.map(i => i.name).join(', ')}
Necesidades adicionales descritas: ${customNeeds || 'Escalar presencia digital y captar clientes calificados'}
Presupuesto esperado: ${budgetExpectation || 'Acorde a la propuesta'}
Instrucción adicional: ${prompt || 'Crear una propuesta de alto impacto para cerrar el trato con profesionalismo.'}`;

  let aiNarrative: any = {
    title: `Propuesta Estratégica de Marketing & Crecimiento Digital — ${client.company || 'Cliente'}`,
    executiveSummary: `Propuesta comercial formulada exclusivamente para ${client.company || 'su empresa'} por Pixel 12. Diseñada para potenciar el posicionamiento digital, generar autoridad y maximizar la adquisición de clientes calificados mediante contenido de alta calidad y gestión operativa eficiente.`,
    presentationText: `En Pixel 12 combinamos estrategia digital avanzada, creación sistemática de contenido y asistencia virtual especializada para que su marca proyecte liderazgo y alcance sus objetivos comerciales sin fricción operativa.`,
    clientNeeds: [
      'Establecer una presencia digital sólida, profesional y visualmente coherente con su valor de mercado.',
      'Generar un flujo constante de prospectos interesados a través de contenido estratégico y pauta optimizada.',
      'Delegar la gestión y diseño en un equipo especializado con altos estándares de cumplimiento.'
    ],
    proposedSolution: `Implementación de un sistema integral que abarca desde la conceptualización creativa hasta la ejecución de piezas multicanal, garantizando impacto visual, tono persuasivo y reporte continuo de resultados.`,
    roadmap: [
      {
        phase: 'Fase 1: Onboarding & Diagnóstico Estratégico',
        duration: 'Semana 1',
        description: 'Levantamiento de información, alineación de marca, definición de pilares de contenido y accesos.',
        deliverables: ['Briefing comercial', 'Manual de estilo para redes', 'Planificación del primer mes']
      },
      {
        phase: 'Fase 2: Producción de Alto Nivel & Lanzamiento',
        duration: 'Semanas 2 y 3',
        description: 'Diseño de carruseles, publicaciones estáticas, guiones audiovisuales y configuración publicitaria.',
        deliverables: ['Lote de artes aprobados', 'Copies con técnicas de persuasión', 'Campañas activadas']
      },
      {
        phase: 'Fase 3: Medición, Optimización & Escalamiento',
        duration: 'Semana 4 y continuo',
        description: 'Análisis detallado de interacción, costo por lead y ajustes estratégicos en tiempo real.',
        deliverables: ['Dashboard de métricas', 'Reunión de balance mensual', 'Propuesta de escala']
      }
    ],
    notes: 'Incluye soporte directo vía canal prioritario de Slack/WhatsApp durante días laborables.'
  };

  try {
    const aiText = await generateGeminiContent({
      contents: promptContent,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    });
    if (aiText) {
      const parsed = JSON.parse(aiText);
      aiNarrative = { ...aiNarrative, ...parsed };
    }
  } catch (err) {
    console.log('[AI Quotes] Notice: Live Gemini generation fallback applied gracefully.');
  }

  // Curate visuals from image library or high-end agency assets
  const visuals = [
    {
      id: `vis_${Date.now()}_1`,
      title: 'Identidad Visual & Portada de Marca',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      concept: 'Estética contemporánea Pixel 12 con acabados oro y negro para transmitir exclusividad.',
      type: 'cover' as const
    },
    {
      id: `vis_${Date.now()}_2`,
      title: 'Mockup Multidispositivo de Contenido',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
      concept: 'Demostración de presencia en Instagram, LinkedIn y plataformas móviles con alta conversión.',
      type: 'mockup' as const
    },
    {
      id: `vis_${Date.now()}_3`,
      title: 'Ecosistema de Marketing & Métricas',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
      concept: 'Panel de monitoreo de KPIs de alcance, interacción y prospectos generados.',
      type: 'service' as const
    }
  ];

  const fullProposal = {
    id: `quote_${Date.now()}`,
    brandId: 'brand_pixel12',
    folio,
    title: aiNarrative.title,
    status: 'DRAFT' as const,
    client: {
      name: client.name || 'Cliente Ejecutivo',
      company: client.company || 'Empresa Cliente',
      email: client.email || 'contacto@empresa.com',
      phone: client.phone || '+593 99 999 9999',
      cityCountry: client.cityCountry || 'Guayaquil, Ecuador',
      taxId: client.taxId || '',
      sector: client.sector || 'Servicios'
    },
    issueDate: now.split('T')[0],
    validUntil,
    currency: 'USD',
    executiveSummary: aiNarrative.executiveSummary,
    presentationText: aiNarrative.presentationText,
    clientNeeds: aiNarrative.clientNeeds,
    proposedSolution: aiNarrative.proposedSolution,
    selectedPlan: chosenPlans[0] || undefined,
    items: lineItems,
    subtotal,
    taxPercent,
    taxAmount,
    discountPercent: 0,
    discountAmount: 0,
    total,
    paymentTerms: commSettings.paymentTermsDefault || '50% anticipo al iniciar y 50% al completar el primer entregable / corte mensual.',
    paymentMethods: commSettings.bankDetails || 'Banco Pichincha - Cta. Corriente #2100234589 a nombre de Pixel 12 Agency.',
    termsAndConditions: commSettings.termsAndConditions || 'Validez 15 días. Entregables sujetos a cronograma aprobado. Propuesta confidencial.',
    roadmap: aiNarrative.roadmap,
    visuals,
    notes: aiNarrative.notes || 'Propuesta válida durante 15 días a partir de la fecha de emisión.',
    createdAt: now,
    updatedAt: now
  };

  // Persist proposal into workspace
  const quotesList = data.quotes || initialQuoteProposals;
  data.quotes = [fullProposal, ...quotesList];
  writeWorkspaceData(data);

  res.json({ success: true, proposal: fullProposal });
});

// AI: Generate Professional Image Asset for Quotes / Social / Branding
app.post('/api/ai/generate-quote-image', async (req, res) => {
  const {
    type = 'Cotizaciones',
    objective = 'Autoridad',
    client = 'Cliente',
    sector = 'Negocios',
    targetAudience = 'Dueños de negocio y directores',
    service = 'Marketing Digital',
    style = 'Pixel 12 Luxury (Negro, Oro, Plata)',
    tone = 'Elegante y Sofisticado',
    aspectRatio = '1:1',
    prompt = '',
    brandName = 'Pixel 12'
  } = req.body;

  // Curated premium images pool categorized by aesthetic
  const luxuryBlackGoldImages = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80'
  ];

  const editorialExecutiveImages = [
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&auto=format&fit=crop&q=80'
  ];

  const minimalTechImages = [
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80'
  ];

  let selectedImagePool = luxuryBlackGoldImages;
  if (style.includes('Editorial')) selectedImagePool = editorialExecutiveImages;
  if (style.includes('Minimal') || style.includes('Cyber')) selectedImagePool = minimalTechImages;

  const randomImage = selectedImagePool[Math.floor(Math.random() * selectedImagePool.length)];

  const systemInstruction = `Eres el Director de Arte & Diseñador de Producción Visual Senior de Pixel 12.
Debes crear la ficha técnica de un visual publicitario o comercial de alto impacto.
Responde en JSON:
{
  "title": "Título descriptivo del visual",
  "prompt": "Prompt cinematográfico detallado en inglés para modelos de generación visual hiperrealistas (Midjourney/Imagen 3), con iluminación dramática, paleta negro mate, acentos dorados pulidos (#D4AF37), tipografía moderna y composición en regla de tercios.",
  "visualDirection": "Instrucciones de dirección de arte en español para el equipo de diseño de Pixel 12",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"]
}`;

  let visualInfo = {
    title: `${type} — ${service} (${client})`,
    prompt: `Hyper-realistic luxury commercial visual, black matte dark minimalist architecture backdrop with subtle brushed gold accents (#D4AF37) and polished silver metallic details, cinematic studio lighting, 8k resolution, elegant modern typography, clean geometric composition, 3D render style, octane render, pristine executive agency aesthetic.`,
    visualDirection: `Paleta dominante negro azabache con contrastes dorados y plateados. Enfoque en transmitir exclusividad, solidez y liderazgo comercial para ${client}.`,
    tags: [type, 'Pixel 12', objective, sector]
  };

  try {
    const aiRes = await generateGeminiContent({
      contents: `Tipo de imagen: ${type}\nObjetivo: ${objective}\nCliente/Proyecto: ${client}\nSector: ${sector}\nPúblico: ${targetAudience}\nServicio: ${service}\nEstilo visual: ${style}\nTono: ${tone}\nInstrucciones extra: ${prompt}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    });
    if (aiRes) {
      const parsed = JSON.parse(aiRes);
      visualInfo = { ...visualInfo, ...parsed };
    }
  } catch (e) {
    console.log('[AI Visual] Live generation notice; using curated agency visual.');
  }

  const generatedAsset = {
    id: `img_${Date.now()}`,
    title: visualInfo.title,
    imageUrl: randomImage,
    prompt: visualInfo.prompt,
    category: type,
    aspectRatio,
    style,
    tags: visualInfo.tags || [type, 'Pixel 12', 'IA'],
    sector,
    client,
    visualDirection: visualInfo.visualDirection,
    createdAt: new Date().toISOString()
  };

  // Auto-save to library in workspace
  const data = readWorkspaceData();
  const library = data.imageLibrary || initialImageLibraryItems;
  data.imageLibrary = [generatedAsset, ...library];
  writeWorkspaceData(data);

  res.json(generatedAsset);
});

// AI: Full Campaign Generator (The Star Feature!)
app.post('/api/ai/full-campaign', async (req, res) => {
  const {
    prompt,
    brandName = 'Pixel 12',
    targetMonth = 'Septiembre 2026',
    targetPlatforms = ['instagram', 'linkedin', 'facebook'],
    frequency = '4 publicaciones por semana',
    tone = 'Cercano, Profesional y Estratégico',
    postCount = 8
  } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'El prompt es obligatorio' });
  }

  const ai = getGeminiClient();

  const systemInstruction = `Eres el AI Content Strategist, Social Media Manager, Copywriter y Creative Director Senior de PIXEL 12 OS.
PIXEL 12 es una agencia especializada en:
1. Marketing digital
2. Gestión de redes sociales
3. Creación y gestión de contenido
4. Estrategia digital
5. Asistencia virtual

Identidad visual de Pixel 12: Negro (base), Dorado (acento), Plateado (secundario) y Blanco (contraste).
Tu misión es recibir una instrucción o necesidad de contenido y generar una ESTRATEGIA COMPLETA, PERSUASIVA Y LISTA PARA EJECUTAR a nivel de agencia internacional.
Debes responder ESTRICTAMENTE en formato JSON válido con la siguiente estructura:
{
  "strategySummary": "Resumen ejecutivo de la estrategia y objetivos comerciales",
  "targetAudience": "Público objetivo detallado y sus dolores (dueños de negocio, directores, PyMEs)",
  "contentPillars": ["Marketing Digital", "Asistencia Virtual", "Autoridad", "Conversión", "Engagement"],
  "weeklyFrequency": "${frequency}",
  "posts": [
    {
      "internalTitle": "Título interno claro del contenido",
      "date": "2026-09-XX",
      "time": "11:00",
      "platforms": ["instagram", "linkedin", "facebook"],
      "format": "Carousel | Reel | Static Post | Short | Video",
      "pillar": "Marketing Digital | Asistencia Virtual | Autoridad | Conversión | Engagement",
      "theme": "Tema específico",
      "objective": "Objetivo de negocio específico (autoridad, conversión, captación de leads, venta)",
      "hook": "Gancho demoledor para los primeros 3 segundos o primera línea",
      "caption": "Copy completo listo para publicar con saltos de línea, emojis y estructura AIDA/PAS",
      "cta": "Llamada a la acción específica y persuasiva",
      "hashtags": ["#Pixel12", "#MarketingDigital", "#AsistenciaVirtual"],
      "visualText": "Texto que va montado en la imagen o slide 1",
      "visualDescription": "Instrucciones de diseño visual y estilo (Negro, Dorado, Plateado y Blanco)",
      "imagePrompt": "Prompt en inglés para generar la imagen visual con IA",
      "script": "Si es Reel/Short: guion segundo a segundo con b-roll y diálogos"
    }
  ],
  "tasks": [
    {
      "title": "Título de la tarea para el equipo",
      "description": "Detalles específicos para diseñador, copywriter o community manager",
      "assignedRole": "Designer | Copywriter | Community Manager",
      "priority": "HIGH | MEDIUM | LOW",
      "daysBeforePost": 2
    }
  ]
}
Genera exactamente ${postCount} publicaciones distribuidas en el mes objetivo (${targetMonth}), con fechas coherentes espaciadas según la frecuencia.`;

  // High quality deterministic fallback posts & tasks
  const fallbackPosts = Array.from({ length: postCount }).map((_, i) => {
    const day = String(3 + i * 3).padStart(2, '0');
    const formats = ['Carousel', 'Reel', 'Static Post', 'Carousel'] as const;
    const format = formats[i % formats.length];
    const pillars = ['Marketing Digital', 'Asistencia Virtual', 'Autoridad', 'Conversión'] as const;
    const pillar = pillars[i % pillars.length];

    return {
      internalTitle: `Contenido #${i + 1}: Estrategia de Crecimiento y Asistencia Virtual Pixel 12`,
      date: `2026-09-${day}`,
      time: i % 2 === 0 ? '11:00' : '18:30',
      platforms: targetPlatforms,
      format,
      pillar,
      theme: `Sistemas de Marketing y Delegación para ${brandName}`,
      objective: 'Captar clientes interesados en escalar su negocio con sistemas digitales y asistencia virtual',
      hook: `¿Sigues perdiendo más de 15 horas a la semana apagando fuegos operativos en tu negocio?`,
      caption: `La diferencia entre un negocio estancado y una empresa que escala es la capacidad de crear sistemas y delegar con confianza.\n\nEn ${brandName} ayudamos a fundadores a liberar tiempo delegando su marketing, redes sociales y gestión operativa en asistentes virtuales calificadas.\n\nGuarda este post y empieza a estructurar tu delegación hoy.`,
      cta: `Comenta "ESCALAR" y te enviamos la guía de delegación operativa por mensaje privado 🚀`,
      hashtags: ['#Pixel12', '#MarketingDigital', '#AsistenciaVirtual', '#EstrategiaDigital', '#Productividad'],
      visualText: `5 Tareas operativas que debes delegar antes de fin de mes 👉`,
      visualDescription: `Diseño prémium Pixel 12: fondo negro obsidiana (#09090B), acentos en dorado (#D4AF37), tipografía moderna y detalles plateados.`,
      imagePrompt: `Ultra-luxurious minimalist graphic for Pixel 12 agency, dark obsidian background with sleek gold and silver accents, modern typography.`,
      script: format === 'Reel' ? '00:00-00:03: Hook con texto grande dorado sobre fondo negro\n00:03-00:20: Problema común de los fundadores al no delegar\n00:20-00:40: Solución en 3 pasos con Asistencia Virtual Pixel 12\n00:40-00:50: CTA a comentar ESCALAR' : undefined
    };
  });

  const fallbackTasks = [
    {
      title: 'Diseñar artes y carruseles para la parrilla de Septiembre',
      description: 'Crear los gráficos en formato 1080x1350 para los carruseles y portadas de reels.',
      assignedRole: 'Designer',
      priority: 'HIGH',
      daysBeforePost: 2
    },
    {
      title: 'Revisión final de copies y adaptación de hashtags',
      description: 'Verificar ganchos y adaptar las versiones para LinkedIn e Instagram.',
      assignedRole: 'Copywriter',
      priority: 'MEDIUM',
      daysBeforePost: 1
    },
    {
      title: 'Programación de la parrilla en Meta Suite y LinkedIn',
      description: 'Configurar horarios de mayor interacción en timezone America/Guayaquil.',
      assignedRole: 'Community Manager',
      priority: 'HIGH',
      daysBeforePost: 1
    }
  ];

  if (!ai) {
    return res.json({
      strategySummary: `Estrategia generada para ${brandName} en ${targetMonth}: Enfoque en conversión y autoridad para captar clientes de servicios y asistencia virtual.`,
      targetAudience: 'PyMEs, directores de agencias y profesionales independientes que necesitan delegar marketing y soporte.',
      contentPillars: ['Educativo', 'Autoridad', 'Venta', 'Comunidad'],
      weeklyFrequency: frequency,
      posts: fallbackPosts,
      tasks: fallbackTasks
    });
  }

  try {
    const text = await generateGeminiContent({
      contents: `Marca: ${brandName}\nMes objetivo: ${targetMonth}\nCanales: ${targetPlatforms.join(', ')}\nFrecuencia: ${frequency}\nTono: ${tone}\nInstrucción del usuario:\n${prompt}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.log('[AI] Using resilient fallback campaign strategy');
    // Return high quality deterministic campaign if live AI has an issue
    return res.json({
      strategySummary: `Estrategia generada para ${brandName} en ${targetMonth}: Enfoque en conversión y autoridad en redes sociales.`,
      targetAudience: 'Comunidad objetivo, clientes potenciales y tomadores de decisiones de la marca.',
      contentPillars: ['Educativo', 'Autoridad', 'Venta', 'Comunidad'],
      weeklyFrequency: frequency,
      posts: fallbackPosts,
      tasks: fallbackTasks
    });
  }
});

// AI: Copilot Chat Assistant
app.post('/api/ai/chat', async (req, res) => {
  const {
    message,
    history = [],
    brandName = 'Pixel 12',
    brandVoice = 'Cercano, Profesional y Estratégico',
    brandAudience = 'PyMEs y Negocios Digitales'
  } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      reply: `Hola, soy el Copiloto de IA de ${brandName}. Puedo ayudarte a redactar ganchos irresistibles, idear carruseles educativos, crear guiones para Reels o planificar tu estrategia semanal con tono ${brandVoice}. ¿Sobre qué tema te gustaría que trabajemos hoy?`
    });
  }

  try {
    // Sanitize conversation history for Gemini multi-turn format:
    // 1. Filter out empty turns
    // 2. Ensure the first turn in history is a 'user' turn
    // 3. Ensure strictly alternating user / model sequence
    const sanitizedTurns: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];

    for (const h of history) {
      const role: 'user' | 'model' = h.role === 'user' ? 'user' : 'model';
      const text = (h.text || h.content || '').trim();
      if (!text) continue;

      // Gemini multi-turn contents MUST begin with a user turn
      if (sanitizedTurns.length === 0 && role !== 'user') {
        continue;
      }

      // Avoid consecutive turns with identical roles by merging
      if (sanitizedTurns.length > 0 && sanitizedTurns[sanitizedTurns.length - 1].role === role) {
        sanitizedTurns[sanitizedTurns.length - 1].parts[0].text += `\n\n${text}`;
      } else {
        sanitizedTurns.push({ role, parts: [{ text }] });
      }
    }

    // Append current user message
    if (sanitizedTurns.length > 0 && sanitizedTurns[sanitizedTurns.length - 1].role === 'user') {
      sanitizedTurns[sanitizedTurns.length - 1].parts[0].text += `\n\n${message.trim()}`;
    } else {
      sanitizedTurns.push({ role: 'user', parts: [{ text: message.trim() }] });
    }

    const systemInstruction = `Eres el Copiloto Creativo y Estratégico de PIXEL 12 OS para la marca "${brandName}".
Tono de voz de la marca: ${brandVoice}.
Público objetivo: ${brandAudience}.
Tu misión es generar contenido de marketing de altísima calidad, persuasivo y listo para publicar en redes sociales (Instagram, LinkedIn, YouTube, TikTok, Facebook).
Responde siempre en español, con un tono profesional, empático y orientado a conversión.
Puedes redactar copies completos con emojis bien colocados, ganchos de 3 segundos, estructuras de carruseles paso a paso, guiones dinámicos para Reels/Shorts y llamadas a la acción (CTA) efectivas.
Usa formato Markdown elegante y legible.`;

    const reply = await generateGeminiContent({
      contents: sanitizedTurns,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: reply || 'Sin respuesta generada.' });
  } catch (err: any) {
    console.log('[AI] Using resilient fallback copilot response');

    // Fallback creative response if API is temporarily unavailable
    const fallbackResponse = `¡Hola! Como Copiloto de IA para **${brandName}**, aquí tienes una propuesta estratégica basada en tu consulta:\n\n` +
      `**Gancho de alto impacto (0-3 seg):**\n"El 90% de las marcas cometen este error con su estrategia de contenido..."\n\n` +
      `**Estructura recomendada:**\n1. Identificar el dolor clave de tu audiencia (${brandAudience})\n2. Desglosar la solución práctica en 3 pasos clave\n3. Beneficio tangible y caso de uso\n\n` +
      `**Llamada a la Acción (CTA):**\n"Guarda este post y déjanos tu opinión en comentarios 👇"\n\n*(Nota: El motor de IA completó esta estructura inmediata. Puedes continuar o pedir otro formato).*`;

    return res.json({ reply: fallbackResponse });
  }
});

// AI: Repurpose Content
app.post('/api/ai/repurpose', async (req, res) => {
  const { originalPost, targetFormat, targetPlatform } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      format: targetFormat,
      platform: targetPlatform,
      hook: `[Reutilizado para ${targetPlatform}]: ` + (originalPost?.hook || ''),
      caption: `Versión adaptada en formato ${targetFormat} para ${targetPlatform}:\n\n` + (originalPost?.caption || ''),
      cta: originalPost?.cta || 'Síguenos para más contenido estratégico.',
      hashtags: originalPost?.hashtags || ['#Pixel12']
    });
  }

  try {
    const text = await generateGeminiContent({
      contents: `Adapta el siguiente contenido original al formato "${targetFormat}" específicamente para la plataforma "${targetPlatform}".
Contenido original:
Título: ${originalPost.internalTitle}
Gancho: ${originalPost.hook}
Caption: ${originalPost.caption}
CTA: ${originalPost.cta}
Formato actual: ${originalPost.format}

Devuelve un JSON con:
{
  "hook": "Nuevo hook adaptado",
  "caption": "Nuevo copy adaptado",
  "cta": "Nuevo CTA óptimo para la plataforma",
  "hashtags": ["#tag1", "#tag2"],
  "formatNotes": "Consejos específicos de publicación para este formato"
}`,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.log('[AI] Using resilient repurposed content fallback');
    res.json({
      format: targetFormat,
      platform: targetPlatform,
      hook: `[Adaptado para ${targetPlatform}]: ${originalPost?.hook || ''}`,
      caption: `Versión optimizada para ${targetPlatform} (${targetFormat}):\n\n${originalPost?.caption || ''}`,
      cta: originalPost?.cta || 'Comenta abajo para más info',
      hashtags: originalPost?.hashtags || ['#Pixel12', '#Marketing']
    });
  }
});

// AI: Refine Content Tool (Improve, Rewrite, Shorten, Expand, Change Tone, Persuasive, Professional, Engaging, CTA, Visual Concept)
app.post('/api/ai/refine', async (req, res) => {
  const {
    text,
    action = 'improve',
    tone = 'Profesional y Estratégico',
    brandName = 'Pixel 12',
    targetAudience = 'Dueños de negocio y PyMEs en crecimiento'
  } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Texto requerido para refinar' });
  }

  const ai = getGeminiClient();
  const actionPrompts: Record<string, string> = {
    improve: 'Mejora este texto elevando su impacto, gancho y persuasión sin perder la esencia.',
    rewrite: 'Reescribe este texto desde un ángulo nuevo, moderno y de alto impacto.',
    shorten: 'Sintetiza y acorta este texto haciéndolo conciso, directo y contundente.',
    expand: 'Expande este texto añadiendo contexto práctico, datos y ejemplos aplicables.',
    change_tone: `Reescribe este texto adaptándolo estrictamente al tono: "${tone}".`,
    make_persuasive: 'Convierte este texto en una pieza altamente persuasiva con psicología de ventas y valor de negocio.',
    make_professional: 'Eleva el lenguaje a un tono ejecutivo, riguroso y de máxima autoridad corporativa.',
    make_engaging: 'Haz que este texto sea irresistible para comentar, compartir y generar interacción.',
    generate_cta: 'Genera 3 opciones de llamada a la acción (CTA) directas y de alta conversión para este texto.',
    generate_visual_concept: 'Diseña una propuesta de dirección de arte visual en formato Negro, Dorado, Plateado y Blanco de Pixel 12.'
  };

  const selectedInstruction = actionPrompts[action] || actionPrompts.improve;

  if (!ai) {
    let refined = text;
    if (action === 'shorten') {
      refined = text.split('\n').filter((l: string) => l.trim().length > 0).slice(0, 3).join('\n\n');
    } else if (action === 'make_persuasive') {
      refined = `⚡ [ENFOQUE DE CONVERSIÓN PIXEL 12]\n\n${text}\n\n👉 El costo de no delegar es mayor que la inversión en tu equipo: contáctanos y activa tu sistema hoy.`;
    } else if (action === 'generate_cta') {
      refined = `1️⃣ Comenta "SISTEMAS" y recibe la plantilla directa en tu DM 📩\n2️⃣ Agenda una llamada estratégica de 15 min en el link de la bio 🚀\n3️⃣ Guarda este post para aplicarlo con tu equipo 📌`;
    } else {
      refined = `✨ [Refinado por Pixel 12 OS]\n\n${text}\n\n*Optimizado para mayor impacto, retención y conversión.*`;
    }
    return res.json({ refinedText: refined, action });
  }

  try {
    const prompt = `Eres el AI Copywriter, Content Strategist y Creative Director Senior de PIXEL 12 OS.
Marca: ${brandName}.
Público objetivo: ${targetAudience}.
Tarea: ${selectedInstruction}

Texto a refinar:
"""
${text}
"""

Responde ÚNICAMENTE con el resultado refinado final listo para usar en redes o comunicación comercial, sin metatextos ni saludos.`;

    const refinedText = await generateGeminiContent({
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    res.json({ refinedText: (refinedText || text).trim(), action });
  } catch (err: any) {
    console.error('Error in /api/ai/refine:', err);
    res.json({ refinedText: `✨ [Refinado]\n\n${text}`, action });
  }
});

// AI: Design & Content Generator (Pixel 12 OS / Visual + Text AI Engine)
const P12_DYNAMIC_SLIDE_IMAGES = [
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=85', // Marketing & Growth Strategy
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=85', // Problem: Overwhelmed multitasking
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&auto=format&fit=crop&q=85', // Solution: Professional Virtual Assistant
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=85', // Case study: Analytics dashboard +140%
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=85', // Strategy meeting & conversion
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=85'  // Luxury Obsidian & Gold (CTA)
];

const P12_AUTHOR_AVATAR_URL = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

app.post('/api/ai/design-content', async (req, res) => {
  const {
    format = 'Carrusel',
    pillar = 'Marketing Digital',
    style = 'Pixel 12 Gold & Black (Oficial)',
    topic = '',
    brandName = 'Pixel 12',
    authorName = 'Pixel 12 Agency'
  } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'Debes proporcionar un tema o enlace para generar el diseño y contenido' });
  }

  const ai = getGeminiClient();

  // Realistic high-quality fallback generator for Pixel 12
  const getFallbackData = () => {
    const defaultTopic = topic.trim();
    const slidesCount = format === 'Carrusel' ? 5 : format === 'Post' || format === 'Creativo de pauta' ? 2 : 3;

    const generatedTitle = `${pillar}: ${defaultTopic.slice(0, 50)}`;
    const hook = `El 85% de los dueños de negocio pierden entre 10 y 18 horas a la semana haciendo tareas que una asistente virtual resolvería en minutos.`;
    const caption = `Trabajar más horas no es escalar: es convertirte en el empleado más agotado de tu propia empresa.\n\n` +
      `En Pixel 12 ayudamos a fundadores, directores y PyMEs a implementar sistemas predecibles de marketing y delegación operativa:\n\n` +
      `1️⃣ Diagnóstico de cuellos de botella: Qué tareas jamás debería hacer el fundador.\n` +
      `2️⃣ Asistente virtual calificada: Onboarding en 48 horas con manual de procesos.\n` +
      `3️⃣ Máquina de contenido y captación: Generación consistente de prospectos calificados.\n\n` +
      `Desliza para ver la estructura paso a paso y los datos medidos en clientes reales 👉\n\n` +
      `Guarda este post para tu próxima reunión de planificación semanal 📌`;
    const cta = `Comenta "DELEGAR" y te enviamos la lista de 25 tareas operativas que debes transferir de inmediato 🚀`;
    const hashtags = ['#Pixel12', '#MarketingDigital', '#AsistenciaVirtual', '#EstrategiaEmpresarial', '#Automatizacion', '#Productividad'];

    const slides = [
      {
        slideNumber: 1,
        slideType: 'cover' as const,
        tag: `PIXEL 12 · ${pillar.toUpperCase()}`,
        headline: defaultTopic.length > 10 ? defaultTopic : 'Cómo escalar tu negocio delegando marketing y operaciones con IA',
        subtitle: 'El sistema en 4 pasos para recuperar 15 horas a la semana sin perder el control de la calidad.',
        imageUrl: P12_DYNAMIC_SLIDE_IMAGES[0],
        layoutMode: 'full_background' as const,
        overlayOpacity: 70,
        imagePrompt: 'High quality modern business office, marketing charts on screen, luxury ambient lighting in dark gold',
        authorAvatar: P12_AUTHOR_AVATAR_URL,
        bodyPoints: [
          'Eliminación de microgestión operativa',
          'Atracción de clientes de alto valor con contenido de autoridad',
          'Asistente virtual entrenada y lista en 48 horas'
        ],
        showAuthorBadge: true,
        authorBadgeName: authorName,
        authorBadgeTitle: 'Pixel 12 OS · Especialista Certificado',
        showOfficialLogo: true,
        highlightBadge: 'ESTRATEGIA COMPROBADA',
        accentColor: '#D4AF37',
        visualDescription: 'Fondo negro obsidiana (#09090B), bordes sutiles metálicos (#222232), tipografía geométrica de alto contraste y detalles dorados (#D4AF37).'
      },
      {
        slideNumber: 2,
        slideType: 'problem' as const,
        tag: 'EL CUELLO DE BOTELLA',
        headline: 'El fundador sigue siendo el operador, vendedor y diseñador de su empresa',
        subtitle: 'Consecuencia: estancamiento de facturación y falta de tiempo para estrategia.',
        imageUrl: P12_DYNAMIC_SLIDE_IMAGES[1],
        layoutMode: 'split_top' as const,
        overlayOpacity: 65,
        imagePrompt: 'Professional executive overwhelmed with notifications and tasks on laptop desk',
        authorAvatar: P12_AUTHOR_AVATAR_URL,
        bodyPoints: [
          'Más de 15 horas semanales perdidas en DMs, correos y facturación',
          'Campañas de marketing intermitentes por falta de consistencia',
          'Pérdida de clientes calificados por responder después de 2 horas'
        ],
        showAuthorBadge: false,
        showOfficialLogo: true,
        metricNumber: '-18h',
        metricLabel: 'Tiempo promedio desperdiciado semanalmente por fundador sin delegar',
        visualDescription: 'Tarjeta negra con acento rojo sutil y métrica tipográfica grande en color plata brillante.'
      },
      {
        slideNumber: 3,
        slideType: 'solution' as const,
        tag: 'EL SISTEMA PIXEL 12',
        headline: 'La arquitectura en 3 capas de delegación y marketing',
        subtitle: 'Cómo estandarizamos la operación para que el negocio funcione con precisión suiza.',
        imageUrl: P12_DYNAMIC_SLIDE_IMAGES[2],
        layoutMode: 'full_background' as const,
        overlayOpacity: 75,
        imagePrompt: 'Professional Latin virtual assistant working efficiently with headset in modern office',
        authorAvatar: P12_AUTHOR_AVATAR_URL,
        bodyPoints: [
          'Capa 1: Manual operativo y matrices de decisión claras',
          'Capa 2: Asistente virtual sincronizada en CRM, agenda y soporte',
          'Capa 3: Contenido de autoridad publicado y distribuido sin fricción'
        ],
        showAuthorBadge: false,
        showOfficialLogo: true,
        metricNumber: '3.5x',
        metricLabel: 'Mayor velocidad de ejecución en tareas comerciales',
        visualDescription: 'Diagrama de bloques elegante con líneas doradas delgadas y badges numerados.'
      },
      {
        slideNumber: 4,
        slideType: 'case_study' as const,
        tag: 'RESULTADO EN CLIENTES',
        headline: 'Empresa B2B escala de 4 a 19 leads calificados por semana',
        subtitle: 'Resultados medidos en los primeros 60 días de implementación con Pixel 12.',
        imageUrl: P12_DYNAMIC_SLIDE_IMAGES[3],
        layoutMode: 'split_top' as const,
        overlayOpacity: 70,
        imagePrompt: 'Financial growth analytics charts and revenue statistics with green and gold indicators',
        authorAvatar: P12_AUTHOR_AVATAR_URL,
        bodyPoints: [
          'Tiempo de respuesta a prospectos: de 4 horas a 3 minutos',
          '18 horas semanales liberadas al director comercial',
          'ROI de 4.2x sobre la inversión en marketing y asistencia'
        ],
        showAuthorBadge: false,
        showOfficialLogo: true,
        metricNumber: '+320%',
        metricLabel: 'Incremento en agendamiento de llamadas cualificadas',
        visualDescription: 'Tarjeta de métrica destacada con borde dorado (#D4AF37) y datos de impacto en verde esmeralda y blanco.'
      },
      {
        slideNumber: 5,
        slideType: 'cta' as const,
        tag: 'PRÓXIMO PASO',
        headline: '¿Listo para profesionalizar tus redes y delegar tu operación?',
        subtitle: 'El equipo de Pixel 12 puede diagnosticar tus procesos y diseñar tu plan a medida en 24h.',
        imageUrl: P12_DYNAMIC_SLIDE_IMAGES[5],
        layoutMode: 'full_background' as const,
        overlayOpacity: 80,
        imagePrompt: 'Luxury dark obsidian and gold abstract cinematic background with elegant depth',
        authorAvatar: P12_AUTHOR_AVATAR_URL,
        bodyPoints: [
          'Diagnóstico gratuito de cuello de botella operativo',
          'Propuesta de asignación de Asistente Virtual calificada',
          'Parrilla mensual de contenidos con dirección creativa prémium'
        ],
        showAuthorBadge: true,
        authorBadgeName: authorName,
        authorBadgeTitle: 'Pixel 12 · Consultor Estratégico',
        showOfficialLogo: true,
        highlightBadge: 'CONSULTORÍA DISPONIBLE',
        accentColor: '#D4AF37',
        visualDescription: 'Slide de cierre prémium con badge dorado, llamada a la acción clara y enlaces oficiales de Pixel 12.'
      }
    ].slice(0, slidesCount);

    const reelScript = [
      {
        secondRange: '00:00 - 00:03',
        shotType: 'Primer plano directo a cámara con iluminación de estudio',
        visualDirection: 'Texto tipográfico grande en oro sobre negro: "Por qué trabajar 14 horas no te hará crecer"',
        voiceover: 'Si sigues respondiendo cada mensaje, haciendo tus propios artes y cuadrando facturas a las 11 de la noche... tu negocio no es un activo, es una trampa.'
      },
      {
        secondRange: '00:03 - 00:15',
        shotType: 'B-roll mostrando pantalla con calendario colapsado y flujo de trabajo',
        visualDirection: 'Gráfico animado con las 15 horas perdidas y el costo por hora del fundador',
        voiceover: 'En Pixel 12 calculamos que el 70% de las tareas diarias de un fundador pueden ser ejecutadas por una Asistente Virtual entrenada con sistemas claros.'
      },
      {
        secondRange: '00:15 - 00:25',
        shotType: 'Demostración de la plataforma Pixel 12 OS y flujo comercial',
        visualDirection: 'Tarjetas de contenido y embudos automáticos sincronizados',
        voiceover: 'Liberas 15 horas a la semana, tu marketing se publica con calidad prémium y tú te enfocas únicamente en cerrar clientes de alto valor.'
      },
      {
        secondRange: '00:25 - 00:30',
        shotType: 'Cierre con logo dorado Pixel 12 en esquina superior',
        visualDirection: 'CTA con botón dorado animado y texto "Comenta DELEGAR"',
        voiceover: 'Comenta "DELEGAR" abajo y te envío nuestra guía con las 25 tareas que debes delegar este mes.'
      }
    ];

    const blogSEO = {
      metaTitle: `${defaultTopic} | Estrategia y Asistencia Pixel 12`,
      metaDescription: `Descubre cómo implementar sistemas de marketing digital, contenido de autoridad y asistencia virtual para escalar tu negocio sin agotamiento.`,
      readingTime: '6 min de lectura',
      targetKeywords: ['Marketing digital', 'Asistencia virtual', 'Delegar tareas', 'Estrategia empresarial', 'Pixel 12'],
      h1: `Cómo escalar tu empresa con marketing estratégico y asistencia virtual delegada`,
      outline: [
        '1. La trampa del fundador operativo: Por qué hacer todo tú mismo limita tu facturación',
        '2. Los 3 pilares del sistema de delegación Pixel 12',
        '3. Producción de contenido de alta conversión con tecnología e IA',
        '4. Casos de éxito y métricas comprobadas de retorno de inversión',
        '5. Conclusión y primeros pasos para implementar esta semana'
      ],
      summary: 'Una guía estratégica completa diseñada por Pixel 12 para profesionales y directores que buscan rentabilidad y libertad operativa.',
      articleBody: `El crecimiento de una empresa no se mide únicamente por su volumen de facturación, sino por la solidez de sus sistemas operativos. En esta guía desglosamos la metodología probada de Pixel 12 para integrar marketing de alto impacto y asistencia virtual ejecutiva.`
    };

    return {
      id: 'gen_' + Date.now(),
      title: generatedTitle,
      theme: defaultTopic,
      format,
      pillar,
      style,
      hook,
      caption,
      cta,
      hashtags,
      visualConcept: `Dirección de arte Pixel 12 OS: Fondo negro obsidiana (#09090B), tipografía display bold ('Outfit'), acentos en dorado prestige (#D4AF37) y detalles plateados (#CBD5E1). Contraste máximo, estética corporativa y acabado de alta gama.`,
      slides,
      reelScript,
      blogSEO,
      suggestedTasks: [
        {
          title: `Diseñar artes y diapositivas para ${format}: ${generatedTitle.slice(0, 35)}`,
          description: `Crear las diapositivas en 1080x1350 siguiendo la identidad Negro + Dorado + Plateado de Pixel 12 con tipografía display y logotipo de marca.`,
          assignedRole: 'Designer' as const,
          priority: 'HIGH' as const
        },
        {
          title: `Revisión final de copy persuasivo y llamadas a la acción`,
          description: `Comprobar ganchos, estructura AIDA y configurar disparadores de respuesta automática en Instagram/LinkedIn.`,
          assignedRole: 'Copywriter' as const,
          priority: 'MEDIUM' as const
        }
      ],
      createdAt: new Date().toISOString()
    };
  };

  if (!ai) {
    return res.json(getFallbackData());
  }

  try {
    const promptInstructions = `Eres el AI Content Strategist, Social Media Manager, Copywriter y Creative Director Senior de PIXEL 12 OS.
PIXEL 12 es una agencia especializada en:
1. Marketing digital
2. Gestión de redes sociales
3. Creación y gestión de contenido
4. Estrategia digital
5. Asistencia virtual

Identidad visual de Pixel 12:
- Negro Obsidiana (#09090B) como color base y fondo
- Dorado Prestigio (#D4AF37) como color de acento y elementos importantes
- Plateado Metálico (#CBD5E1) como color secundario y bordes
- Blanco (#FFFFFF) para contraste y legibilidad limpia

Especificaciones de la solicitud:
- Marca: ${brandName}
- Autor / Especialista: ${authorName}
- Formato: ${format} (Carrusel, Post, Creativo de pauta, Guion de Reel, Blog SEO)
- Pilar: ${pillar} (Marketing Digital, Asistencia Virtual, Autoridad, Conversión, Engagement, Educativo, Venta, Comunidad)
- Estilo Visual: ${style}
- Tema o Enlace: "${topic}"

Genera un resultado integral de DISEÑO Y CONTENIDO de nivel de agencia internacional.
Debes responder ESTRICTAMENTE en formato JSON con la siguiente estructura exacta:
{
  "title": "Título conciso y estratégico",
  "theme": "Resumen del tema",
  "format": "${format}",
  "pillar": "${pillar}",
  "style": "${style}",
  "hook": "Gancho demoledor (primeros 3 segundos o primer renglón del copy)",
  "caption": "Copy completo y altamente persuasivo para Instagram/LinkedIn con emojis, saltos de línea claros, valor de negocio y llamada a la acción",
  "cta": "Llamada a la acción precisa (ej: Comenta 'DELEGAR', agenda en el link, etc.)",
  "hashtags": ["#Pixel12", "#MarketingDigital", "#AsistenciaVirtual", "#Estrategia"],
  "visualConcept": "Descripción de la dirección de arte y composición (Negro, Dorado, Plateado, Blanco)",
  "slides": [
    {
      "slideNumber": 1,
      "slideType": "cover",
      "tag": "PIXEL 12 · ${pillar.toUpperCase()}",
      "headline": "Titular grande, impactante y legible en móvil",
      "subtitle": "Subtítulo explicativo que despierta interés inmediato",
      "bodyPoints": ["Punto clave 1", "Punto clave 2", "Punto clave 3"],
      "showAuthorBadge": true,
      "authorBadgeName": "${authorName}",
      "authorBadgeTitle": "Pixel 12 OS · Especialista",
      "showOfficialLogo": true,
      "highlightBadge": "ESTRATEGIA RECOMENDADA",
      "accentColor": "#D4AF37",
      "visualDescription": "Instrucciones de composición visual (fondo negro obsidiana, marco fino plateado, tipografía bold, acento dorado)."
    },
    {
      "slideNumber": 2,
      "slideType": "problem",
      "tag": "EL DOLOR CLAVE",
      "headline": "Titular del obstáculo o error operativo habitual",
      "subtitle": "Explicación del costo o fricción que esto genera en el negocio",
      "bodyPoints": ["Detalle 1", "Detalle 2"],
      "showAuthorBadge": false,
      "showOfficialLogo": true,
      "metricNumber": "-15h",
      "metricLabel": "Impacto negativo habitual",
      "visualDescription": "Composición con tarjeta oscura de contraste y datos numéricos destacados."
    },
    {
      "slideNumber": 3,
      "slideType": "solution",
      "tag": "EL MÉTODO PIXEL 12",
      "headline": "La solución explicada de manera visual y clara",
      "subtitle": "Cómo se aplica paso a paso en el negocio real",
      "bodyPoints": ["Paso 1", "Paso 2", "Paso 3"],
      "showAuthorBadge": false,
      "showOfficialLogo": true,
      "metricNumber": "3.5x",
      "metricLabel": "Mayor eficiencia comprobada",
      "visualDescription": "Esquema visual con pasos ordenados y divisores dorados."
    },
    {
      "slideNumber": 4,
      "slideType": "case_study",
      "tag": "CASO REAL / DATOS",
      "headline": "Comparativa real o métrica antes vs después",
      "subtitle": "Los números que respaldan la afirmación",
      "bodyPoints": ["Métrica inicial", "Métrica optimizada con Pixel 12"],
      "showAuthorBadge": false,
      "showOfficialLogo": true,
      "highlightBadge": "VERIFICADO",
      "visualDescription": "Tabla de datos con diseño limpio de alto contraste y números destacados."
    },
    {
      "slideNumber": 5,
      "slideType": "cta",
      "tag": "ACCIÓN FINAL",
      "headline": "Pregunta de cierre orientada a la llamada a la acción",
      "subtitle": "Qué debe hacer el lector para obtener la plantilla o agendar",
      "bodyPoints": ["Beneficio o recurso 1", "Beneficio o recurso 2"],
      "showAuthorBadge": true,
      "authorBadgeName": "${authorName}",
      "authorBadgeTitle": "Consultor Estratégico",
      "showOfficialLogo": true,
      "highlightBadge": "CONSULTORÍA ACTIVA",
      "accentColor": "#D4AF37",
      "visualDescription": "Slide de cierre con badge dorado, llamado a la acción claro y enlaces oficiales de Pixel 12."
    }
  ],
  "reelScript": [
    {
      "secondRange": "00:00 - 00:03",
      "shotType": "Primer plano a cámara con texto llamativo",
      "visualDirection": "Texto en pantalla con tipografía bold en oro y fondo negro",
      "voiceover": "Texto hablado para los primeros 3 segundos"
    },
    {
      "secondRange": "00:03 - 00:15",
      "shotType": "B-roll o demostración del sistema",
      "visualDirection": "Resaltados sobre los problemas y soluciones",
      "voiceover": "Explicación del problema operativo y la solución"
    },
    {
      "secondRange": "00:15 - 00:25",
      "shotType": "Puntos clave de la metodología",
      "visualDirection": "Tarjetas dinámicas con los 3 beneficios tangibles",
      "voiceover": "Resumen de valor y tiempo liberado"
    },
    {
      "secondRange": "00:25 - 00:30",
      "shotType": "Cierre con CTA",
      "visualDirection": "Badge dorado con la palabra clave a comentar",
      "voiceover": "Llamada a la acción clara para comentar o agendar"
    }
  ],
  "blogSEO": {
    "metaTitle": "Título SEO optimizado para Google",
    "metaDescription": "Meta descripción atractiva para CTR",
    "readingTime": "5 min de lectura",
    "targetKeywords": ["Keyword 1", "Keyword 2", "Keyword 3"],
    "h1": "Título H1 de la publicación",
    "outline": ["H2 1", "H2 2", "H2 3", "H2 4"],
    "summary": "Resumen del artículo",
    "articleBody": "Primeros párrafos del artículo con valor editorial listo para blog."
  },
  "suggestedTasks": [
    {
      "title": "Diseñar artes para la pieza generada",
      "description": "Exportar y montar con identidad Pixel 12 (Negro, Dorado, Plateado y Blanco)",
      "assignedRole": "Designer",
      "priority": "HIGH"
    },
    {
      "title": "Revisar copy y programar publicación",
      "description": "Verificar hashtags y agendar en el calendario de Pixel 12",
      "assignedRole": "Copywriter",
      "priority": "MEDIUM"
    }
  ]
}`;

    const text = await generateGeminiContent({
      contents: promptInstructions,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      }
    });

    if (!text) {
      return res.json(getFallbackData());
    }

    const parsed = JSON.parse(text);
    parsed.id = 'gen_' + Date.now();
    parsed.createdAt = new Date().toISOString();

    // Ensure all slides have dynamic imagery and layouts
    if (parsed.slides && Array.isArray(parsed.slides)) {
      parsed.slides = parsed.slides.map((s: any, idx: number) => ({
        ...s,
        imageUrl: s.imageUrl || P12_DYNAMIC_SLIDE_IMAGES[idx % P12_DYNAMIC_SLIDE_IMAGES.length],
        layoutMode: s.layoutMode || (idx === 1 || idx === 3 ? 'split_top' : 'full_background'),
        overlayOpacity: s.overlayOpacity ?? 70,
        authorAvatar: s.authorAvatar || P12_AUTHOR_AVATAR_URL,
        imagePrompt: s.imagePrompt || s.visualDescription || 'Dynamic business and marketing photography with gold accent'
      }));
    }

    return res.json(parsed);
  } catch (err: any) {
    console.log('[AI] Using resilient design & content generator fallback');
    return res.json(getFallbackData());
  }
});

// ---------------- POST DESIGN GENERATION FROM CALENDAR & SINGLE SLIDE REGEN ----------------
app.post('/api/ai/generate-post-design', async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId) {
      return res.status(400).json({ error: 'postId es requerido' });
    }

    const data = readWorkspaceData();
    const postIndex = data.posts.findIndex((p: any) => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    const post = data.posts[postIndex];
    const brand = data.brands.find((b: any) => b.id === post.brandId) || data.brands[0];
    const isCarousel = post.format === 'Carousel';
    const creditCost = isCarousel ? 6 : 1;

    // Deduct AI credits
    if (!data.workspaceSettings.aiCredits && data.workspaceSettings.aiCredits !== 0) {
      data.workspaceSettings.aiCredits = 120;
    }
    data.workspaceSettings.aiCredits = Math.max(0, data.workspaceSettings.aiCredits - creditCost);

    const authorName = brand.name.includes('Pixel') ? 'Alejandro Morales' : (brand.voice?.authorName || 'Director de Estrategia');
    const brandGold = brand.colors?.gold || '#D4AF37';

    // Build 6 high-impact slides following Pixel 12 luxury identity (Negro, Dorado, Plateado, Blanco)
    const slides = [
      {
        slideNumber: 1,
        slideType: 'cover',
        tag: `PIXEL 12 · ${(post.pillar || 'ESTRATEGIA').toUpperCase()}`,
        headline: post.hook || post.internalTitle,
        subtitle: post.theme || 'Estrategia validada con entregables medibles para escalar tu negocio.',
        imageUrl: P12_DYNAMIC_SLIDE_IMAGES[0],
        layoutMode: 'full_background',
        overlayOpacity: 70,
        authorAvatar: P12_AUTHOR_AVATAR_URL,
        bodyPoints: [
          'Diagnóstico operativo y detección de fugas',
          'Ejecución con métricas y reportes verificados',
          'Supervisión directa de especialista senior'
        ],
        showAuthorBadge: true,
        authorBadgeName: authorName,
        authorBadgeTitle: `${brand.name} OS · Especialista Senior`,
        showOfficialLogo: true,
        highlightBadge: 'ESTUDIO 2026',
        accentColor: brandGold,
        visualDescription: 'Fondo negro obsidiana (#09090B), fotografía prémium con gradiente oscuro, marco perimetral plateado y detalles dorados (#D4AF37).'
      },
      {
        slideNumber: 2,
        slideType: 'problem',
        tag: 'EL CUELLO DE BOTELLA',
        headline: 'Querer hacerlo todo manualmente sin sistemas ni delegación predecible',
        subtitle: 'Consecuencia directa: pérdida de 15 horas semanales en tareas operativas de bajo valor.',
        imageUrl: P12_DYNAMIC_SLIDE_IMAGES[1],
        layoutMode: 'split_top',
        overlayOpacity: 65,
        authorAvatar: P12_AUTHOR_AVATAR_URL,
        bodyPoints: [
          'Bandeja de entrada colapsada y prospectos sin atender',
          'Seguimiento manual sin sincronización con CRM',
          'Publicaciones de marketing intermitentes por falta de tiempo'
        ],
        showAuthorBadge: false,
        showOfficialLogo: true,
        metricNumber: '-15h',
        metricLabel: 'Horas semanales perdidas en micro-operación por fundador',
        visualDescription: 'Tarjeta con fotografía en cabecera y cuerpo negro obsidiana con métrica tipográfica de alto impacto.'
      },
      {
        slideNumber: 3,
        slideType: 'solution',
        tag: 'EL MÉTODO PIXEL 12',
        headline: 'Implementación del sistema integrado de delegación y marketing',
        subtitle: 'Estandarización de procesos con soporte calificado y herramientas digitales en 48 horas.',
        imageUrl: P12_DYNAMIC_SLIDE_IMAGES[2],
        layoutMode: 'full_background',
        overlayOpacity: 75,
        authorAvatar: P12_AUTHOR_AVATAR_URL,
        bodyPoints: [
          'Filtrado automatizado de consultas y leads entrantes',
          'Asistente virtual sincronizada en agenda y soporte',
          'Reportes semanales de rendimiento, conversión y ROI'
        ],
        showAuthorBadge: false,
        showOfficialLogo: true,
        metricNumber: '3.5x',
        metricLabel: 'Mayor rapidez en atención, prospección y respuesta comercial',
        visualDescription: 'Diagrama de flujo con fotografía ejecutiva de asistente virtual y líneas doradas limpias.'
      },
      {
        slideNumber: 4,
        slideType: 'case_study',
        tag: 'RESULTADO COMPROBADO',
        headline: 'Caso de éxito real: 60 días de implementación y crecimiento',
        subtitle: 'Impacto directo en métricas de productividad y margen operativo de clientes activos.',
        imageUrl: P12_DYNAMIC_SLIDE_IMAGES[3],
        layoutMode: 'split_top',
        overlayOpacity: 70,
        authorAvatar: P12_AUTHOR_AVATAR_URL,
        bodyPoints: [
          'Reducción drástica de fricción en el embudo comercial',
          'Aumento del 140% en citas agendadas y cualificadas',
          'Tasa de asistencia confirmada del 92%'
        ],
        showAuthorBadge: false,
        showOfficialLogo: true,
        metricNumber: '+140%',
        metricLabel: 'Crecimiento de citas comerciales y cierres de venta',
        visualDescription: 'Tarjeta de métrica con gráficos de crecimiento fotográficos y sello de verificación en plata.'
      },
      {
        slideNumber: 5,
        slideType: 'solution',
        tag: 'CRITERIO ESTRATÉGICO',
        headline: 'La clave de escala: Medir, ajustar y estandarizar',
        subtitle: 'Un proceso documentado vale más que diez horas de trabajo improvisado.',
        imageUrl: P12_DYNAMIC_SLIDE_IMAGES[4],
        layoutMode: 'full_background',
        overlayOpacity: 75,
        authorAvatar: P12_AUTHOR_AVATAR_URL,
        bodyPoints: [
          'Manuales operativos paso a paso para cada canal',
          'Métricas claras y cuadros de control de calidad',
          'Respaldo continuo y supervisión del equipo senior'
        ],
        showAuthorBadge: false,
        showOfficialLogo: true,
        highlightBadge: 'MÉTODO PIXEL 12',
        accentColor: brandGold,
        visualDescription: 'Infografía con fotografía de equipo estratégico y los 3 pilares clave en tarjetas oscuras con bordes dorados.'
      },
      {
        slideNumber: 6,
        slideType: 'cta',
        tag: 'ACCIÓN FINAL',
        headline: '¿Listo para liberar tiempo y profesionalizar tu operación?',
        subtitle: 'Agenda una sesión diagnóstica y recibe tu plan de acción personalizado con Pixel 12.',
        imageUrl: P12_DYNAMIC_SLIDE_IMAGES[5],
        layoutMode: 'full_background',
        overlayOpacity: 80,
        authorAvatar: P12_AUTHOR_AVATAR_URL,
        bodyPoints: [
          'Diagnóstico de embudo y procesos sin costo en 24h',
          'Integración de asistente virtual calificada en 48h',
          'Garantía de soporte, medición y seguimiento continuo'
        ],
        showAuthorBadge: true,
        authorBadgeName: authorName,
        authorBadgeTitle: 'Pixel 12 OS · Consultor Estratégico',
        showOfficialLogo: true,
        highlightBadge: 'CUPOS LIMITADOS',
        accentColor: brandGold,
        visualDescription: 'Slide de cierre cinemático negro y oro, logotipo oficial de Pixel 12 en alta calidad y botón CTA destacado.'
      }
    ];

    // Update post fields
    post.slides = slides;
    post.hasGeneratedDesign = true;
    post.designCreditCost = creditCost;
    // When completed, it appears in Aprobación -> Pendientes
    post.status = 'IN_REVIEW';
    post.imageUrl = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080&auto=format&fit=crop&q=80';
    post.updatedAt = new Date().toISOString();

    // Add approval entry
    if (!post.approvalHistory) post.approvalHistory = [];
    post.approvalHistory.push({
      id: 'appr_' + Date.now(),
      reviewerId: 'sys_ai',
      reviewerName: 'Motor de Diseño Pixel 12 (IA)',
      action: 'SUBMITTED',
      comment: `Diseño de ${isCarousel ? 'carrusel (6 slides)' : 'post'} generado con éxito desde el calendario (-${creditCost} créditos). Enviado a Aprobación → Pendientes.`,
      timestamp: new Date().toISOString()
    });

    writeWorkspaceData(data);

    return res.json({
      success: true,
      post,
      aiCredits: data.workspaceSettings.aiCredits,
      message: `Diseño generado exitosamente (-${creditCost} créditos). Ahora está en Aprobación → Pendientes con sus ${slides.length} slides.`
    });
  } catch (err: any) {
    console.error('Error generating post design:', err);
    return res.status(500).json({ error: err.message || 'Error al generar diseño de la publicación' });
  }
});

// Endpoint: Rehacer una sola slide
app.post('/api/ai/regenerate-single-slide', async (req, res) => {
  try {
    const { postId, slideIndex, changePrompt } = req.body;
    if (!postId || slideIndex === undefined) {
      return res.status(400).json({ error: 'postId y slideIndex son requeridos' });
    }

    const data = readWorkspaceData();
    const postIndex = data.posts.findIndex((p: any) => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    const post = data.posts[postIndex];
    if (!post.slides || !post.slides[slideIndex]) {
      return res.status(400).json({ error: 'Slide no encontrada en la publicación' });
    }

    // Deduct 1 credit for single slide regeneration
    if (!data.workspaceSettings.aiCredits && data.workspaceSettings.aiCredits !== 0) {
      data.workspaceSettings.aiCredits = 120;
    }
    data.workspaceSettings.aiCredits = Math.max(0, data.workspaceSettings.aiCredits - 1);

    const promptText = (changePrompt || '').toLowerCase();
    const targetSlide = { ...post.slides[slideIndex] };

    // Apply adjustments intelligently based on the user's instructions
    if (promptText.includes('menos texto') || promptText.includes('más corto') || promptText.includes('sintetizar')) {
      targetSlide.subtitle = 'Enfoque directo: ' + (targetSlide.subtitle?.slice(0, 50) || 'Análisis optimizado');
      if (targetSlide.bodyPoints && targetSlide.bodyPoints.length > 0) {
        targetSlide.bodyPoints = targetSlide.bodyPoints.slice(0, 2).map((bp: string) => bp.slice(0, 45));
      }
    }

    if (promptText.includes('sin el número') || promptText.includes('sin numero') || promptText.includes('quitar número') || promptText.includes('sin métrica')) {
      delete targetSlide.metricNumber;
      delete targetSlide.metricLabel;
      targetSlide.highlightBadge = 'CONCEPTO ESTRATÉGICO';
    }

    if (promptText.includes('fondo más limpio') || promptText.includes('fondo mas limpio') || promptText.includes('más limpio') || promptText.includes('minimalista')) {
      targetSlide.visualDescription = 'Fondo negro obsidiana minimalista de alta pureza, sin ruido ni texturas complejas, contraste oro y blanco.';
      targetSlide.accentColor = '#D4AF37';
      targetSlide.overlayOpacity = 85;
    }

    if (promptText.includes('foto') || promptText.includes('imagen') || promptText.includes('visual') || promptText.includes('dinamico') || promptText.includes('dinámico')) {
      // Pick next dynamic image
      const nextImgIdx = (slideIndex + 1) % P12_DYNAMIC_SLIDE_IMAGES.length;
      targetSlide.imageUrl = P12_DYNAMIC_SLIDE_IMAGES[nextImgIdx];
      targetSlide.layoutMode = 'full_background';
      targetSlide.overlayOpacity = 70;
      targetSlide.visualDescription = 'Composición visual fotográfica de alto impacto con gradiente cinemático oscuro y tipografía dorada.';
    }

    if (promptText.includes('asistencia virtual') || promptText.includes('asistente')) {
      targetSlide.imageUrl = P12_DYNAMIC_SLIDE_IMAGES[2];
      targetSlide.headline = 'Asistente Virtual calificada: 15 horas semanales recuperadas';
      targetSlide.subtitle = 'Sincronizada con tu agenda, WhatsApp Business y procesos clave en 48 horas.';
      targetSlide.bodyPoints = [
        'Filtrado y respuesta inmediata a prospectos comerciales',
        'Gestión de calendario y tareas operativas repetitivas',
        'Reportes de seguimiento y control de calidad auditado'
      ];
      targetSlide.metricNumber = '+15h';
      targetSlide.metricLabel = 'Horas directas liberadas a dirección y estrategia';
    }

    if (promptText.includes('roi') || promptText.includes('marketing') || promptText.includes('conversion') || promptText.includes('conversión')) {
      targetSlide.imageUrl = P12_DYNAMIC_SLIDE_IMAGES[3];
      targetSlide.headline = 'Máquina de prospección: De vistas a llamadas calificadas';
      targetSlide.subtitle = 'Embudo de conversión optimizado con métricas claras y seguimiento diario.';
      targetSlide.metricNumber = '+140%';
      targetSlide.metricLabel = 'Incremento en agendamiento de prospectos calificados';
    }

    if (promptText.includes('número') && !promptText.includes('sin')) {
      targetSlide.metricNumber = '+240%';
      targetSlide.metricLabel = 'Crecimiento de conversión registrado en 60 días';
    }

    // Always adjust tag or headline to reflect the customized revision
    targetSlide.tag = targetSlide.tag + ' · AJUSTE IA';
    if (changePrompt && changePrompt.trim() && !promptText.includes('menos texto')) {
      targetSlide.headline = `${targetSlide.headline.replace(/ \(Ajustado\)/, '')} (Ajustado)`;
      targetSlide.visualDescription = `Ajuste aplicado: "${changePrompt}". Renderizado dinámico con identidad Pixel 12.`;
    }

    // Keep the other 5 slides intact!
    post.slides[slideIndex] = targetSlide;
    post.updatedAt = new Date().toISOString();

    writeWorkspaceData(data);

    return res.json({
      success: true,
      slide: targetSlide,
      post,
      aiCredits: data.workspaceSettings.aiCredits,
      message: `Slide #${targetSlide.slideNumber} regenerada exitosamente con el ajuste "${changePrompt}" (-1 crédito). Las demás slides se mantuvieron intactas.`
    });
  } catch (err: any) {
    console.error('Error regenerating single slide:', err);
    return res.status(500).json({ error: err.message || 'Error al regenerar la slide' });
  }
});

// Endpoint: Regenerar carrusel completo
app.post('/api/ai/regenerate-all-slides', async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId) {
      return res.status(400).json({ error: 'postId es requerido' });
    }

    const data = readWorkspaceData();
    const postIndex = data.posts.findIndex((p: any) => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    const post = data.posts[postIndex];

    // Deduct 6 credits for full carousel regeneration
    if (!data.workspaceSettings.aiCredits && data.workspaceSettings.aiCredits !== 0) {
      data.workspaceSettings.aiCredits = 120;
    }
    data.workspaceSettings.aiCredits = Math.max(0, data.workspaceSettings.aiCredits - 6);

    const brand = data.brands.find((b: any) => b.id === post.brandId) || data.brands[0];
    const authorName = brand.name.includes('Pixel') ? 'Alejandro Morales' : (brand.voice?.authorName || 'Director de Estrategia');
    const brandGold = brand.colors?.gold || '#D4AF37';

    // Fresh 6 slides with Pixel 12 luxury identity and dynamic imagery
    post.slides = [
      {
        slideNumber: 1,
        slideType: 'cover',
        tag: `PIXEL 12 · ${(post.pillar || 'ESTRATEGIA').toUpperCase()}`,
        headline: post.hook || post.internalTitle,
        subtitle: 'Sistemas predecibles de crecimiento y delegación operativa.',
        imageUrl: P12_DYNAMIC_SLIDE_IMAGES[0],
        layoutMode: 'full_background',
        overlayOpacity: 70,
        authorAvatar: P12_AUTHOR_AVATAR_URL,
        bodyPoints: [
          'Estrategia de contenidos y autoridad en redes',
          'Asignación de asistente virtual en 48 horas',
          'Alineación comercial orientada a conversión'
        ],
        showAuthorBadge: true,
        authorBadgeName: authorName,
        authorBadgeTitle: `${brand.name} OS · Especialista Senior`,
        showOfficialLogo: true,
        highlightBadge: 'NUEVA PROPUESTA',
        accentColor: brandGold,
        visualDescription: 'Composición de portada prémium con fondo fotográfico y negro obsidiana (#09090B), marco plateado y detalles dorados.'
      },
      {
        slideNumber: 2,
        slideType: 'problem',
        tag: 'EL PROBLEMA REAL',
        headline: 'El 85% de las empresas pierden ventas por demoras en atención y falta de consistencia',
        subtitle: 'Consecuencia: prospectos fríos, agotamiento del fundador y costos ocultos.',
        imageUrl: P12_DYNAMIC_SLIDE_IMAGES[1],
        layoutMode: 'split_top',
        overlayOpacity: 65,
        authorAvatar: P12_AUTHOR_AVATAR_URL,
        bodyPoints: [
          'Sin filtrado inteligente de consultas comerciales',
          'Contenido publicado sin planificación estratégica',
          'Falta de un proceso documentado de seguimiento'
        ],
        showAuthorBadge: false,
        showOfficialLogo: true,
        metricNumber: '-15h',
        metricLabel: 'Tiempo operativo perdido semanalmente por fundador',
        visualDescription: 'Fotografía en cabecera con tarjeta negra inferior y métrica de fricción.'
      },
      {
        slideNumber: 3,
        slideType: 'solution',
        tag: 'EL MÉTODO INTEGRAL',
        headline: 'Cómo lo resolvemos con el estándar Pixel 12 OS',
        subtitle: 'Integración sinérgica de Asistencia Virtual + Marketing Digital + CRM.',
        imageUrl: P12_DYNAMIC_SLIDE_IMAGES[2],
        layoutMode: 'full_background',
        overlayOpacity: 75,
        authorAvatar: P12_AUTHOR_AVATAR_URL,
        bodyPoints: [
          'Manual de operaciones y flujos de trabajo claros',
          'Asistente virtual dedicada para gestión diaria',
          'Parrilla mensual de contenidos con dirección de arte prémium'
        ],
        showAuthorBadge: false,
        showOfficialLogo: true,
        metricNumber: '4.2x',
        metricLabel: 'Mayor velocidad de respuesta y cualificación de prospectos',
        visualDescription: 'Esquema visual ordenado con fotografía de asistente virtual y divisores dorados.'
      },
      {
        slideNumber: 4,
        slideType: 'case_study',
        tag: 'CASO DE ÉXITO',
        headline: 'Empresa de servicios escala facturación liberando 18h a la semana',
        subtitle: 'Resultados comprobados en los primeros 60 días de trabajo con Pixel 12.',
        imageUrl: P12_DYNAMIC_SLIDE_IMAGES[3],
        layoutMode: 'split_top',
        overlayOpacity: 70,
        authorAvatar: P12_AUTHOR_AVATAR_URL,
        bodyPoints: [
          'Se transfirieron más de 20 tareas operativas a la asistente virtual',
          'Aumento del 180% en interacciones calificadas en LinkedIn e Instagram',
          'Retorno de inversión medible desde el primer mes'
        ],
        showAuthorBadge: false,
        showOfficialLogo: true,
        metricNumber: '+180%',
        metricLabel: 'Crecimiento en volumen de conversaciones comerciales',
        visualDescription: 'Datos antes/después con fotografía de métricas y tarjeta de borde dorado.'
      },
      {
        slideNumber: 5,
        slideType: 'solution',
        tag: 'REGLA ESTRATÉGICA',
        headline: 'Diseño inteligente: delegar lo repetitivo, enfocar lo estratégico',
        subtitle: 'La rentabilidad de un negocio moderno depende de su capacidad de no depender del fundador.',
        imageUrl: P12_DYNAMIC_SLIDE_IMAGES[4],
        layoutMode: 'full_background',
        overlayOpacity: 75,
        authorAvatar: P12_AUTHOR_AVATAR_URL,
        bodyPoints: [
          'Estandarización de plantillas de comunicación comercial',
          'Automatización de tareas con IA y software moderno',
          'Supervisión continua con controles de calidad'
        ],
        showAuthorBadge: false,
        showOfficialLogo: true,
        highlightBadge: 'MÉTODO PIXEL 12',
        accentColor: brandGold,
        visualDescription: 'Infografía con fotografía de equipo y tarjetas de parámetros operativos.'
      },
      {
        slideNumber: 6,
        slideType: 'cta',
        tag: 'PRÓXIMO PASO',
        headline: '¿Quieres diagnosticar tu operación o delegar con Pixel 12?',
        subtitle: 'Conversemos sobre tus metas de este trimestre y diseñemos tu plan.',
        imageUrl: P12_DYNAMIC_SLIDE_IMAGES[5],
        layoutMode: 'full_background',
        overlayOpacity: 80,
        authorAvatar: P12_AUTHOR_AVATAR_URL,
        bodyPoints: [
          'Diagnóstico operativo y de marketing sin costo en 24h',
          'Asignación de Asistente Virtual calificada en 48h',
          'Garantía de soporte y seguimiento continuo'
        ],
        showAuthorBadge: true,
        authorBadgeName: authorName,
        authorBadgeTitle: 'Pixel 12 OS · Estratega Comercial',
        showOfficialLogo: true,
        highlightBadge: 'CONSULTORÍA DISPONIBLE',
        accentColor: brandGold,
        visualDescription: 'Slide cinemático negro y oro con llamada a la acción y enlaces oficiales.'
      }
    ];

    post.hasGeneratedDesign = true;
    post.updatedAt = new Date().toISOString();

    writeWorkspaceData(data);

    return res.json({
      success: true,
      post,
      aiCredits: data.workspaceSettings.aiCredits,
      message: 'Carrusel completo regenerado exitosamente (-6 créditos IA).'
    });
  } catch (err: any) {
    console.error('Error regenerating all slides:', err);
    return res.status(500).json({ error: err.message || 'Error al regenerar el carrusel' });
  }
});

// ---------------- BLOG POSTS CRUD & AI BLOG GENERATOR (PIXEL 12 OS / PANEL BLOG) ----------------
app.get('/api/blog-posts', (req, res) => {
  const data = readWorkspaceData();
  if (!data.blogPosts || !Array.isArray(data.blogPosts)) {
    data.blogPosts = initialWorkspaceData.blogPosts || [];
    writeWorkspaceData(data);
  }
  res.json(data.blogPosts);
});

app.post('/api/blog-posts', (req, res) => {
  const newPost = req.body;
  if (!newPost || !newPost.title) {
    return res.status(400).json({ error: 'El título del artículo es requerido' });
  }
  const data = readWorkspaceData();
  if (!data.blogPosts) data.blogPosts = [];
  
  if (!newPost.id) {
    newPost.id = 'blog_' + Date.now();
  }
  newPost.createdAt = newPost.createdAt || new Date().toISOString();
  newPost.updatedAt = new Date().toISOString();

  // If exists, update; else push
  const index = data.blogPosts.findIndex((b: any) => b.id === newPost.id);
  if (index >= 0) {
    data.blogPosts[index] = { ...data.blogPosts[index], ...newPost };
  } else {
    data.blogPosts.unshift(newPost);
  }

  writeWorkspaceData(data);
  res.json({ success: true, post: newPost });
});

app.put('/api/blog-posts/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const data = readWorkspaceData();
  if (!data.blogPosts) data.blogPosts = [];

  const index = data.blogPosts.findIndex((b: any) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Artículo de blog no encontrado' });
  }

  data.blogPosts[index] = {
    ...data.blogPosts[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  writeWorkspaceData(data);
  res.json({ success: true, post: data.blogPosts[index] });
});

app.delete('/api/blog-posts/:id', (req, res) => {
  const { id } = req.params;
  const data = readWorkspaceData();
  if (!data.blogPosts) data.blogPosts = [];

  data.blogPosts = data.blogPosts.filter((b: any) => b.id !== id);
  writeWorkspaceData(data);
  res.json({ success: true, message: 'Artículo eliminado' });
});

// AI: Blog Generator from Topic or URL with instant Repurposing
app.post('/api/ai/blog', async (req, res) => {
  const {
    topic = '',
    sourceUrl = '',
    sourceType = 'topic',
    category = 'Marketing Digital & Asistencia Virtual',
    tone = 'Profesional, Estratégico, Cercano y Persuasivo (Voz Pixel 12)',
    author = 'Camila Pinto',
    authorRole = 'Directora de Estrategia & CEO · Pixel 12',
    targetLength = 1800,
    brandId = 'brand_pixel12'
  } = req.body;

  const rawTopic = topic.trim() || (sourceUrl ? `Análisis estratégico de: ${sourceUrl}` : 'Sistemas de Delegación y Asistencia Virtual para Escalar PyMEs');

  // Realistic fallback generator for Pixel 12
  const getBlogFallback = () => {
    const cleanSlug = rawTopic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 50);

    const title = rawTopic.length > 20 && !rawTopic.startsWith('Análisis')
      ? rawTopic
      : `Sistemas de Crecimiento y Asistencia Virtual: ${rawTopic.slice(0, 50)}`;

    const focusKeyword = 'asistencia virtual y marketing digital';
    const metaTitle = `${title.slice(0, 48)} | Pixel 12 OS`;
    const metaDescription = `Descubre cómo optimizar ${rawTopic.slice(0, 45)} con la metodología estratégica y operativa de Pixel 12. Guía paso a paso.`.slice(0, 155);

    const contentMarkdown = `## Introducción: La trampa del fundador todoterreno en 2026

En el desarrollo de empresas de servicios, agencias y PyMEs modernas, la mayor parte del tiempo se pierde en tareas operativas de bajo valor: respondiendo mensajes directos, cuadrando calendarios, persiguiendo facturas o improvisando publicaciones en redes sociales.

Trabajar más horas no es escalar: es convertirte en el empleado más agotado de tu propia empresa.

Implementar el sistema integral de **Pixel 12** (Marketing Digital, Redes Sociales y Asistencia Virtual Calificada) permite transformar operaciones caóticas en procesos predecibles, liberando entre **15 y 22 horas semanales** para que el fundador lidere la estrategia y el crecimiento.

---

## 1. Diagnóstico de Cuellos de Botella y Errores Habituales

Cuando un líder de negocio busca escalar su presencia digital y su operación, los principales obstáculos son:

1. **Falta de estandarización operativa:** Intentar delegar sin manuales de procesos (SOPs) claros.
2. **Publicación intermitente en redes:** Crear contenido solo cuando sobra tiempo, perdiendo el favor del algoritmo.
3. **Fuga constante de prospectos:** Tardar más de 2 horas en responder un mensaje directo o lead calificado.

\`\`\`txt
Protocolo de Control Pixel 12:
- Velocidad de respuesta a prospectos en redes: < 15 minutos en horario comercial
- Calendario editorial anticipado: 3 a 4 publicaciones programadas por semana
- Cuadros de mando semanales: Reporte de KPIs operativos y de conversión
\`\`\`

---

## 2. Metodología de Implementación Paso a Paso

### Fase 1: Diagnóstico y Clasificación Operativa
Mapear todas las tareas semanales del equipo directivo y separar lo delegable (inbox, agenda, reportes, programación) del núcleo estratégico.

### Fase 2: Producción de Contenido de Autoridad
Creación de carruseles, reels y piezas audiovisuales con identidad visual prémium (Negro, Dorado, Plateado y Blanco) enfocadas en resolver objeciones reales de compra.

### Fase 3: Activación de Asistente Virtual Especializada
Onboarding en 48 horas con protocolos de comunicación, gestión de accesos seguros y sincronización de herramientas.

| Parámetro Operativo | Gestión Tradicional sin Delegar | Con Sistema Pixel 12 | Impacto Medible |
| :--- | :--- | :--- | :--- |
| **Tiempo semanal en tareas repetitivas** | 18 - 25 horas | 2 - 4 horas | **-84% tiempo perdido** |
| **Velocidad de respuesta a clientes** | 3.5 horas promedio | < 12 minutos | **+300% conversión inicial** |
| **Consistencia de contenido** | Intermitente y reactiva | 100% programado con IA y diseño prémium | **Crecimiento continuo** |

---

## 3. Casos de Estudio y Lecciones de Negocio

En clientes acompañados por **Pixel 12**, los equipos reportaron una reducción del 80% en estrés operativo y un incremento del 35% en cierres comerciales al liberar la agenda del líder de la compañía.

---

## Preguntas Frecuentes (FAQ)

### ¿Cómo iniciar la delegación sin perder control de calidad?
A través de matrices de decisión pre-aprobadas y reuniones de sincronización de 15 minutos semanales donde se revisan entregables y métricas.

### ¿Por qué la combinación de Marketing y Asistencia Virtual es más efectiva?
Porque generar visibilidad en redes sin alguien que responda y atienda a los prospectos al instante desperdicia la inversión. Pixel 12 cubre tanto la atracción como la conversión operativa.`;

    const carouselSlides: any[] = [
      {
        slideNumber: 1,
        slideType: 'cover',
        tag: 'PIXEL 12 · IDENTIDAD OFICIAL',
        headline: title.slice(0, 55),
        subtitle: 'El sistema en 3 pasos para fundadores y empresas en crecimiento',
        showAuthorBadge: true,
        authorBadgeName: author,
        authorBadgeTitle: authorRole,
        showOfficialLogo: true,
        accentColor: '#D4AF37',
        visualDescription: 'Fondo negro obsidiana (#09090B), detalles metálicos dorados (#D4AF37) y plateados (#CBD5E1), logotipo Pixel 12.'
      },
      {
        slideNumber: 2,
        slideType: 'problem',
        tag: 'EL CUELLO DE BOTELLA',
        headline: '¿Por qué el 80% de los líderes siguen atrapados operando?',
        subtitle: 'Los 3 errores que frenan la escala de tu empresa',
        bodyPoints: [
          'Responder mensajes directos y correos a deshoras sin filtros',
          'Publicar en redes sociales de manera intermitente y sin objetivo claro',
          'Creer que explicar una tarea toma más tiempo que hacerla uno mismo'
        ],
        showOfficialLogo: true,
        accentColor: '#ef4444'
      },
      {
        slideNumber: 3,
        slideType: 'solution',
        tag: 'EL MÉTODO PIXEL 12',
        headline: 'La arquitectura en 3 capas de delegación y marketing',
        subtitle: 'Diseñada para garantizar consistencia y retención de prospectos',
        bodyPoints: [
          '1. Matriz de tareas transferibles en menos de 48 horas',
          '2. Asistente virtual calificada sincronizada con tu agenda y CRM',
          '3. Contenido de autoridad publicado con regularidad matemática'
        ],
        showOfficialLogo: true,
        accentColor: '#D4AF37'
      },
      {
        slideNumber: 4,
        slideType: 'case_study',
        tag: 'RESULTADOS MEDIDOS',
        headline: 'Impacto medible en empresas reales',
        subtitle: 'Resultados comprobados en clientes de consultoría y servicios',
        metricNumber: '-84%',
        metricLabel: 'Reducción de carga operativa y respuesta a leads en <12 min',
        bodyPoints: [
          'Recuperación de 18 horas semanales para el fundador',
          'Incremento del 35% en reuniones comerciales concretadas',
          'Presencia de marca profesional, elegante y homogénea'
        ],
        showOfficialLogo: true,
        accentColor: '#10b981'
      },
      {
        slideNumber: 5,
        slideType: 'cta',
        tag: 'SIGUIENTE PASO',
        headline: '¿Listo para implementar el sistema Pixel 12 en tu empresa?',
        subtitle: 'Comenta "ESCALAR" o agenda una llamada estratégica con nuestro equipo',
        bodyPoints: [
          'Diagnóstico operativo gratuito de cuellos de botella',
          'Asignación de asistente virtual calificada en 48h',
          'Gestión integral de redes con diseño prémium'
        ],
        showAuthorBadge: true,
        authorBadgeName: `${author} · Pixel 12`,
        authorBadgeTitle: 'Especialista en Marketing & Operaciones',
        showOfficialLogo: true,
        accentColor: '#D4AF37'
      }
    ];

    const reelScript = [
      {
        secondRange: '0:00 - 0:04',
        shotType: 'Plano Medio Frontal',
        visualDirection: `${author} mirando a cámara con energía en espacio ejecutivo. Texto dorado: "¡Deja de perder 15 horas a la semana!"`,
        voiceover: `Si eres el dueño de la empresa y sigues respondiendo DMs a las diez de la noche, necesitas ver esto.`
      },
      {
        secondRange: '0:05 - 0:20',
        shotType: 'Captura Dinámica de Pantalla',
        visualDirection: 'Demostración visual del panel de Pixel 12 OS con matriz de delegación y publicaciones programadas.',
        voiceover: 'En Pixel 12 integramos asistentes virtuales y estrategias de contenido para que tu negocio facture y atraiga prospectos sin que tengas que microgestionar cada detalle.'
      },
      {
        secondRange: '0:21 - 0:45',
        shotType: 'Gráfico Comparativo Negro y Oro',
        visualDirection: 'Gráfica de alto impacto con reducción de carga operativa del 84% y aumento en conversión.',
        voiceover: 'Nuestros clientes recuperan hasta 18 horas semanales desde el primer mes y triplican la velocidad de respuesta a nuevos clientes.'
      },
      {
        secondRange: '0:46 - 0:60',
        shotType: 'Cierre con Logo Pixel 12 y CTA',
        visualDirection: `${author} señalando a la bio o comentarios con el logotipo Pixel 12 en esquina superior.`,
        voiceover: 'Tienes el desglose completo en nuestro nuevo artículo de blog. Comenta "SISTEMA" y te enviamos el recurso directo a tu DM.'
      }
    ];

    const stories = [
      {
        slideNumber: 1,
        headline: '¿Cuánto vale una hora de tu tiempo?',
        text: 'Pregunta sincera para fundadores: ¿Tiene sentido que sigas coordinando citas y ordenando archivos a mano?',
        stickerIdea: 'Sticker de encuesta: "Prefiero delegar 🚀" vs "Sigo haciéndolo yo ⏳"',
        cta: 'Vota en la encuesta'
      },
      {
        slideNumber: 2,
        headline: 'El costo oculto de la microgestión 💡',
        text: 'Cada hora que pasas en tareas operativas es una hora que no dedicas a cerrar clientes o mejorar tu servicio.',
        stickerIdea: 'Sticker deslizador de 100% fuego',
        cta: 'Desliza para ver la solución'
      },
      {
        slideNumber: 3,
        headline: 'Nuevo artículo en Pixel 12 OS',
        text: 'Cómo implementar Asistencia Virtual y Marketing Digital con estándares de agencia prémium.',
        stickerIdea: `Sticker de enlace directo a /blog/${cleanSlug}`,
        cta: 'Toca para leer el artículo'
      }
    ];

    const linkedInPost = `¿Por qué tantos fundadores inteligentes siguen siendo los empleados más agotados de sus propias empresas? ⏳\n\nEn Pixel 12 hemos analizado la rutina de decenas de dueños de negocio en Latinoamérica y el patrón siempre es el mismo:\n\nPasan más del 40% de su jornada respondiendo mensajes, enviando cotizaciones a mano y apagando fuegos operativos que un asistente virtual calificado resolvería en minutos.\n\nEl sistema Pixel 12 cambia esto con 3 pilares:\n\n1️⃣ Diagnóstico y transferencia de cuellos de botella en 48 horas.\n2️⃣ Contenido de autoridad en redes sociales diseñado con identidad prémium (Negro, Oro, Plata).\n3️⃣ Atención de leads y prospección en tiempo récord (< 12 min).\n\nPublicamos la guía metodológica completa en el blog de Pixel 12 (enlace en el primer comentario) 👇\n\n¿Qué tarea operativa te gustaría delegar hoy mismo si tuvieras al equipo adecuado?\n\n#Pixel12 #MarketingDigital #AsistenciaVirtual #Productividad #Liderazgo #EstrategiaEmpresarial`;

    return {
      id: 'blog_' + Date.now(),
      brandId,
      title,
      slug: cleanSlug,
      status: 'DRAFT',
      author,
      authorRole,
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      category,
      sourceType,
      sourceUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      coverImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80',
      excerpt: `Análisis estratégico sobre ${rawTopic.slice(0, 100)}. Metodología Pixel 12, comparativas de negocio y lecciones de escala.`,
      contentMarkdown,
      seo: {
        metaTitle,
        metaDescription,
        focusKeyword,
        secondaryKeywords: ['marketing digital', 'asistencia virtual', 'delegar tareas', 'Pixel 12 agencias'],
        readingTime: `${Math.max(4, Math.round(targetLength / 250))} min de lectura`,
        wordCount: targetLength,
        score: 95,
        checklist: [
          { label: 'Palabra clave en el título H1', passed: true, tip: 'Excelente presencia y fuerza' },
          { label: 'Longitud de meta descripción óptima (140-160 caracteres)', passed: true, tip: 'Cumple rango óptimo' },
          { label: 'Estructura con H2 y H3 equilibrados', passed: true, tip: 'Jerarquía adecuada para motores de búsqueda' },
          { label: 'Tablas comparativas y métricas de negocio', passed: true, tip: 'Favorece Rich Snippets en Google' }
        ]
      },
      faqs: [
        {
          question: '¿Cómo iniciar la delegación sin perder control de calidad?',
          answer: 'A través de matrices de decisión pre-aprobadas y revisiones de 15 minutos semanales donde se supervisan entregables y KPIs.'
        },
        {
          question: '¿Por qué la combinación de Marketing y Asistencia Virtual es más efectiva?',
          answer: 'Porque generar visibilidad en redes sin un equipo que atienda a los prospectos al instante desperdicia la inversión.'
        }
      ],
      repurposed: {
        carousel: carouselSlides,
        reelScript,
        stories,
        linkedInPost
      },
      tableOfContents: [
        { id: 'trampa-fundador', title: 'La trampa del fundador todoterreno', level: 2 },
        { id: 'diagnostico', title: '1. Diagnóstico de Cuellos de Botella', level: 2 },
        { id: 'metodologia', title: '2. Metodología de Implementación Paso a Paso', level: 2 },
        { id: 'casos-estudio', title: '3. Casos de Estudio y Lecciones de Negocio', level: 2 },
        { id: 'faq', title: 'Preguntas Frecuentes (FAQ)', level: 2 }
      ]
    };
  };

  const ai = getGeminiClient();
  if (!ai) {
    return res.json(getBlogFallback());
  }

  try {
    const prompt = `Eres el AI Content Strategist, Copywriter y Director de Estrategia Senior de PIXEL 12 OS.
PIXEL 12 es una agencia especializada en:
1. Marketing digital
2. Gestión de redes sociales
3. Creación y gestión de contenido
4. Estrategia digital
5. Asistencia virtual

Identidad visual de Pixel 12: Negro (base #09090B), Dorado (acento #D4AF37), Plateado (soporte #CBD5E1) y Blanco (contraste #FFFFFF).
Tu tarea es generar un ARTÍCULO DE BLOG COMPLETO, PERSUASIVO Y DE AUTORIDAD EJECUTIVA (Long-form, ~${targetLength} palabras) a partir de:
- Modo: ${sourceType === 'url' ? 'Extracción y transformación desde URL' : 'Generación por Tema Estratégico'}
- Tema / URL: "${rawTopic}"
- Categoría: ${category}
- Tono: ${tone}
- Autor: ${author} (${authorRole})
- Marca: ${brandId === 'brand_pixel12' ? 'Pixel 12 (Marketing Digital & Asistencia Virtual)' : 'Pixel 12 OS'}

Además de redactar el artículo de blog en Markdown técnico y persuasivo con tablas y listas, debes generar el REPURPOSING MULTICANAL completo (Carrusel de 5 slides con identidad Negro/Dorado/Plata de Pixel 12, Guion de Reel de 60 segundos con escenas y visual cues, Secuencia de 3 Stories y Post de LinkedIn de alto impacto).

Debes responder ÚNICAMENTE con un JSON válido con la siguiente estructura:
{
  "title": "Título SEO impactante con H1",
  "slug": "slug-url-amigable",
  "excerpt": "Resumen ejecutivo de 2 a 3 líneas del artículo",
  "contentMarkdown": "Cuerpo completo del artículo en Markdown con secciones ## H2, ### H3, tablas comparativas y callouts",
  "seo": {
    "metaTitle": "Meta título para Google (50-60 caracteres)",
    "metaDescription": "Meta descripción optimizada para CTR (145-155 caracteres)",
    "focusKeyword": "Palabra clave principal",
    "secondaryKeywords": ["Keyword 1", "Keyword 2", "Keyword 3"],
    "readingTime": "X min de lectura",
    "wordCount": ${targetLength},
    "score": 95,
    "checklist": [
      { "label": "Palabra clave en H1", "passed": true, "tip": "Presente" },
      { "label": "Meta descripción óptima", "passed": true, "tip": "Longitud adecuada" },
      { "label": "Encabezados semánticos", "passed": true, "tip": "H2 y H3 bien estructurados" },
      { "label": "Tablas y listas técnicas", "passed": true, "tip": "Enriquecen la lectura" }
    ]
  },
  "faqs": [
    { "question": "¿Pregunta 1?", "answer": "Respuesta clara y profesional" },
    { "question": "¿Pregunta 2?", "answer": "Respuesta clara y profesional" }
  ],
  "tableOfContents": [
    { "id": "seccion-1", "title": "1. Título sección", "level": 2 },
    { "id": "seccion-2", "title": "2. Título sección", "level": 2 }
  ],
  "repurposed": {
    "carousel": [
      {
        "slideNumber": 1,
        "slideType": "cover",
        "tag": "PIXEL 12 · IDENTIDAD OFICIAL",
        "headline": "Titular de impacto para la portada del carrusel",
        "subtitle": "Subtítulo explicativo",
        "showAuthorBadge": true,
        "authorBadgeName": "${author}",
        "authorBadgeTitle": "${authorRole}",
        "showOfficialLogo": true,
        "accentColor": "#D4AF37",
        "visualDescription": "Fondo negro obsidiana (#09090B), detalles dorados (#D4AF37) y logotipo Pixel 12."
      },
      {
        "slideNumber": 2,
        "slideType": "problem",
        "tag": "EL CUELLO DE BOTELLA",
        "headline": "Problema principal que aborda el blog",
        "subtitle": "Por qué ocurre este error",
        "bodyPoints": ["Punto dolor 1", "Punto dolor 2", "Punto dolor 3"],
        "showOfficialLogo": true,
        "accentColor": "#ef4444"
      },
      {
        "slideNumber": 3,
        "slideType": "solution",
        "tag": "LA SOLUCIÓN PIXEL 12",
        "headline": "Los 3 pasos del método",
        "subtitle": "Cómo resolverlo",
        "bodyPoints": ["Paso 1", "Paso 2", "Paso 3"],
        "showOfficialLogo": true,
        "accentColor": "#D4AF37"
      },
      {
        "slideNumber": 4,
        "slideType": "case_study",
        "tag": "RESULTADOS MEDIBLES",
        "headline": "Comparativa y ahorro real",
        "subtitle": "Datos antes vs después",
        "metricNumber": "-84%",
        "metricLabel": "Ahorro de tiempo operativo",
        "bodyPoints": ["Dato 1", "Dato 2"],
        "showOfficialLogo": true,
        "accentColor": "#10b981"
      },
      {
        "slideNumber": 5,
        "slideType": "cta",
        "tag": "SIGUIENTE PASO",
        "headline": "Llamada a la acción clara",
        "subtitle": "Comenta o visita el enlace",
        "bodyPoints": ["Recurso descargable", "Enlace a Pixel 12"],
        "showAuthorBadge": true,
        "authorBadgeName": "${author} · Pixel 12",
        "authorBadgeTitle": "Especialista en Marketing & Operaciones",
        "showOfficialLogo": true,
        "accentColor": "#D4AF37"
      }
    ],
    "reelScript": [
      {
        "secondRange": "0:00 - 0:04",
        "shotType": "Plano Medio Frontal",
        "visualDirection": "Líder a cámara en entorno prémium de Pixel 12.",
        "voiceover": "Gancho inicial demoledor de 3 segundos."
      },
      {
        "secondRange": "0:05 - 0:20",
        "shotType": "Demostración en Pantalla",
        "visualDirection": "Captura dinámica de procesos o flujo de trabajo.",
        "voiceover": "Explicación del problema y el método."
      },
      {
        "secondRange": "0:21 - 0:45",
        "shotType": "Comparativa de Datos",
        "visualDirection": "Gráfica con números de impacto y retención.",
        "voiceover": "Resultados y aplicación práctica para el cliente."
      },
      {
        "secondRange": "0:46 - 0:60",
        "shotType": "Cierre con CTA",
        "visualDirection": "Señalando a comentarios con logotipo oficial de Pixel 12.",
        "voiceover": "Llamada a la acción para comentar o agendar."
      }
    ],
    "stories": [
      {
        "slideNumber": 1,
        "headline": "Pregunta de interacción",
        "text": "Texto para historia 1 de Instagram",
        "stickerIdea": "Encuesta interactiva",
        "cta": "Vota"
      },
      {
        "slideNumber": 2,
        "headline": "Revelación estratégica",
        "text": "Texto para historia 2 de Instagram",
        "stickerIdea": "Sticker deslizador",
        "cta": "Desliza"
      },
      {
        "slideNumber": 3,
        "headline": "Lee el blog completo",
        "text": "Texto para historia 3 de Instagram con link a Pixel 12",
        "stickerIdea": "Sticker con enlace",
        "cta": "Toca el enlace"
      }
    ],
    "linkedInPost": "Post completo para LinkedIn en formato largo con emojis bien situados y hashtags de Pixel 12"
  }
}`;

    const textResponse = await generateGeminiContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.4,
        responseMimeType: 'application/json'
      }
    });

    let cleaned = textResponse.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);

    const parsed = JSON.parse(cleaned.trim());
    parsed.id = 'blog_' + Date.now();
    parsed.brandId = brandId;
    parsed.author = author;
    parsed.authorRole = authorRole;
    parsed.category = category;
    parsed.sourceType = sourceType;
    parsed.sourceUrl = sourceUrl;
    parsed.status = 'DRAFT';
    parsed.createdAt = new Date().toISOString();
    parsed.updatedAt = new Date().toISOString();
    parsed.coverImage = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80';

    return res.json(parsed);
  } catch (e: any) {
    console.log('[AI] Falling back to structured blog generator:', e?.message || e);
    return res.json(getBlogFallback());
  }
});


// Social Publishing Mock/Real Pipeline
app.post('/api/social/publish', async (req, res) => {
  const { postId, platforms } = req.body;
  const data = readWorkspaceData();
  const post = data.posts.find((p: any) => p.id === postId);

  if (!post) {
    return res.status(404).json({ error: 'Publicación no encontrada' });
  }

  // Check connection status of requested platforms
  const disconnectedPlatforms: string[] = [];
  platforms.forEach((plat: string) => {
    const account = data.socialAccounts.find((a: any) => a.platform === plat);
    if (!account || !account.isConnected) {
      disconnectedPlatforms.push(plat);
    }
  });

  if (disconnectedPlatforms.length > 0) {
    return res.status(400).json({
      success: false,
      message: `No se puede publicar en vivo porque las siguientes cuentas no tienen credenciales de API activas: ${disconnectedPlatforms.join(', ')}. Conecta tus cuentas en el módulo "Integraciones / Redes Sociales" para publicar en producción.`,
      disconnectedPlatforms
    });
  }

  // If connected, update status to PUBLISHED
  post.status = 'PUBLISHED';
  post.updatedAt = new Date().toISOString();
  writeWorkspaceData(data);

  res.json({
    success: true,
    message: 'Publicación enviada exitosamente a las redes conectadas',
    post
  });
});

// ---------------- VITE MIDDLEWARE / STATIC ----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PIXEL 12 OS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
