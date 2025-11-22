/* ========================================
   NALLA INK - MAIN JAVASCRIPT
   ======================================== */

// Configuration - IMPORTANT: Changez cette URL pour votre domaine en production
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api'; // En production

// ========================================
// SMOOTH SCROLL
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    });
});

// ========================================
// NAVBAR SCROLL EFFECT
// ========================================

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ========================================
// GALLERY
// ========================================

let currentFilter = 'all';
let allImages = [];

// Charger la galerie
async function loadGallery(filter = 'all') {
    const galleryGrid = document.getElementById('galleryGrid');
    const emptyMessage = document.getElementById('emptyMessage');
    
    try {
        const response = await fetch(`${API_URL}/gallery?category=${filter}`);
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement');
        }
        
        const images = await response.json();
        allImages = images;
        
        // Si aucune image
        if (images.length === 0) {
            galleryGrid.innerHTML = '';
            emptyMessage.style.display = 'block';
            return;
        }
        
        emptyMessage.style.display = 'none';
        galleryGrid.innerHTML = '';
        
        // Créer les éléments de galerie
        images.forEach((image, index) => {
            const item = createGalleryItem(image, index);
            galleryGrid.appendChild(item);
        });
        
    } catch (error) {
        console.error('Erreur chargement galerie:', error);
        galleryGrid.innerHTML = `
            <div class="loading" style="color: var(--error);">
                <p>Erreur lors du chargement de la galerie.</p>
                <p style="font-size: 0.9rem; margin-top: 1rem;">
                    Assurez-vous que le serveur est démarré.
                </p>
            </div>
        `;
    }
}

// Créer un élément de galerie
function createGalleryItem(image, index) {
    const item = document.createElement('article');
    item.className = 'gallery-item';
    item.dataset.category = image.category;
    item.style.animationDelay = `${index * 0.1}s`;
    
    const categoryLabel = image.category === 'tattoo' ? 'Tatouage' : 'Gravure';
    
    // Pour Cloudinary: l'URL est directement dans image.url
    // Pour backend local: l'URL est dans image.path
    const imageUrl = image.url || `${API_URL.replace('/api', '')}${image.path}`;
    
    item.innerHTML = `
        <span class="category-badge">${categoryLabel}</span>
        <img src="${imageUrl}" 
             alt="${image.title || categoryLabel}"
             loading="lazy">
        <div class="gallery-overlay">
            <h3>${image.title || categoryLabel}</h3>
            ${image.description ? `<p>${escapeHtml(image.description)}</p>` : ''}
        </div>
    `;
    
    // Clic pour agrandir
    item.addEventListener('click', () => {
        openModal(image, imageUrl);
    });
    
    return item;
}

// Escape HTML pour sécurité
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// FILTRES
// ========================================

const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        // Mettre à jour les boutons actifs
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');
        currentFilter = filterValue;
        
        await loadGallery(filterValue);
    });
});

// ========================================
// MODAL IMAGE
// ========================================

const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const modalClose = document.querySelector('.modal-close');

function openModal(image, imageUrl) {
    modal.style.display = 'block';
    modalImg.src = imageUrl;
    
    const categoryLabel = image.category === 'tattoo' ? 'Tatouage' : 'Gravure';
    
    modalCaption.innerHTML = `
        <h3>${image.title || categoryLabel}</h3>
        ${image.description ? `<p>${escapeHtml(image.description)}</p>` : ''}
    `;
    
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Événements de fermeture
modalClose.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});

// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    loadGallery('all');
    
    // Log pour debug
    console.log('🎨 Nalla Ink - Site chargé');
    console.log('📡 API URL:', API_URL);
});