/* ========================================
   NALLA INK - ADMIN JAVASCRIPT 🔐
   ======================================== */

// Configuration API
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : `http://${window.location.hostname}:3000/api`;

// État de l'application
let authToken = localStorage.getItem('adminToken');
let currentFilter = 'all';
let deleteImageId = null;

// ========================================
// SYSTÈME DE TOAST NOTIFICATIONS
// ========================================

function showToast(message, type = 'success', title = '') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    // Définir les titres et icônes par défaut
    const config = {
        success: { title: title || 'Succès', icon: '✅' },
        error: { title: title || 'Erreur', icon: '❌' },
        info: { title: title || 'Information', icon: 'ℹ️' },
        warning: { title: title || 'Attention', icon: '⚠️' }
    };

    const toastConfig = config[type] || config.info;

    // Créer le toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-header">
            <span class="toast-icon">${toastConfig.icon}</span>
            <span class="toast-title">${toastConfig.title}</span>
        </div>
        <div class="toast-message">${message}</div>
        <div class="toast-progress"></div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // Auto-remove après 4 secondes
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 4000);

    return toast;
}

// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si l'utilisateur est déjà connecté
    if (authToken) {
        showDashboard();
    }

    // Event listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('uploadForm').addEventListener('submit', handleUpload);
    document.getElementById('imageFile').addEventListener('change', handleImagePreview);
    document.getElementById('removePreview').addEventListener('click', removeImagePreview);

    // Filtres galerie
    document.querySelectorAll('.filter-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
            e.target.closest('.filter-tab').classList.add('active');
            currentFilter = e.target.closest('.filter-tab').getAttribute('data-filter');
            loadGallery();
        });
    });

    // Modal events
    document.getElementById('modalOverlay').addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDelete').addEventListener('click', confirmDelete);
});

// ========================================
// AUTHENTIFICATION
// ========================================

async function handleLogin(e) {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');

    // Mot de passe par défaut: "nallaink2024" (à changer dans le backend)
    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('adminToken', authToken);
            errorElement.textContent = '';
            showDashboard();
        } else {
            errorElement.textContent = data.error || 'Mot de passe incorrect';
        }
    } catch (error) {
        console.error('Erreur login:', error);
        errorElement.textContent = 'Erreur de connexion au serveur';
    }
}

function handleLogout() {
    localStorage.removeItem('adminToken');
    authToken = null;
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminContainer').style.display = 'none';
    document.getElementById('loginForm').reset();
}

function showDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'block';
    loadGallery();
    loadTestimonials();
}

// ========================================
// UPLOAD IMAGE
// ========================================

function handleImagePreview(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifications
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert('Type de fichier invalide. Utilisez JPG, PNG ou WEBP');
        e.target.value = '';
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert('Fichier trop volumineux. Maximum 10MB');
        e.target.value = '';
        return;
    }

    // Afficher la preview
    const reader = new FileReader();
    reader.onload = (event) => {
        document.getElementById('previewImg').src = event.target.result;
        document.querySelector('.upload-placeholder').style.display = 'none';
        document.getElementById('imagePreview').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function removeImagePreview() {
    document.getElementById('imageFile').value = '';
    document.getElementById('previewImg').src = '';
    document.querySelector('.upload-placeholder').style.display = 'block';
    document.getElementById('imagePreview').style.display = 'none';
}

async function handleUpload(e) {
    e.preventDefault();

    const imageFile = document.getElementById('imageFile').files[0];
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;

    if (!imageFile) {
        alert('Veuillez sélectionner une image');
        return;
    }

    if (!category) {
        alert('Veuillez sélectionner une catégorie');
        return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('title', title);
    formData.append('category', category);
    formData.append('description', description);

    // Afficher un loader
    const submitBtn = document.getElementById('submitBtn');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>⏳</span> Upload en cours...';
    submitBtn.disabled = true;

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
            // Succès
            showToast('Votre création a été publiée avec succès ! Elle apparaîtra bientôt sur le site.', 'success', 'Publication réussie');
            document.getElementById('uploadForm').reset();
            removeImagePreview();
            loadGallery();
        } else {
            if (response.status === 401 || response.status === 403) {
                showToast('Votre session a expiré. Veuillez vous reconnecter.', 'error', 'Session expirée');
                handleLogout();
            } else {
                showToast(data.error || 'Une erreur est survenue lors de l\'upload', 'error');
            }
        }
    } catch (error) {
        console.error('Erreur upload:', error);
        showToast('Impossible de se connecter au serveur. Vérifiez votre connexion.', 'error', 'Erreur réseau');
    } finally {
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
    }
}

