import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get system settings
export const getSettings = async (req: Request, res: Response) => {
  try {
    // For now, we'll use a simple approach - store settings in a single record
    // You might want to create a Settings table in your Prisma schema
    
    // Check if settings file exists
    const settingsPath = path.join(__dirname, '../../data/settings.json');
    
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      res.json(settings);
    } else {
      // Return default settings
      res.json({
        organizationName: 'Blood Donation Management System',
        organizationLogo: null,
        dashboardTitle: 'Blood Bank Management',
        shortName: 'BBMS',
        contactEmail: 'contact@bloodbank.org',
        contactPhone: '+1 (555) 000-0000',
      });
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Update system settings
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const settingsPath = path.join(__dirname, '../../data/settings.json');
    const dataDir = path.join(__dirname, '../../data');
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Read existing settings or create new
    let settings: any = {};
    if (fs.existsSync(settingsPath)) {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }
    
    // Update settings with new values
    settings = {
      ...settings,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    // Save settings
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

// Upload logo
export const uploadLogo = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const settingsPath = path.join(__dirname, '../../data/settings.json');
    const dataDir = path.join(__dirname, '../../data');
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Read existing settings
    let settings: any = {};
    if (fs.existsSync(settingsPath)) {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      
      // Delete old logo file if exists
      if (settings.organizationLogo) {
        const oldLogoPath = path.join(__dirname, '../../uploads/logos', path.basename(settings.organizationLogo));
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
    }
    
    // Update settings with new logo path
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    settings.organizationLogo = logoUrl;
    settings.updatedAt = new Date().toISOString();
    
    // Save settings
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    
    res.json({ 
      message: 'Logo uploaded successfully', 
      logoUrl: logoUrl 
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
};

// Delete logo
export const deleteLogo = async (req: Request, res: Response) => {
  try {
    const settingsPath = path.join(__dirname, '../../data/settings.json');
    
    if (!fs.existsSync(settingsPath)) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    
    // Delete logo file if exists
    if (settings.organizationLogo) {
      const logoPath = path.join(__dirname, '../../uploads/logos', path.basename(settings.organizationLogo));
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }
    
    // Update settings
    settings.organizationLogo = null;
    settings.updatedAt = new Date().toISOString();
    
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    
    res.json({ message: 'Logo deleted successfully' });
  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({ error: 'Failed to delete logo' });
  }
};
