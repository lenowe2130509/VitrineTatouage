/* ========================================
   ADMIN.JS - CORRIGÉ
   ======================================== */

// Configuration API
const API_URL = 'http://localhost:3000/api';

// Éléments DOM
const loginPage = document.getElementById('loginPage');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const uploadForm = document.getElementById('uploadForm');
const logoutBtn = document.getElementById('logoutBtn');
const imageInput = document.getElementById('image');
const previewImage = document.getElementById('previewImage');

// Token d'authentification
let authToken = localStorage.getItem('adminToken');

// Vérifier si l'utilisateur est déjà connecté
if (authToken) {
    showDashboard();
}

// ========================================
// LOGIN
// ========================================
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('adminToken', authToken);
            showAlert('loginAlert', 'Connexion réussie!', 'success');
            setTimeout(() => {
                showDashboard();
            }, 500);
        } else {
            showAlert('loginAlert', data.error || 'Identifiants incorrects', 'error');
        }
    } catch (error) {
        console.error('Erreur login:', error);
        showAlert('loginAlert', 'Erreur de connexion au serveur', 'error');
    }
});

// ========================================
// LOGOUT
// ========================================
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    authToken = null;
    loginPage.style.display = 'flex';
    adminDashboard.style.display = 'none';
    loginForm.reset();
});

// ========================================
// PREVIEW IMAGE
// ========================================
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // Vérifie le type de fichier
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showAlert('dashboardAlert', 'Type de fichier invalide. Utilisez JPG, PNG ou WebP', 'error');
            imageInput.value = '';
            return;
        }
        
        // Vérifie la taille (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showAlert('dashboardAlert', 'Fichier trop volumineux. Maximum 5MB', 'error');
            imageInput.value = '';
            return;
        }
        
        // Affiche la preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// ========================================
// UPLOAD IMAGE
// ========================================
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const imageFile = imageInput.files[0];
    
    if (!imageFile) {
        showAlert('dashboardAlert', 'Veuillez sélectionner une image', 'error');
        return;
    }
    
    // Vérifications
    if (imageFile.size > 5 * 1024 * 1024) {
        showAlert('dashboardAlert', 'L\'image est trop volumineuse (max 5MB)', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('category', document.getElementById('category').value);
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    
    // Affiche un loader
    const submitBtn = uploadForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Upload en cours...';
    submitBtn.disabled = true;
    
    try {
        console.log('Envoi de l\'image...'); // Debug
        
        const response = await fetch(`${API_URL}/admin/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        console.log('Réponse reçue:', response.status); // Debug
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('dashboardAlert', 'Image uploadée avec succès!', 'success');
            uploadForm.reset();
            previewImage.style.display = 'none';
            loadGallery(); // Recharge la galerie
        } else {
            if (response.status === 401 || response.status === 403) {
                showAlert('dashboardAlert', 'Session expirée, reconnectez-vous', 'error');
                setTimeout(() => {
                    localStorage.removeItem('adminToken');
                    location.reload();
                }, 2000);
            } else {
                showAlert('dashboardAlert', data.error || 'Erreur lors de l\'upload', 'error');
                console.error('Erreur détaillée:', data); // Debug
            }
        }
    } catch (error) {
        console.error('Erreur upload:', error);
        showAlert('dashboardAlert', `Erreur: ${error.message}`, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// ========================================
// CHARGER LA GALERIE
// ========================================
async function loadGallery() {
    const galleryContainer = document.getElementById('adminGallery');
    
    try {
        const response = await fetch(`${API_URL}/gallery`);
        const images = await response.json();
        
        if (images.length === 0) {
            galleryContainer.innerHTML = '<div class="loading">Aucune image dans la galerie</div>';
            return;
        }
        
        galleryContainer.innerHTML = '';
        
        images.forEach(image => {
            const item = document.createElement('div');
            item.className = 'admin-gallery-item';
            
            const categoryLabel = image.category === 'tattoo' ? 'Tatouage' : 'Gravure';
            
            // Utilise l'URL Cloudinary directement
            const imageUrl = image.url || image.path;
            
            item.innerHTML = `
                <img src="${imageUrl}" alt="${image.title || categoryLabel}">
                <div class="overlay">
                    <div class="info">
                        <strong>${image.title || categoryLabel}</strong><br>
                        ${image.description || ''}
                    </div>
                    <button class="btn btn-small btn-danger" onclick="deleteImage('${image.id}')">
                        Supprimer
                    </button>
                </div>
            `;
            
            galleryContainer.appendChild(item);
        });
        
    } catch (error) {
        console.error('Erreur chargement galerie:', error);
        galleryContainer.innerHTML = '<div class="loading" style="color: #f44336;">Erreur de chargement</div>';
    }
}

// ========================================
// SUPPRIMER UNE IMAGE
// ========================================
async function deleteImage(imageId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/image/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('dashboardAlert', 'Image supprimée avec succès', 'success');
            loadGallery();
        } else {
            if (response.status === 401 || response.status === 403) {
                showAlert('dashboardAlert', 'Session expirée, reconnectez-vous', 'error');
                setTimeout(() => {
                    localStorage.removeItem('adminToken');
                    location.reload();
                }, 2000);
            } else {
                showAlert('dashboardAlert', data.error || 'Erreur lors de la suppression', 'error');
            }
        }
    } catch (error) {
        console.error('Erreur suppression:', error);
        showAlert('dashboardAlert', 'Erreur lors de la suppression', 'error');
    }
}

// ========================================
// AFFICHER LE DASHBOARD
// ========================================
function showDashboard() {
    loginPage.style.display = 'none';
    adminDashboard.style.display = 'block';
    loadGallery();
}

// ========================================
// AFFICHER UNE ALERTE
// ========================================
function showAlert(containerId, message, type) {
    const container = document.getElementById(containerId);
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    
    container.innerHTML = `
        <div class="alert ${alertClass}">
            ${message}
        </div>
    `;
    
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// Exposer deleteImage globalement
window.deleteImage = deleteImage;