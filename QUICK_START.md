# 🚀 Guide de Démarrage Rapide - Nalla Ink

## ⚡ Installation en 5 minutes

### 1. Installation des dépendances
```bash
npm install
```

### 2. Créer le fichier .env
Créez un fichier `.env` à la racine avec :
```
PORT=3000
JWT_SECRET=mon_secret_super_securise_123456
```

### 3. Démarrer le serveur
```bash
node backend/server.js
```

### 4. Ouvrir dans le navigateur
- Site public : http://localhost:3000
- Admin : http://localhost:3000/admin.html
- Login : admin / admin123

---

## 🎯 Pour passer à Cloudinary (RECOMMANDÉ)

### 1. Créer compte Cloudinary (gratuit)
👉 https://cloudinary.com/users/register/free

### 2. Copier vos credentials
Dans le Dashboard Cloudinary, copier :
- Cloud name
- API Key  
- API Secret

### 3. Modifier .env
```
PORT=3000
JWT_SECRET=mon_secret_super_securise_123456
CLOUDINARY_CLOUD_NAME=votre_cloud_name_ici
CLOUDINARY_API_KEY=votre_api_key_ici
CLOUDINARY_API_SECRET=votre_api_secret_ici
```

### 4. Démarrer avec Cloudinary
```bash
node backend/cloudinary-server.js
```

C'est tout ! 🎉

---

## 📱 Utilisation

### Interface Admin
1. Aller sur http://localhost:3000/admin.html
2. Se connecter (admin/admin123)
3. Uploader des images :
   - Choisir catégorie (Tatouage ou Gravure)
   - Ajouter titre et description (optionnel)
   - Sélectionner image
   - Cliquer sur "Uploader"
4. Les images apparaissent instantanément sur le site public

### Interface Publique
- Les visiteurs voient la galerie sur http://localhost:3000
- Peuvent filtrer par catégorie
- Cliquer sur une image pour l'agrandir

---

## ⚠️ Important avant mise en production

1. **Changer le mot de passe admin**
   - Se connecter à l'admin
   - Utiliser l'API pour changer le mot de passe

2. **Changer JWT_SECRET**
   - Mettre une vraie clé complexe dans .env
   - Exemple : `JWT_SECRET=k7#mP9$xL2@qR5&nT8^wZ4!vB3%yH6*`

3. **Configurer CORS**
   - Dans server.js, remplacer :
   ```javascript
   app.use(cors()); 
   ```
   - Par :
   ```javascript
   app.use(cors({ origin: 'https://votre-domaine.com' }));
   ```

---

## 🆘 Problèmes fréquents

### Le serveur ne démarre pas
```bash
# Vérifier que le port 3000 est libre
# Sur Windows :
netstat -ano | findstr :3000
# Sur Mac/Linux :
lsof -i :3000
```

### Images ne s'affichent pas
- Vérifier que l'API_URL dans `frontend/js/main.js` est correct
- Vérifier que le serveur est démarré

### Erreur CORS
- Installer l'extension "CORS Unblock" sur Chrome (dev seulement)
- Ou ajouter CORS dans server.js (déjà fait)

---

## 📊 Quelle solution choisir ?

### Choisir Backend Local si :
- ❤️ Vous voulez tout contrôler
- 💰 Budget très limité
- 🏠 Vous avez un serveur personnel
- 📦 Peu d'images (< 500)

### Choisir Cloudinary si :
- ⚡ Vous voulez la simplicité
- 🌍 Site accessible mondialement
- 📈 Beaucoup d'images prévues
- 🚀 Vous voulez déployer facilement
- ✅ **RECOMMANDÉ pour vous**

---

## 📞 Contacts & Liens

- **Site** : http://localhost:3000
- **Admin** : http://localhost:3000/admin.html
- **Cloudinary** : https://cloudinary.com
- **Support Node.js** : https://nodejs.org

---

**Bon développement ! 🎨**