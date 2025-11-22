
require('dotenv').config();

console.log('\n='.repeat(50));
console.log('TEST CHARGEMENT .ENV');
console.log('='.repeat(50));

console.log('\n📋 Variables d\'environnement :');
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'OK' : '❌ MANQUANT');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || '❌ MANQUANT');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY || '❌ MANQUANT');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'OK' : '❌ MANQUANT');

console.log('\n');

if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
    console.log('❌ PROBLÈME : Variables Cloudinary manquantes !');
    console.log('\n💡 Solutions possibles :');
    console.log('   1. Vérifie que le fichier .env existe à la racine');
    console.log('   2. Vérifie qu\'il n\'y a pas d\'espaces dans les noms de variables');
    console.log('   3. Redémarre ton terminal');
} else {
    console.log('✅ Toutes les variables sont chargées');
}