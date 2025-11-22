const cloudinary = require('cloudinary').v2;
require('dotenv').config();

console.log('='.repeat(50));
console.log('TEST CLOUDINARY');
console.log('='.repeat(50));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'OK' : 'MANQUANT');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'OK' : 'MANQUANT');

cloudinary.api.ping()
    .then(response => {
        console.log('\n✅ CLOUDINARY CONNECTÉ !');
        console.log(response);
    })
    .catch(error => {
        console.error('\n❌ ERREUR CLOUDINARY:');
        console.error(error.message);
    });