// ========================================
// GALERIE
// ========================================

async function loadGallery() {
    const galleryGrid = document.getElementById('galleryGrid');

    try {
        galleryGrid.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Chargement...</p>
            </div>
        `;

        const response = await fetch(`${API_URL}/gallery`);
        const images = await response.json();

        // Filtrer les images
        const filteredImages = currentFilter === 'all'
            ? images
            : images.filter(img => img.category === currentFilter);

        // Mettre à jour les compteurs
        const allCount = images.length;
        const tattooCount = images.filter(img => img.category === 'tattoo').length;
        const mirrorCount = images.filter(img => img.category === 'mirror').length;

        document.getElementById('countAll').textContent = allCount;
        document.getElementById('countTattoo').textContent = tattooCount;
        document.getElementById('countMirror').textContent = mirrorCount;

        // Afficher les images
        if (filteredImages.length === 0) {
            galleryGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📁</div>
                    <p>Aucune création dans cette catégorie</p>
                </div>
            `;
            return;
        }

        galleryGrid.innerHTML = '';

        filteredImages.forEach(image => {
            const item = document.createElement('div');
            item.className = 'gallery-item';

            const categoryLabel = image.category === 'tattoo' ? 'Tatouage' : 'Gravure';
            const imageUrl = image.url || `${API_URL.replace('/api', '')}${image.path}`;

            item.innerHTML = `
                <img src="${imageUrl}" alt="${image.title || categoryLabel}">
                <div class="gallery-item-overlay">
                    <div class="gallery-item-info">
                        <span class="gallery-item-category">${categoryLabel}</span>
                        <h4>${image.title || 'Sans titre'}</h4>
                        ${image.description ? `<p>${image.description}</p>` : ''}
                    </div>
                    <div class="gallery-item-actions">
                        <button class="btn-icon btn-edit" onclick="openEditModal('${image.id}')">
                            ✏️
                        </button>
                        <button class="btn-icon btn-delete" onclick="openDeleteModal('${image.id}')">
                            🗑️
                        </button>
                    </div>
                </div>
            `;

            galleryGrid.appendChild(item);
        });

    } catch (error) {
        console.error('Erreur chargement galerie:', error);
        galleryGrid.innerHTML = `
            <div class="loading" style="color: #f44336;">
                <p>❌ Erreur de chargement</p>
            </div>
        `;
    }
}

// ========================================
// SUPPRESSION
// ========================================

function openDeleteModal(imageId) {
    deleteImageId = imageId;
    document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
    deleteImageId = null;
    document.getElementById('deleteModal').style.display = 'none';
}

