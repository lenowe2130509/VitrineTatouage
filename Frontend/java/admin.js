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

// Login
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
            showAlert('loginAlert', data.error || 'Erreur de connexion', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('loginAlert', 'Erreur de connexion au serveur', 'error');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    authToken = null;
    loginPage.style.display = 'flex';
    adminDashboard.style.display = 'none';
    loginForm.reset();
});

// Preview de l'image
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Upload d'image
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    const imageFile = imageInput.files[0];
    
    if (!imageFile) {
        showAlert('dashboardAlert', 'Veuillez sélectionner une image', 'error');
        return;
    }
    
    // Vérifier la taille du fichier (5MB max)
    if (imageFile.size > 5 * 1024 * 1024) {
        showAlert('dashboardAlert', 'L\'image est trop volumineuse (max 5MB)', 'error');
        return;
    }
    
    formData.append('image', imageFile);
    formData.append('category', document.getElementById('category').value);
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    
    try {
        const response = await fetch(`${API_URL}/admin/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('dashboardAlert', 'Image uploadée avec succès!', 'success');
            uploadForm.reset();
            previewImage.style.display = 'none';
            loadGallery(); // Recharger la galerie
        } else {
            if (response.status === 401 || response.status === 403) {
                showAlert('dashboardAlert', 'Session expirée, veuillez vous reconnecter', 'error');
                setTimeout(() => {
                    localStorage.removeItem('adminToken');
                    location.reload();
                }, 2000);
            } else {
                showAlert('dashboardAlert', data.error || 'Erreur lors de l\'upload', 'error');
            }
        }
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('dashboardAlert', 'Erreur lors de l\'upload', 'error');
    }
});

// Charger la galerie admin
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
            
            item.innerHTML = `
                <img src="${API_URL.replace('/api', '')}${image.path}" alt="${image.title || categoryLabel}">
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
        console.error('Erreur:', error);
        galleryContainer.innerHTML = '<div class="loading" style="color: #f44336;">Erreur de chargement</div>';
    }
}

// Supprimer une image
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
            loadGallery(); // Recharger la galerie
        } else {
            if (response.status === 401 || response.status === 403) {
                showAlert('dashboardAlert', 'Session expirée, veuillez vous reconnecter', 'error');
                setTimeout(() => {
                    localStorage.removeItem('adminToken');
                    location.reload();
                }, 2000);
            } else {
                showAlert('dashboardAlert', data.error || 'Erreur lors de la suppression', 'error');
            }
        }
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('dashboardAlert', 'Erreur lors de la suppression', 'error');
    }
}

// Afficher le dashboard
function showDashboard() {
    loginPage.style.display = 'none';
    adminDashboard.style.display = 'block';
    loadGallery();
}

// Afficher une alerte
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