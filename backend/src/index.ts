import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { prisma } from '../lib/prisma';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import donorRoutes from './routes/donorRoutes';
import donationRoutes from './routes/donationRoutes';
import bloodStockRoutes from './routes/bloodStockRoutes';
import bloodIssueRoutes from './routes/bloodIssueRoutes';
import eventRoutes from './routes/eventRoutes';
import certificateRoutes from './routes/certificateRoutes';
import accountClaimRoutes from './routes/accountClaimRoutes';
import donorRequestRoutes from './routes/donorRequestRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import settingsRoutes from './routes/settingsRoutes';
import bloodWorkflowRoutes from './routes/bloodWorkflowRoutes';
import path from 'path';

const app: Application = express();
const PORT = process.env.PORT || 3001;

//
// ✅ 1. CORS (FOR BEARER TOKEN)
//
app.use(cors({
  origin: '*', // allow all
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

//
// ✅ 2. Middleware
//
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

//
// ✅ 3. Health Check
//
app.get('/health', (_, res) => {
  res.json({ status: 'ok', message: 'Server is running 🚀' });
});

//
// ✅ 4. Routes
//
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/blood-stock', bloodStockRoutes);
app.use('/api/blood-issues', bloodIssueRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/account-claim', accountClaimRoutes);
app.use('/api/donor-requests', donorRequestRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/blood-workflow', bloodWorkflowRoutes);

//
// ✅ 5. 404 Handler
//
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

//
// ✅ 6. Error Handler
//
app.use(errorHandler);

//
// ✅ 7. Graceful Shutdown
//
const shutdown = async () => {
  console.log('🔻 Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

//
// ✅ 8. Start Server
//
(async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running: http://localhost:${PORT}`);
      console.log(`🌐 API Base: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('❌ Server failed:', err);
    process.exit(1);
  }
})();