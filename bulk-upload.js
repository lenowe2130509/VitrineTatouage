/* ========================================
   SCRIPT D'UPLOAD EN MASSE VERS CLOUDINARY
   
   📁 STRUCTURE ATTENDUE :
   nalla-ink/
   ├── images-tattoo/      ← Photos tatouages
   ├── images-mirror/      ← Photos gravures
   ├── bulk-upload.js      ← CE FICHIER
   ├── Backend/
   │   └── database.json
   ├── .env
   └── package.json
   
   🚀 UTILISATION :
   1. Place tes images dans les dossiers ci-dessus
   2. Configure ton .env avec Cloudinary
   3. Lance : npm run upload
   
   ⏱️ DURÉE ESTIMÉE :
   - 30 secondes par image
   - 50 images = ~25 minutes
   ======================================== */

const fs = require('fs').promises;
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// ========================================
// CONFIGURATION
// ========================================

// Chemin vers la base de données
const DB_FILE = path.join(__dirname, 'Backend', 'database.json');

// Dossiers sources des images
const FOLDERS = {
    tattoo: path.join(__dirname, 'images-tattoo'),
    mirror: path.join(__dirname, 'images-mirror')
};

// Extensions d'images acceptées
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif|heic)$/i;

// Configuration Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

/**
 * Lit la base de données
 */
async function readDB() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Erreur lecture DB:', error.message);
        throw error;
    }
}

/**
 * Écrit dans la base de données
 */
async function writeDB(data) {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Erreur écriture DB:', error.message);
        throw error;
    }
}

/**
 * Formate un nom de fichier en titre lisible
 * Ex: "tattoo-dragon_red.jpg" → "Tattoo Dragon Red"
 */
function formatTitle(filename) {
    return path.basename(filename, path.extname(filename))
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Upload une image vers Cloudinary
 */
async function uploadImage(filePath, category) {
    const filename = path.basename(filePath);
    
    try {
        console.log(`📤 Upload en cours: ${filename}`);
        
        // Upload vers Cloudinary avec optimisation
        const result = await cloudinary.uploader.upload(filePath, {
            folder: `nalla-ink/${category}`,
            transformation: [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto:good' }
            ],
            format: 'jpg'
        });

        console.log(`✅ Uploadé: ${result.public_id}`);

        // Retourne les données pour la DB
        return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            cloudinaryId: result.public_id,
            url: result.secure_url,
            category: category,
            title: formatTitle(filename),
            description: '',
            uploadedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error(`❌ Erreur upload ${filename}:`, error.message);
        return null;
    }
}

/**
 * Vérifie que les dossiers existent
 */
async function checkFolders() {
    const missing = [];
    
    for (const [category, folderPath] of Object.entries(FOLDERS)) {
        try {
            await fs.access(folderPath);
        } catch {
            missing.push(folderPath);
        }
    }
    
    return missing;
}

/**
 * Vérifie la configuration Cloudinary
 */
function checkCloudinaryConfig() {
    const required = [
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(
            `⚠️  Variables Cloudinary manquantes dans .env:\n` +
            missing.map(key => `   - ${key}`).join('\n')
        );
    }
}

// ========================================
// FONCTION PRINCIPALE
// ========================================

async function bulkUpload() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 UPLOAD EN MASSE - NALLA INK');
    console.log('='.repeat(60) + '\n');

    try {
        // 1. Vérifier la configuration
        console.log('🔍 Vérification de la configuration...');
        checkCloudinaryConfig();
        console.log('☁️  Cloudinary configuré:', process.env.CLOUDINARY_CLOUD_NAME);

        // 2. Vérifier les dossiers
        const missingFolders = await checkFolders();
        if (missingFolders.length > 0) {
            console.log('\n⚠️  DOSSIERS MANQUANTS:');
            missingFolders.forEach(folder => console.log(`   - ${folder}`));
            console.log('\n💡 Crée ces dossiers avec:');
            missingFolders.forEach(folder => {
                console.log(`   mkdir ${path.basename(folder)}`);
            });
            console.log('\nPuis place tes images dedans et relance le script.\n');
            process.exit(1);
        }

        // 3. Lire la base de données
        console.log('📂 Lecture de la base de données...');
        const db = await readDB();
        console.log(`📊 ${db.images.length} images déjà dans la base\n`);

        let totalUploaded = 0;
        let totalFailed = 0;
        let totalSkipped = 0;

        // 4. Pour chaque catégorie
        for (const [category, folderPath] of Object.entries(FOLDERS)) {
            console.log('\n' + '-'.repeat(60));
            console.log(`📁 Catégorie: ${category.toUpperCase()}`);
            console.log('-'.repeat(60) + '\n');

            // Lire les fichiers du dossier
            const files = await fs.readdir(folderPath);
            const imageFiles = files.filter(file => IMAGE_EXTENSIONS.test(file));

            if (imageFiles.length === 0) {
                console.log(`⚠️  Aucune image trouvée dans ${folderPath}`);
                totalSkipped += 1;
                continue;
            }

            console.log(`📊 ${imageFiles.length} images à uploader\n`);

            // Upload chaque image
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                const filePath = path.join(folderPath, file);
                
                console.log(`[${i + 1}/${imageFiles.length}]`, '');
                
                const imageData = await uploadImage(filePath, category);

                if (imageData) {
                    db.images.push(imageData);
                    await writeDB(db);
                    totalUploaded++;
                } else {
                    totalFailed++;
                }

                // Pause de 1 seconde entre chaque upload (évite de surcharger l'API)
                if (i < imageFiles.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        // 5. Résumé final
        console.log('\n' + '='.repeat(60));
        console.log('✅ UPLOAD TERMINÉ !');
        console.log('='.repeat(60));
        console.log(`✅ Uploadées avec succès : ${totalUploaded}`);
        if (totalFailed > 0) {
            console.log(`❌ Échouées              : ${totalFailed}`);
        }
        if (totalSkipped > 0) {
            console.log(`⚠️  Dossiers vides       : ${totalSkipped}`);
        }
        console.log('='.repeat(60) + '\n');

        console.log('📋 Prochaines étapes:');
        console.log('   1. Démarre le serveur : npm start');
        console.log('   2. Ouvre ton navigateur : http://localhost:3000');
        console.log('   3. Vérifie que les images apparaissent 🎉\n');

    } catch (error) {
        console.error('\n❌ ERREUR CRITIQUE:', error.message);
        console.error('\n💡 Vérifie que:');
        console.error('   - Le fichier .env existe et contient tes credentials Cloudinary');
        console.error('   - Les dossiers images-tattoo/ et images-mirror/ existent');
        console.error('   - Tu as bien lancé : npm install\n');
        process.exit(1);
    }
}

// ========================================
// LANCEMENT DU SCRIPT
// ========================================

// Affiche un message si lancé sans npm run upload
if (require.main === module) {
    bulkUpload().catch(error => {
        console.error('Erreur fatale:', error);
        process.exit(1);
    });
}

module.exports = { bulkUpload };