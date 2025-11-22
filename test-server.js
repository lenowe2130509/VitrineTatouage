/* ========================================
   SERVEUR DE TEST MINIMAL
   Pour isoler le problème d'upload
   ======================================== */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const PORT = 3001; // Port différent pour tester

// Configuration Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('\n='.repeat(60));
console.log('🧪 SERVEUR DE TEST - UPLOAD CLOUDINARY');
console.log('='.repeat(60));
console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'OK' : '❌ MANQUANT');
console.log('='.repeat(60) + '\n');

// Middleware
app.use(cors());
app.use(express.json());

// Multer simple (mémoire)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Route de test simple
app.get('/test', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Serveur de test fonctionne',
        cloudinary: {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            configured: !!process.env.CLOUDINARY_API_SECRET
        }
    });
});

// Route d'upload ultra-simple
app.post('/upload-test', upload.single('image'), async (req, res) => {
    console.log('\n📤 Upload reçu');
    
    try {
        if (!req.file) {
            console.log('❌ Pas de fichier');
            return res.status(400).json({ error: 'Pas de fichier' });
        }
        
        console.log('📋 Fichier:', req.file.originalname);
        console.log('📏 Taille:', req.file.size, 'bytes');
        console.log('🎨 Type:', req.file.mimetype);
        
        console.log('\n☁️  Upload vers Cloudinary...');
        
        // Upload depuis le buffer (pas de fichier temp)
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'nalla-ink-test',
                    resource_type: 'auto'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            
            uploadStream.end(req.file.buffer);
        });
        
        console.log('✅ Upload réussi !');
        console.log('📸 URL:', result.secure_url);
        console.log('🆔 ID:', result.public_id);
        
        res.json({
            success: true,
            url: result.secure_url,
            id: result.public_id,
            message: '✅ Upload réussi !'
        });
        
    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        console.error('Stack:', error.stack);
        
        res.status(500).json({ 
            error: error.message,
            details: error.stack
        });
    }
});

// Démarrage
app.listen(PORT, () => {
    console.log(`\n🚀 Serveur de test démarré sur http://localhost:${PORT}`);
    console.log(`\n📋 Routes disponibles :`);
    console.log(`   GET  http://localhost:${PORT}/test`);
    console.log(`   POST http://localhost:${PORT}/upload-test`);
    console.log('\n💡 Pour tester l\'upload :');
    console.log('   1. Ouvre Postman ou utilise cURL');
    console.log('   2. POST http://localhost:3001/upload-test');
    console.log('   3. Body → form-data → Ajoute "image" (file)');
    console.log('\n' + '='.repeat(60) + '\n');
});