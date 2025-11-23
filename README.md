# 🎨 NALLA INK - Site Portfolio Tatouage & Gravure

Site web professionnel pour artiste tatoueur avec galerie interactive 3D, système d'administration et témoignages clients.

## 🚀 COMMENT LANCER LE SITE

### ⚡ Méthode rapide (RECOMMANDÉE)
**Double-cliquez sur le fichier `LANCER_LE_SITE.bat`** puis ouvrez http://localhost:3000 dans votre navigateur.

### ❗ IMPORTANT - Éviter les erreurs de chargement

**N'OUVREZ JAMAIS les fichiers HTML directement !**

❌ **MAUVAIS** : Double-cliquer sur `index.html` ou `admin.html`
→ Cela ouvrira le fichier avec l'adresse `file:///` et causera des erreurs de chargement

✅ **BON** : Lancer le serveur avec `LANCER_LE_SITE.bat`
→ Le site sera accessible via `http://localhost:3000`

**Pourquoi ?** Le site a besoin du serveur backend pour charger les images et témoignages depuis la base de données.

## 📁 Structure du Projet

```
VitrineTatouage/
├── LANCER_LE_SITE.bat      ← DOUBLE-CLIQUEZ ICI pour lancer le site
├── README.md               ← Ce fichier
├── Frontend/               ← Interface publique et admin
│   ├── index.html          # Site public
│   ├── admin.html          # Interface d'administration
│   ├── css/
│   │   ├── styles.css      # Styles du site public
│   │   └── admin.css       # Styles de l'admin
│   └── js/
│       ├── main.js         # Logique du site public
│       └── admin.js        # Logique de l'admin
└── Backend/                ← Serveur et API
    ├── server.js           # Serveur Node.js + Express
    ├── database.json       # Base de données (images + témoignages)
    ├── package.json        # Dépendances npm
    └── temp/               # Uploads temporaires
```

---

## 🎯 Démarrage Manuel

Si le fichier `LANCER_LE_SITE.bat` ne fonctionne pas :

```bash
cd Backend
node server.js
```

Puis ouvrez http://localhost:3000 dans votre navigateur.

⚠️ **NE FERMEZ PAS le terminal tant que vous utilisez le site !**

---

## 🔐 Accès Administration

1. Aller sur : **http://localhost:3000/admin.html**
2. Mot de passe par défaut : **admin123**

### Fonctionnalités Admin :
- ✅ Upload de créations (tatouages & gravures)
- ✅ Ajout de titres et descriptions
- ✅ Suppression de créations
- ✅ Gestion des témoignages clients
- ✅ Système de notation par étoiles (1-5)

---

## ❗ RÉSOLUTION DES PROBLÈMES

### Problème : "Les images ne chargent pas" / "Erreurs de chargement"

**Cause** : Vous avez ouvert le fichier HTML directement au lieu de passer par le serveur.

**Solution** :
1. Fermez l'onglet du navigateur
2. Double-cliquez sur `LANCER_LE_SITE.bat`
3. Attendez que le message "Serveur démarré avec succès" apparaisse
4. Ouvrez votre navigateur et allez sur **http://localhost:3000**

### Problème : "Le serveur ne démarre pas"

**Solution** :
1. Vérifiez que Node.js est installé : `node --version`
2. Vérifiez que le port 3000 est libre
3. Lancez manuellement depuis le terminal :
   ```bash
   cd Backend
   node server.js
   ```

### Problème : "Les uploads ne fonctionnent pas"

**Note** : Les images existantes (déjà sur Cloudinary) fonctionnent normalement.

Pour uploader de nouvelles images, créez un fichier `.env` dans le dossier `Backend` :
```env
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

---

## 🛠️ Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **Backend** : Node.js + Express.js
- **Hébergement images** : Cloudinary
- **Authentification** : JWT (JSON Web Tokens) + bcrypt
- **Base de données** : JSON file-based (database.json)

---

## ✨ Fonctionnalités

### Interface Publique
- 🎭 **Animation d'ouverture** : Rideau avec logo qui se divise
- 🎠 **Carousel 3D infini** : Défilement horizontal automatique avec effet 3D
- 🔍 **Filtres dynamiques** : Tous / Tatouages / Gravures avec compteurs
- 🖼️ **Modal d'agrandissement** : Voir les créations en grand format
- 💬 **Témoignages clients** : Affichage des avis avec système d'étoiles
- 📱 **Responsive** : Adapté mobile, tablette et desktop
- ⚡ **Optimisé** : Chargement rapide, animations fluides
- 🎨 **Effets visuels** : Parallax, smooth scroll, hover effects

### Interface Admin
- 🔐 **Authentification sécurisée** : Login par mot de passe avec token JWT
- 📤 **Upload d'images** : Avec preview en temps réel
- 🏷️ **Catégorisation** : Tatouage ou Gravure
- ✍️ **Titres & descriptions** : Personnalisation complète
- 🗑️ **Suppression sécurisée** : Avec modal de confirmation
- ⭐ **Gestion témoignages** : Ajout/suppression avec notes 1-5 étoiles
- 📊 **Compteurs en temps réel** : Nombre de créations par catégorie
- 🎨 **Interface moderne** : Design épuré avec effets glassmorphism

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