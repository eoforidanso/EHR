import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config.js';
import { initializeDatabase } from './db/database.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import clinicalRoutes from './routes/clinical.js';
import medicationRoutes from './routes/medications.js';
import orderRoutes from './routes/orders.js';
import labRoutes from './routes/labs.js';
import encounterRoutes from './routes/encounters.js';
import appointmentRoutes from './routes/appointments.js';
import inboxRoutes from './routes/inbox.js';
import messagingRoutes from './routes/messaging.js';
import btgRoutes from './routes/btg.js';
import eprescribeRoutes from './routes/eprescribe.js';
import smartPhraseRoutes from './routes/smartPhrases.js';
import analyticsRoutes from './routes/analytics.js';
import careGapRoutes from './routes/careGaps.js';

const app = express();

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: config.nodeEnv === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/patients', clinicalRoutes);   // /api/patients/:patientId/allergies, etc.
app.use('/api/patients', medicationRoutes); // /api/patients/:patientId/medications
app.use('/api/patients', orderRoutes);      // /api/patients/:patientId/orders
app.use('/api/patients', labRoutes);        // /api/patients/:patientId/labs
app.use('/api/patients', encounterRoutes);  // /api/patients/:patientId/encounters
app.use('/api/appointments', appointmentRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/btg', btgRoutes);
app.use('/api/eprescribe', eprescribeRoutes);
app.use('/api/smart-phrases', smartPhraseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/care-gaps', careGapRoutes);

// Error handling
app.use(errorHandler);

// Initialize DB and start
async function start() {
  await initializeDatabase();
  app.listen(config.port, () => {
    console.log(`EHR Backend running on port ${config.port} [${config.nodeEnv}]`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
