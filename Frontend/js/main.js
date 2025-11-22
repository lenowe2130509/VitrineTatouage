/* ========================================
   NALLA INK - JAVASCRIPT INCROYABLE 🔥
   ======================================== */

const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : `http://${window.location.hostname}:3000/api`;

let currentFilter = 'all';
let allImages = [];
let isLoading = false;

// ========================================
// RIDEAU D'OUVERTURE 🎭
// ========================================

window.addEventListener('load', () => {
    // Attendre un peu puis ouvrir le rideau
    setTimeout(() => {
        document.body.classList.add('loaded');
        
        // Retirer le rideau du DOM après l'animation
        setTimeout(() => {
            const curtain = document.querySelector('.curtain');
            if (curtain) {
                curtain.remove();
            }
        }, 1500);
    }, 2000); // 2 secondes de chargement
});

// ========================================
// MENU BURGER MOBILE
// ========================================

const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Fermer le menu quand on clique sur un lien
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Fermer le menu si on clique ailleurs
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}

// ========================================
// NAVBAR SCROLL
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
// COUNTER ANIMATION (Stats)
// ========================================

function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Déclencher l'animation quand on scroll vers les stats
const observerOptions = {
    threshold: 0.5
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                animateCounter(stat, target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

const aboutSection = document.querySelector('.about-stats');
if (aboutSection) {
    statsObserver.observe(aboutSection);
}

// ========================================
// GALERIE & CAROUSEL
// ========================================

async function loadGallery(category = 'all') {
    if (isLoading) return;
    isLoading = true;
    
    const carouselTrack = document.getElementById('carouselTrack');
    const emptyMessage = document.getElementById('emptyMessage');
    
    try {
        carouselTrack.classList.add('transitioning');
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Charger TOUTES les images pour mettre à jour les compteurs
        const allImagesResponse = await fetch(`${API_URL}/gallery`);
        const allImagesData = await allImagesResponse.json();
        
        // Mettre à jour les compteurs avec TOUTES les images
        updateFilterCounts(allImagesData);
        
        // Ensuite charger les images filtrées
        const url = category === 'all' 
            ? `${API_URL}/gallery` 
            : `${API_URL}/gallery?category=${category}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement');
        }
        
        const images = await response.json();
        allImages = images;
        
        carouselTrack.innerHTML = '';
        
        if (images.length === 0) {
            emptyMessage.style.display = 'block';
            carouselTrack.innerHTML = `
                <div class="loading">
                    <p>Aucune création disponible</p>
                </div>
            `;
            carouselTrack.classList.remove('transitioning');
            return;
        }
        
        emptyMessage.style.display = 'none';
        
        images.forEach((image, index) => {
            const card = createCarouselCard(image, index);
            carouselTrack.appendChild(card);
        });
        
        carouselTrack.classList.remove('transitioning');
        
    } catch (error) {
        console.error('Erreur:', error);
        carouselTrack.innerHTML = `
            <div class="loading" style="color: #f44336;">
                <p>Erreur de chargement</p>
            </div>
        `;
        carouselTrack.classList.remove('transitioning');
    } finally {
        isLoading = false;
    }
}

function createCarouselCard(image, index) {
    const card = document.createElement('div');
    card.className = 'carousel-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const categoryLabel = image.category === 'tattoo' ? 'TATOUAGE' : 'GRAVURE';
    const imageUrl = image.url || `${API_URL.replace('/api', '')}${image.path}`;
    const title = image.title || categoryLabel;
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${escapeHtml(title)}" loading="lazy">
        <div class="carousel-info">
            <span class="category-badge">${categoryLabel}</span>
            <h3>${escapeHtml(title)}</h3>
            ${image.description ? `<p>${escapeHtml(image.description)}</p>` : ''}
        </div>
    `;
    
    card.addEventListener('click', () => {
        openModal(image, imageUrl, categoryLabel);
    });
    
    return card;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateFilterCounts(allImages) {
    const totalCount = allImages.length;
    const tattooCount = allImages.filter(img => img.category === 'tattoo').length;
    const mirrorCount = allImages.filter(img => img.category === 'mirror').length;
    
    document.getElementById('count-all').textContent = totalCount;
    document.getElementById('count-tattoo').textContent = tattooCount;
    document.getElementById('count-mirror').textContent = mirrorCount;
}

// ========================================
// FILTRES
// ========================================

const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        if (isLoading) return;
        
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-category');
        currentFilter = category;
        
        await loadGallery(category);
        
        const carouselTrack = document.getElementById('carouselTrack');
        carouselTrack.scrollTo({ left: 0, behavior: 'smooth' });
    });
});

