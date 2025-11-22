/* ========================================
   NALLA INK - BACKEND SERVER (CLOUDINARY)
   ======================================== */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// ========================================
// CONFIGURATION
// ========================================

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Configuration Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Frontend')));

// Multer pour stockage temporaire
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const tempDir = path.join(__dirname, 'temp');
        try {
            await fs.mkdir(tempDir, { recursive: true });
            cb(null, tempDir);
        } catch (error) {
            console.error('Erreur création dossier temp:', error);
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Seules les images (JPEG, PNG, WebP) sont autorisées!'));
        }
    }
});

// ========================================
// DATABASE FUNCTIONS
// ========================================

async function initDB() {
    try {
        await fs.access(DB_FILE);
        console.log('📦 Base de données existante trouvée');
    } catch {
        console.log('📦 Création de la base de données...');
        const initialData = {
            images: [],
            admin: {
                username: 'admin',
                password: await bcrypt.hash('admin123', 10)
            }
        };
        await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
        console.log('✅ Base de données créée avec succès');
    }
}

async function readDB() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur lecture DB:', error);
        throw error;
    }
}

async function writeDB(data) {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Erreur écriture DB:', error);
        throw error;
    }
}

// ========================================
// AUTH MIDDLEWARE
// ========================================

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token manquant' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'changez_moi_en_production', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide' });
        }
        req.user = user;
        next();
    });
}

// ========================================
// ROUTES PUBLIQUES
// ========================================

app.get('/api/gallery', async (req, res) => {
    try {
        const db = await readDB();
        const { category } = req.query;
        
        let images = db.images;
        
        if (category && category !== 'all') {
            images = images.filter(img => img.category === category);
        }
        
        images.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        
        res.json(images);
    } catch (error) {
        console.error('Erreur GET /api/gallery:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des images' });
    }
});

// ========================================
// ROUTES ADMIN
// ========================================

// Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username et password requis' });
        }
        
        const db = await readDB();
        
        if (username !== db.admin.username) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }
        
        const validPassword = await bcrypt.compare(password, db.admin.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }
        
        const token = jwt.sign(
            { username: db.admin.username },
            process.env.JWT_SECRET || 'changez_moi_en_production',
            { expiresIn: '24h' }
        );
        
        console.log('✅ Admin connecté:', username);
        res.json({ token, message: 'Connexion réussie' });
    } catch (error) {
        console.error('Erreur POST /api/admin/login:', error);
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
});

// Upload image
app.post('/api/admin/upload', authenticateToken, upload.single('image'), async (req, res) => {
    let tempFilePath = null;
    
    try {
        console.log('📤 Upload reçu');
        
        if (!req.file) {
            return res.status(400).json({ error: 'Aucune image fournie' });
        }
        
        tempFilePath = req.file.path;
        const { category, title, description } = req.body;
        
        console.log('📂 Fichier temporaire:', tempFilePath);
        console.log('📋 Catégorie:', category);
        
        // Vérification Cloudinary
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            throw new Error('CLOUDINARY_CLOUD_NAME manquant dans .env');
        }
        
        console.log('☁️  Upload vers Cloudinary...');
        
        // Upload vers Cloudinary
        const result = await cloudinary.uploader.upload(tempFilePath, {
            folder: `nalla-ink/${category || 'tattoo'}`,
            transformation: [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto:good' }
            ],
            format: 'jpg'
        });
        
        console.log('✅ Image uploadée sur Cloudinary:', result.public_id);
        
        // Sauvegarder dans la DB
        const imageData = {
            id: Date.now().toString(),
            cloudinaryId: result.public_id,
            url: result.secure_url,
            category: category || 'tattoo',
            title: title || '',
            description: description || '',
            uploadedAt: new Date().toISOString()
        };
        
        const db = await readDB();
        db.images.push(imageData);
        await writeDB(db);
        
        console.log('✅ Image ajoutée à la base de données');
        
        res.json({
            message: 'Image uploadée avec succès',
            image: imageData
        });
        
    } catch (error) {
        console.error('❌ ERREUR UPLOAD:', error);
        console.error('Stack trace:', error.stack);
        
        res.status(500).json({ 
            error: 'Erreur lors de l\'upload',
            details: error.message
        });
    } finally {
        // Nettoyer le fichier temporaire
        if (tempFilePath) {
            try {
                await fs.unlink(tempFilePath);
                console.log('🗑️  Fichier temporaire supprimé');
            } catch (e) {
                console.error('Erreur suppression fichier temp:', e);
            }
        }
    }
});

// Supprimer une image
app.delete('/api/admin/image/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = await readDB();
        
        const imageIndex = db.images.findIndex(img => img.id === id);
        
        if (imageIndex === -1) {
            return res.status(404).json({ error: 'Image non trouvée' });
        }
        
        const image = db.images[imageIndex];
        
        // Supprimer de Cloudinary
        if (image.cloudinaryId) {
            try {
                await cloudinary.uploader.destroy(image.cloudinaryId);
                console.log('✅ Image supprimée de Cloudinary:', image.cloudinaryId);
            } catch (error) {
                console.error('Erreur suppression Cloudinary:', error);
            }
        }
        
        // Supprimer de la DB
        db.images.splice(imageIndex, 1);
        await writeDB(db);
        
        console.log('✅ Image supprimée de la base de données');
        res.json({ message: 'Image supprimée avec succès' });
    } catch (error) {
        console.error('Erreur DELETE /api/admin/image:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
});

// ========================================
// GESTION DES ERREURS
// ========================================

app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err);
    res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: err.message
    });
});

// ========================================
// DÉMARRAGE DU SERVEUR
// ========================================

async function startServer() {
    try {
        // Créer le dossier temp
        const tempDir = path.join(__dirname, 'temp');
        await fs.mkdir(tempDir, { recursive: true });
        console.log('📁 Dossier temp créé/vérifié');
        
        // Initialiser la DB
        await initDB();
        
        // Vérifier la config Cloudinary
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
            console.warn('⚠️  Cloudinary n\'est pas configuré dans .env');
            console.warn('⚠️  Les uploads ne fonctionneront pas');
        } else {
            console.log('☁️  Cloudinary configuré:', process.env.CLOUDINARY_CLOUD_NAME);
        }
        
        // Démarrer le serveur
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log('🚀 Serveur Nalla Ink démarré avec succès!');
            console.log('='.repeat(50));
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`🔐 Admin: http://localhost:${PORT}/admin.html`);
            console.log(`📊 API: http://localhost:${PORT}/api`);
            console.log('='.repeat(50));
            console.log('⚠️  IMPORTANT:');
            console.log('   - Login admin par défaut: admin / admin123');
            console.log('   - Changez le mot de passe immédiatement!');
            console.log('='.repeat(50) + '\n');
        });
    } catch (error) {
        console.error('❌ Erreur au démarrage:', error);
        process.exit(1);
    }
}

startServer();

process.on('SIGINT', async () => {
    console.log('\n👋 Arrêt du serveur...');
    process.exit(0);
});