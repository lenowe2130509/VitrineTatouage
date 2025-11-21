# 🎨 Nalla Ink - Site Professionnel

Site web pour tatoueur et graveur professionnel avec système d'administration.

## 📋 Structure du Projet

```
nalla-ink/
├── frontend/
│   ├── index.html          # Page publique
│   ├── admin.html          # Interface admin
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── main.js         # Script page publique
│       └── admin.js        # Script admin
├── backend/
│   ├── server.js           # Solution 1: Backend complet
│   ├── cloudinary-server.js # Solution 2: Avec Cloudinary
│   └── uploads/            # Stockage images (Solution 1)
│       ├── tattoo/
│       └── mirror/
├── package.json
├── .env
└── database.json           # Base de données JSON
```

---

## 🚀 Installation

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd nalla-ink
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer l'environnement

Créer un fichier `.env` à la racine :

**Pour Solution 1 (Backend local):**
```env
PORT=3000
JWT_SECRET=changez_cette_cle_par_quelque_chose_de_tres_complexe
NODE_ENV=development
```

**Pour Solution 2 (Cloudinary):**
```env
PORT=3000
JWT_SECRET=changez_cette_cle_par_quelque_chose_de_tres_complexe
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

---

## 🎯 Démarrage

### Solution 1 : Backend Node.js complet
```bash
# Démarrer le serveur
node backend/server.js

# Ou en mode dev avec auto-reload
npm run dev
```

### Solution 2 : Avec Cloudinary
```bash
# Démarrer le serveur Cloudinary
node backend/cloudinary-server.js
```

Le site sera accessible sur : http://localhost:3000

---

## 🔐 Accès Admin

1. Aller sur : http://localhost:3000/admin.html
2. Identifiants par défaut :
   - **Username:** admin
   - **Password:** admin123

⚠️ **IMPORTANT:** Changez le mot de passe immédiatement après la première connexion !

---

## 📊 Comparaison des Solutions

### ✅ SOLUTION 1 : Backend Node.js Complet

**Avantages:**
- ✅ Contrôle total sur vos données
- ✅ Aucune dépendance externe
- ✅ Gratuit à 100%
- ✅ Pas de limite de stockage (sauf disque dur)
- ✅ Fonctionne hors ligne

**Inconvénients:**
- ❌ Vous devez gérer les backups
- ❌ Optimisation d'images manuelle
- ❌ Plus complexe à déployer
- ❌ Pas de CDN global

**Idéal pour:**
- Site hébergé sur votre propre serveur
- Budget limité
- Contrôle total souhaité
- Petit volume d'images (< 1000)

---

### ✅ SOLUTION 2 : Cloudinary (RECOMMANDÉ)

**Avantages:**
- ✅ CDN ultra-rapide mondial
- ✅ Optimisation automatique des images
- ✅ 25GB gratuits (énorme!)
- ✅ Backup automatique
- ✅ Transformations à la volée
- ✅ Facile à déployer (Heroku, Vercel, etc.)
- ✅ Interface web pour gérer les images

**Inconvénients:**
- ❌ Dépendance à un service externe
- ❌ Nécessite une connexion internet
- ❌ Limite de 25GB (plan gratuit)

**Idéal pour:**
- Site professionnel avec grosse galerie
- Besoin de performances optimales
- Déploiement facile souhaité
- Pas envie de gérer les serveurs

---

## 🏆 Ma Recommandation

### Pour vous, je recommande **SOLUTION 2 (Cloudinary)** parce que :

1. **Simplicité** : Vous n'avez pas à gérer les fichiers
2. **Performance** : CDN rapide = clients contents
3. **Fiabilité** : Backup automatique, pas de perte de données
4. **Gratuit** : 25GB = environ 5000-10000 images haute qualité
5. **Scalable** : Fonctionne aussi bien avec 10 qu'avec 10000 images
6. **Professionnel** : Utilisé par Netflix, Spotify, etc.

### Comment obtenir Cloudinary (gratuit):

1. Aller sur https://cloudinary.com/users/register/free
2. Créer un compte gratuit
3. Dans le Dashboard, copier :
   - Cloud name
   - API Key
   - API Secret
4. Les mettre dans le fichier `.env`

---

## 📁 Fonctionnalités

### Interface Publique
- ✅ Galerie avec filtres (Tatouages / Gravures)
- ✅ Agrandissement des images en modal
- ✅ Design responsive mobile/tablette/desktop
- ✅ Smooth scroll et animations
- ✅ Section services
- ✅ Section contact

### Interface Admin
- ✅ Connexion sécurisée avec JWT
- ✅ Upload d'images avec preview
- ✅ Catégorisation (tatouage/gravure)
- ✅ Ajout de titre et description
- ✅ Suppression d'images
- ✅ Gestion complète de la galerie

---

## 🔒 Sécurité

### Ce qui est sécurisé :
- ✅ Authentification JWT
- ✅ Mot de passe hashé (bcrypt)
- ✅ Validation des fichiers (type + taille)
- ✅ Token avec expiration (24h)
- ✅ Routes admin protégées

### À faire pour la production :
- ⚠️ Changer le JWT_SECRET dans .env
- ⚠️ Changer le mot de passe admin
- ⚠️ Activer HTTPS
- ⚠️ Ajouter rate limiting (optionnel)
- ⚠️ Configurer CORS pour votre domaine

---

## 🌐 Déploiement

### Hébergement recommandé :

**Backend + Frontend:**
- **Vercel** (gratuit, facile) - Parfait pour Solution 2
- **Heroku** (gratuit avec limitations)
- **DigitalOcean** ($5/mois) - Pour Solution 1
- **OVH** (français, pas cher)

**Frontend seul + Backend ailleurs:**
- **Netlify** (gratuit)
- **GitHub Pages** (gratuit)

### Étapes de déploiement (Vercel + Cloudinary):

1. Créer compte sur vercel.com
2. Connecter votre repo GitHub
3. Configurer les variables d'environnement
4. Déployer en 1 clic !

---

## 📞 Support

### Identifiants par défaut
- Username: `admin`
- Password: `admin123`

### Ports utilisés
- Frontend: Port 3000 (par défaut)
- Backend: Port 3000 (même serveur Express)

### Problèmes courants

**"Cannot GET /"**
- Solution : Vérifiez que le serveur est démarré

**"CORS Error"**
- Solution : Vérifiez que CORS est activé dans server.js

**"JWT malformed"**
- Solution : Reconnectez-vous à l'admin

**Images ne s'affichent pas**
- Solution : Vérifiez l'URL de l'API dans main.js

---

## 📝 TODO / Améliorations futures

- [ ] Système de commentaires
- [ ] Formulaire de contact avec envoi d'email
- [ ] Statistiques de visites
- [ ] Mode sombre
- [ ] Plusieurs admins
- [ ] Réorganisation des images (drag & drop)
- [ ] Export de la galerie

---

## 📄 Licence

MIT - Libre d'utilisation

---

## 👨‍💻 Développé pour Nalla Ink

Tatoueur & Graveur Professionnel - Morbihan, Bretagne

🔗 Instagram: @nalla_ink
📧 Email: contact@nalla-ink.fr

---

## 🆘 Besoin d'aide ?

Si vous avez des questions, n'hésitez pas à me contacter !

**Bon courage avec votre site ! 🎨**