// ========================================
// NAVIGATION CAROUSEL
// ========================================

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const carouselTrack = document.getElementById('carouselTrack');

prevBtn?.addEventListener('click', () => {
    carouselTrack.scrollBy({
        left: -500,
        behavior: 'smooth'
    });
});

nextBtn?.addEventListener('click', () => {
    carouselTrack.scrollBy({
        left: 500,
        behavior: 'smooth'
    });
});

// Navigation clavier
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('imageModal');
    
    if (modal.style.display === 'block') {
        if (e.key === 'Escape') {
            closeModal();
        }
        return;
    }
    
    if (e.key === 'ArrowLeft') {
        carouselTrack.scrollBy({ left: -500, behavior: 'smooth' });
    } else if (e.key === 'ArrowRight') {
        carouselTrack.scrollBy({ left: 500, behavior: 'smooth' });
    }
});

// Scroll horizontal avec molette
carouselTrack?.addEventListener('wheel', (e) => {
    if (e.deltaY !== 0) {
        e.preventDefault();
        carouselTrack.scrollBy({
            left: e.deltaY * 2,
            behavior: 'smooth'
        });
    }
}, { passive: false });

// ========================================
// MODAL
// ========================================

const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const modalClose = document.getElementById('modalClose');

function openModal(image, imageUrl, categoryLabel) {
    modal.style.display = 'block';
    modalImg.src = imageUrl;
    
    modalCaption.innerHTML = `
        <h3>${escapeHtml(image.title || categoryLabel)}</h3>
        ${image.description ? `<p>${escapeHtml(image.description)}</p>` : ''}
    `;
    
    document.body.style.overflow = 'hidden';
    
    // Animation d'entrée
    setTimeout(() => {
        modal.style.animation = 'fadeIn 0.3s ease';
    }, 10);
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

modalClose?.addEventListener('click', closeModal);

modal?.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal-bg')) {
        closeModal();
    }
});

// ========================================
// PARALLAX SCROLL EFFECTS
// ========================================

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    // Parallax sur le hero background
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
    
    // Effet sur les section-bg-text
    document.querySelectorAll('.section-bg-text').forEach(text => {
        const rect = text.getBoundingClientRect();
        const offset = (window.innerHeight - rect.top) * 0.1;
        text.style.transform = `translate(-50%, -50%) translateX(${offset}px)`;
    });
});

// ========================================
// ANIMATIONS AU SCROLL
// ========================================

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .contact-card').forEach(el => {
    revealObserver.observe(el);
});

// ========================================
// EASTER EGG - Triple clic sur le logo
// ========================================

let logoClickCount = 0;
let logoClickTimer = null;

document.querySelector('.logo')?.addEventListener('click', () => {
    logoClickCount++;
    
    if (logoClickTimer) {
        clearTimeout(logoClickTimer);
    }
    
    if (logoClickCount === 3) {
        // 🎉 Easter Egg!
        document.body.style.animation = 'rainbow 2s ease infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
        logoClickCount = 0;
    }
    
    logoClickTimer = setTimeout(() => {
        logoClickCount = 0;
    }, 500);
});

// CSS pour l'easter egg
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ========================================
// AUTO-REFRESH pour détecter les changements
// ========================================

let autoRefreshInterval;

function startAutoRefresh() {
    // Rafraîchir la galerie toutes les 5 secondes
    autoRefreshInterval = setInterval(async () => {
        if (!isLoading) {
            // Charger silencieusement pour mettre à jour les compteurs
            try {
                const response = await fetch(`${API_URL}/gallery`);
                const newImages = await response.json();
                
                // Vérifier si le nombre d'images a changé
                const currentCount = allImages.length;
                const newCount = newImages.length;
                
                if (currentCount !== newCount) {
                    console.log('🔄 Changement détecté! Rafraîchissement...');
                    await loadGallery(currentFilter);
                }
            } catch (error) {
                console.error('Erreur auto-refresh:', error);
            }
        }
    }, 5000); // Toutes les 5 secondes
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
}

// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Charger la galerie
    loadGallery('all');
    
    // Démarrer l'auto-refresh
    startAutoRefresh();
    
    console.log('🎨 Nalla Ink - Site chargé avec succès!');
    console.log('📡 API:', API_URL);
    console.log('🔄 Auto-refresh activé (5s)');
    console.log('✨ Développé avec passion par Claude');
});

// Arrêter l'auto-refresh quand on quitte la page
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});

// ========================================
// GESTION DES ERREURS
// ========================================

window.addEventListener('error', (e) => {
    console.error('💥 Erreur:', e.message);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('💥 Promise rejetée:', e.reason);
});