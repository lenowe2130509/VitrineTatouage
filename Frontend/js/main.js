/* ========================================
   NALLA INK - CAROUSEL HORIZONTAL
   ======================================== */

const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : `http://${window.location.hostname}:3000/api`;

let currentFilter = 'all';
let allImages = [];
let isLoading = false;

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
// CAROUSEL HORIZONTAL
// ========================================

async function loadGallery(filter = 'all') {
    if (isLoading) return;
    isLoading = true;
    
    const carouselScroll = document.getElementById('carouselScroll');
    const emptyMessage = document.getElementById('emptyMessage');
    
    try {
        const response = await fetch(`${API_URL}/gallery?category=${filter}`);
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement');
        }
        
        const images = await response.json();
        allImages = images;
        
        carouselScroll.innerHTML = '';
        
        if (images.length === 0) {
            emptyMessage.style.display = 'block';
            carouselScroll.innerHTML = `
                <div class="loading">
                    <p>Aucune image disponible pour cette catégorie.</p>
                </div>
            `;
            return;
        }
        
        emptyMessage.style.display = 'none';
        
        // Créer les cartes du carousel
        images.forEach((image, index) => {
            const card = createCarouselCard(image, index);
            carouselScroll.appendChild(card);
        });
        
    } catch (error) {
        console.error('Erreur:', error);
        carouselScroll.innerHTML = `
            <div class="loading" style="color: #f44336;">
                <p>Erreur de chargement</p>
            </div>
        `;
    } finally {
        isLoading = false;
    }
}

function createCarouselCard(image, index) {
    const card = document.createElement('div');
    card.className = 'carousel-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const categoryLabel = image.category === 'tattoo' ? 'Tatouage' : 'Gravure';
    const imageUrl = image.url || `${API_URL.replace('/api', '')}${image.path}`;
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${image.title || categoryLabel}" loading="lazy">
        <div class="carousel-card-overlay">
            <span class="category-badge">${categoryLabel}</span>
            <h3>${image.title || categoryLabel}</h3>
            ${image.description ? `<p>${escapeHtml(image.description)}</p>` : ''}
        </div>
    `;
    
    // Clic pour agrandir
    card.addEventListener('click', () => {
        openModal(image, imageUrl);
    });
    
    return card;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// NAVIGATION CAROUSEL
// ========================================

const scrollLeft = document.getElementById('scrollLeft');
const scrollRight = document.getElementById('scrollRight');
const carouselScroll = document.getElementById('carouselScroll');

scrollLeft?.addEventListener('click', () => {
    carouselScroll.scrollBy({
        left: -450, // Largeur d'une carte + gap
        behavior: 'smooth'
    });
});

scrollRight?.addEventListener('click', () => {
    carouselScroll.scrollBy({
        left: 450,
        behavior: 'smooth'
    });
});

// Navigation au clavier
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        carouselScroll.scrollBy({
            left: -450,
            behavior: 'smooth'
        });
    } else if (e.key === 'ArrowRight') {
        carouselScroll.scrollBy({
            left: 450,
            behavior: 'smooth'
        });
    }
});

// Scroll avec la molette de la souris (horizontal)
carouselScroll?.addEventListener('wheel', (e) => {
    if (e.deltaY !== 0) {
        e.preventDefault();
        carouselScroll.scrollBy({
            left: e.deltaY,
            behavior: 'smooth'
        });
    }
});

// ========================================
// FILTRES
// ========================================

const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        if (isLoading) return;
        
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');
        currentFilter = filterValue;
        
        await loadGallery(filterValue);
    });
});

// ========================================
// MODAL
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
    
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

modalClose?.addEventListener('click', closeModal);

modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
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
    console.log('🎨 Nalla Ink - Carousel horizontal chargé');
    console.log('📡 API URL:', API_URL);
});