async function confirmDelete() {
    if (!deleteImageId) return;

    try {
        const response = await fetch(`${API_URL}/admin/image/${deleteImageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            closeDeleteModal();
            showToast('La création a été supprimée avec succès', 'success', 'Suppression réussie');
            loadGallery();
        } else {
            if (response.status === 401 || response.status === 403) {
                showToast('Votre session a expiré. Veuillez vous reconnecter.', 'error', 'Session expirée');
                handleLogout();
            } else {
                showToast(data.error || 'Impossible de supprimer cette création', 'error');
            }
        }
    } catch (error) {
        console.error('Erreur suppression:', error);
        showToast('Une erreur est survenue lors de la suppression', 'error');
    }
}

// ========================================
// GESTION DES TÉMOIGNAGES
// ========================================

let deleteTestimonialId = null;

// Toggle formulaire témoignage
document.getElementById('toggleTestimonialForm')?.addEventListener('click', () => {
    const form = document.getElementById('testimonialForm');
    if (form.style.display === 'none') {
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
        document.getElementById('testimonialForm').reset();
    }
});

// Annuler ajout témoignage
document.getElementById('cancelTestimonial')?.addEventListener('click', () => {
    document.getElementById('testimonialForm').style.display = 'none';
    document.getElementById('testimonialForm').reset();
});

// Charger les témoignages
async function loadTestimonials() {
    const grid = document.getElementById('testimonialsGrid');

    try {
        grid.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Chargement...</p>
            </div>
        `;

        const response = await fetch(`${API_URL}/testimonials`);
        const testimonials = await response.json();

        if (testimonials.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <p>Aucun témoignage pour le moment</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = '';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
        grid.style.gap = '1.5rem';

        testimonials.forEach(testimonial => {
            const card = document.createElement('div');
            card.className = 'testimonial-card-admin';

            const stars = '★'.repeat(testimonial.rating);

            card.innerHTML = `
                <div class="testimonial-header">
                    <div class="testimonial-info">
                        <h4>${escapeHtml(testimonial.clientName)}</h4>
                        <span>${escapeHtml(testimonial.service)}</span>
                    </div>
                    <div class="testimonial-stars">${stars}</div>
                </div>
                <p class="testimonial-text">"${escapeHtml(testimonial.text)}"</p>
                <div class="testimonial-actions">
                    <button class="btn-icon btn-delete" onclick="deleteTestimonialConfirm('${testimonial.id}')">
                        🗑️
                    </button>
                </div>
            `;

            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Erreur chargement témoignages:', error);
        grid.innerHTML = `
            <div class="loading" style="color: #f44336;">
                <p>❌ Erreur de chargement</p>
            </div>
        `;
    }
}

// Ajouter un témoignage
document.getElementById('testimonialForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const clientName = document.getElementById('clientName').value;
    const service = document.getElementById('clientService').value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const text = document.getElementById('testimonialText').value;

    if (!rating) {
        alert('Veuillez sélectionner une note');
        return;
    }

    const submitBtn = document.getElementById('submitTestimonial');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>⏳</span> Publication...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/admin/testimonials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                clientName,
                service,
                rating: parseInt(rating),
                text
            })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Le témoignage a été publié avec succès !', 'success', 'Publication réussie');
            document.getElementById('testimonialForm').reset();
            document.getElementById('testimonialForm').style.display = 'none';
            loadTestimonials();
        } else {
            if (response.status === 401 || response.status === 403) {
                showToast('Votre session a expiré. Veuillez vous reconnecter.', 'error', 'Session expirée');
                handleLogout();
            } else {
                showToast(data.error || 'Impossible de publier le témoignage', 'error');
            }
        }
    } catch (error) {
        console.error('Erreur publication témoignage:', error);
        showToast('Une erreur est survenue lors de la publication', 'error');
    } finally {
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
    }
});

// Supprimer un témoignage
async function deleteTestimonialConfirm(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/testimonials/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Le témoignage a été supprimé avec succès', 'success', 'Suppression réussie');
            loadTestimonials();
        } else {
            if (response.status === 401 || response.status === 403) {
                showToast('Votre session a expiré. Veuillez vous reconnecter.', 'error', 'Session expirée');
                handleLogout();
            } else {
                showToast(data.error || 'Impossible de supprimer le témoignage', 'error');
            }
        }
    } catch (error) {
        console.error('Erreur suppression témoignage:', error);
        showToast('Une erreur est survenue lors de la suppression', 'error');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Exposer les fonctions globalement pour les onclick
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.deleteTestimonialConfirm = deleteTestimonialConfirm;
