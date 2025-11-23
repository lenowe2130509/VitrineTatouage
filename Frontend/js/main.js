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
// NAVBAR SCROLL (Optimisé avec debounce)
// ========================================

let navbarScrollTimeout;
let ticking = false;

function updateNavbar() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateNavbar);
        ticking = true;
    }
}, { passive: true });

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

async function loadGallery(category = 'all', showTransition = false) {
    if (isLoading) return;
    isLoading = true;

    const carouselTrack = document.getElementById('carouselTrack');
    const emptyMessage = document.getElementById('emptyMessage');

    try {
        // Ajouter l'effet de transition seulement si demandé (changement de filtre)
        if (showTransition) {
            carouselTrack.classList.add('transitioning');
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
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
        originalImagesCount = images.length;

        carouselTrack.innerHTML = '';

        if (images.length === 0) {
            emptyMessage.style.display = 'block';
            carouselTrack.innerHTML = `
                <div class="loading">
                    <p>Aucune création disponible</p>
                </div>
            `;
            if (showTransition) {
                carouselTrack.classList.remove('transitioning');
            }
            return;
        }

        emptyMessage.style.display = 'none';

        // Dupliquer les images plusieurs fois pour créer une boucle infinie vraiment seamless
        // On crée assez de copies pour que le reset soit invisible
        const duplicateCount = 10; // Plus de duplications pour une boucle plus fluide

        for (let i = 0; i < duplicateCount; i++) {
            images.forEach((image, index) => {
                const card = createCarouselCard(image, index, i > 0);
                carouselTrack.appendChild(card);
            });
        }

        if (showTransition) {
            carouselTrack.classList.remove('transitioning');
        }

    } catch (error) {
        console.error('Erreur:', error);
        carouselTrack.innerHTML = `
            <div class="loading" style="color: #f44336;">
                <p>Erreur de chargement</p>
            </div>
        `;
        if (showTransition) {
            carouselTrack.classList.remove('transitioning');
        }
    } finally {
        isLoading = false;
    }
}

function createCarouselCard(image, index, isDuplicate = false) {
    const card = document.createElement('div');
    card.className = 'carousel-card';
    if (!isDuplicate) {
        card.style.animationDelay = `${index * 0.1}s`;
    }

    const categoryLabel = image.category === 'tattoo' ? 'TATOUAGE' : 'GRAVURE';
    const imageUrl = image.url || `${API_URL.replace('/api', '')}${image.path}`;
    const title = image.title || categoryLabel;

    // Créer l'image avec lazy loading natif
    const img = document.createElement('img');
    img.src = imageUrl; // Charger l'image immédiatement
    img.alt = escapeHtml(title);
    img.loading = 'eager'; // Charger les premières images immédiatement
    img.decoding = 'async';
    img.style.backgroundColor = '#1a1a1a';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'carousel-info';
    infoDiv.innerHTML = `
        <span class="category-badge">${categoryLabel}</span>
        <h3>${escapeHtml(title)}</h3>
        ${image.description ? `<p>${escapeHtml(image.description)}</p>` : ''}
    `;

    card.appendChild(img);
    card.appendChild(infoDiv);

    card.addEventListener('click', () => {
        openModal(image, imageUrl, categoryLabel);
    }, { passive: true });

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

        await loadGallery(category, true); // true = montrer la transition lors du changement de filtre

        const carouselTrack = document.getElementById('carouselTrack');
        carouselTrack.scrollTo({ left: 0, behavior: 'smooth' });

        // Réinitialiser l'index et l'auto-play
        currentCarouselIndex = 0;
        stopCarouselAutoPlay();
        setTimeout(() => {
            startCarouselAutoPlay();
        }, 2000);
    });
});

// ========================================
// NAVIGATION CAROUSEL
// ========================================

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const carouselTrack = document.getElementById('carouselTrack');

prevBtn?.addEventListener('click', () => {
    const firstCard = document.querySelector('.carousel-card');
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const gap = parseInt(getComputedStyle(carouselTrack).gap) || 32;

    carouselTrack.scrollBy({
        left: -(cardWidth + gap),
        behavior: 'smooth'
    });
});

nextBtn?.addEventListener('click', () => {
    const firstCard = document.querySelector('.carousel-card');
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const gap = parseInt(getComputedStyle(carouselTrack).gap) || 32;

    carouselTrack.scrollBy({
        left: cardWidth + gap,
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

    const firstCard = document.querySelector('.carousel-card');
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const gap = parseInt(getComputedStyle(carouselTrack).gap) || 32;

    if (e.key === 'ArrowLeft') {
        carouselTrack.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
    } else if (e.key === 'ArrowRight') {
        carouselTrack.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
    }
});

// Scroll horizontal avec molette (désactivé sur mobile pour performances)
if (!isMobile) {
    carouselTrack?.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            carouselTrack.scrollBy({
                left: e.deltaY * 2,
                behavior: 'smooth'
            });
        }
    }, { passive: false });
}

// Améliorer le toucher sur mobile avec touch events
if (isMobile && carouselTrack) {
    let touchStartX = 0;
    let touchEndX = 0;

    carouselTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            const firstCard = document.querySelector('.carousel-card');
            if (!firstCard) return;

            const cardWidth = firstCard.offsetWidth;
            const gap = parseInt(getComputedStyle(carouselTrack).gap) || 32;

            if (diff > 0) {
                // Swipe left - next
                carouselTrack.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
            } else {
                // Swipe right - previous
                carouselTrack.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
            }
        }
    }
}

// ========================================
// EFFET DE PREVIEW DES CARTES ADJACENTES
// ========================================

function updateCarouselPerspective() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;

    // Réduire les effets 3D sur mobile pour meilleures performances
    if (isMobile || prefersReducedMotion) {
        return;
    }

    const cards = track.querySelectorAll('.carousel-card');
    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;

    cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distanceFromCenter = Math.abs(cardCenter - trackCenter);
        const maxDistance = trackRect.width / 2;
        const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);

        // Calculer l'échelle (les cartes au centre sont plus grandes)
        const scale = 1 - (normalizedDistance * 0.15);

        // Calculer l'opacité (les cartes au centre sont plus visibles)
        const opacity = 1 - (normalizedDistance * 0.3);

        // Calculer la rotation 3D (avec will-change pour performance)
        const direction = cardCenter < trackCenter ? 1 : -1;
        const rotateY = normalizedDistance * 8 * direction;

        // Appliquer les transformations avec translate3d pour hardware acceleration
        card.style.transform = `translate3d(0, 0, 0) scale(${scale}) rotateY(${rotateY}deg)`;
        card.style.opacity = opacity;
        card.style.filter = `brightness(${0.7 + (0.3 * (1 - normalizedDistance))})`;
    });
}

// Mettre à jour l'effet au scroll (optimisé avec throttle)
let perspectiveTicking = false;

carouselTrack?.addEventListener('scroll', () => {
    if (!perspectiveTicking) {
        window.requestAnimationFrame(() => {
            updateCarouselPerspective();
            perspectiveTicking = false;
        });
        perspectiveTicking = true;
    }
}, { passive: true });

// Mettre à jour l'effet lors du chargement des images
const originalLoadGallery = loadGallery;
loadGallery = async function(category = 'all') {
    await originalLoadGallery.call(this, category);
    setTimeout(updateCarouselPerspective, 100);
};

// ========================================
// AUTO-PLAY CAROUSEL AVEC BOUCLE INFINIE
// ========================================

let carouselAutoPlayInterval = null;
let isUserInteracting = false;
let currentCarouselIndex = 0;
let originalImagesCount = 0;

function scrollCarouselNext() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;

    const cards = track.querySelectorAll('.carousel-card');
    if (cards.length === 0 || originalImagesCount === 0) return;

    const firstCard = cards[0];
    const cardWidth = firstCard.offsetWidth;
    const gap = parseInt(getComputedStyle(track).gap) || 32;
    const scrollAmount = cardWidth + gap;

    // Incrémenter l'index (continue toujours +1)
    currentCarouselIndex++;

    // Calculer la position cible
    const targetScroll = currentCarouselIndex * scrollAmount;

    // Défiler vers la position cible
    track.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
    });

    // Vérifier si on doit réinitialiser discrètement la position
    setTimeout(() => {
        checkAndResetCarouselPosition();
    }, 650);
}

function checkAndResetCarouselPosition() {
    const track = document.getElementById('carouselTrack');
    if (!track || originalImagesCount === 0) return;

    const firstCard = document.querySelector('.carousel-card');
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const gap = parseInt(getComputedStyle(track).gap) || 32;
    const scrollAmount = cardWidth + gap;

    const totalCards = track.querySelectorAll('.carousel-card').length;
    const midPoint = Math.floor(totalCards / 2);

    // Si on approche de la fin des cartes dupliquées, reset au milieu pour continuer
    if (currentCarouselIndex >= totalCards - originalImagesCount) {
        // Calculer quelle image on affiche (dans la séquence originale)
        const imageInSequence = currentCarouselIndex % originalImagesCount;

        // Reset au milieu du carousel pour avoir du buffer des deux côtés
        const newIndex = midPoint + imageInSequence;
        currentCarouselIndex = newIndex;

        // Reset sans animation (imperceptible car on est sur la même image)
        track.scrollTo({
            left: newIndex * scrollAmount,
            behavior: 'auto'
        });
    }
}

function startCarouselAutoPlay() {
    // Arrêter l'intervalle existant s'il y en a un
    if (carouselAutoPlayInterval) {
        clearInterval(carouselAutoPlayInterval);
    }

    // Démarrer l'auto-play toutes les 5 secondes
    carouselAutoPlayInterval = setInterval(() => {
        if (!isUserInteracting) {
            scrollCarouselNext();
        }
    }, 5000);
}

function stopCarouselAutoPlay() {
    if (carouselAutoPlayInterval) {
        clearInterval(carouselAutoPlayInterval);
        carouselAutoPlayInterval = null;
    }
}

function resetCarouselAutoPlay() {
    stopCarouselAutoPlay();
    // Attendre 10 secondes après une interaction avant de redémarrer
    setTimeout(() => {
        if (!isUserInteracting) {
            startCarouselAutoPlay();
        }
    }, 10000);
}

// Marquer comme interagissant quand l'utilisateur utilise les boutons
prevBtn?.addEventListener('click', () => {
    isUserInteracting = true;
    resetCarouselAutoPlay();
    setTimeout(() => { isUserInteracting = false; }, 1000);
});

nextBtn?.addEventListener('click', () => {
    isUserInteracting = true;
    resetCarouselAutoPlay();
    setTimeout(() => { isUserInteracting = false; }, 1000);
});

// Mettre à jour l'index lors du scroll manuel
let scrollTimeout;
carouselTrack?.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        const track = document.getElementById('carouselTrack');
        if (!track) return;

        const firstCard = document.querySelector('.carousel-card');
        if (!firstCard) return;

        const cardWidth = firstCard.offsetWidth;
        const gap = parseInt(getComputedStyle(track).gap) || 32;
        const scrollAmount = cardWidth + gap;

        // Calculer l'index actuel basé sur la position de scroll
        currentCarouselIndex = Math.round(track.scrollLeft / scrollAmount);

        // Vérifier si on doit réinitialiser la position
        checkAndResetCarouselPosition();
    }, 150);
}, { passive: true });

// Pause pendant le hover
carouselTrack?.addEventListener('mouseenter', () => {
    isUserInteracting = true;
});

carouselTrack?.addEventListener('mouseleave', () => {
    isUserInteracting = false;
});

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
// PARALLAX SCROLL EFFECTS (Optimisé)
// ========================================

let parallaxTicking = false;

// Détecter si on est sur mobile pour réduire les effets
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateParallax() {
    // Désactiver parallax sur mobile ou si préférence pour animations réduites
    if (isMobile || prefersReducedMotion) {
        parallaxTicking = false;
        return;
    }

    const scrolled = window.pageYOffset;

    // Parallax sur le hero background (optimisé avec transform)
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        heroBg.style.transform = `translate3d(0, ${scrolled * 0.5}px, 0)`;
    }

    // Effet sur les section-bg-text
    document.querySelectorAll('.section-bg-text').forEach(text => {
        const rect = text.getBoundingClientRect();
        const offset = (window.innerHeight - rect.top) * 0.1;
        text.style.transform = `translate3d(-50%, -50%, 0) translateX(${offset}px)`;
    });

    parallaxTicking = false;
}

window.addEventListener('scroll', () => {
    if (!parallaxTicking) {
        window.requestAnimationFrame(updateParallax);
        parallaxTicking = true;
    }
}, { passive: true });

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
// CHARGER LES TÉMOIGNAGES
// ========================================

async function loadPublicTestimonials() {
    const grid = document.getElementById('testimonialsGridPublic');
    if (!grid) return;

    try {
        const response = await fetch(`${API_URL}/testimonials`);
        const testimonials = await response.json();

        if (testimonials.length === 0) {
            // Afficher les témoignages par défaut si aucun dans la DB
            grid.innerHTML = `
                <div class="testimonial-card">
                    <div class="stars">★★★★★</div>
                    <p class="testimonial-text">"Un vrai artiste ! Mon tatouage est exactement comme je l'imaginais, voire mieux. L'ambiance du studio est top et Nalla met vraiment à l'aise."</p>
                    <div class="testimonial-author">
                        <div class="author-info">
                            <h4>Sarah M.</h4>
                            <span>Tatouage floral - Avant-bras</span>
                        </div>
                    </div>
                </div>

                <div class="testimonial-card">
                    <div class="stars">★★★★★</div>
                    <p class="testimonial-text">"Ma gravure sur miroir est une œuvre d'art ! Le travail est d'une précision incroyable. Je recommande les yeux fermés."</p>
                    <div class="testimonial-author">
                        <div class="author-info">
                            <h4>Marc L.</h4>
                            <span>Gravure personnalisée</span>
                        </div>
                    </div>
                </div>

                <div class="testimonial-card">
                    <div class="stars">★★★★★</div>
                    <p class="testimonial-text">"Hygiène irréprochable, écoute et professionnalisme au rendez-vous. Mon premier tatouage et certainement pas le dernier !"</p>
                    <div class="testimonial-author">
                        <div class="author-info">
                            <h4>Julie K.</h4>
                            <span>Premier tatouage - Épaule</span>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        // Afficher les témoignages de la base de données
        grid.innerHTML = '';

        // Limiter à 6 témoignages max pour ne pas surcharger
        const displayTestimonials = testimonials.slice(0, 6);

        displayTestimonials.forEach(testimonial => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';

            const stars = '★'.repeat(testimonial.rating);

            card.innerHTML = `
                <div class="stars">${stars}</div>
                <p class="testimonial-text">"${escapeHtml(testimonial.text)}"</p>
                <div class="testimonial-author">
                    <div class="author-info">
                        <h4>${escapeHtml(testimonial.clientName)}</h4>
                        <span>${escapeHtml(testimonial.service)}</span>
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Erreur chargement témoignages publics:', error);
        // En cas d'erreur, afficher les témoignages par défaut
        grid.innerHTML = `
            <div class="testimonial-card">
                <div class="stars">★★★★★</div>
                <p class="testimonial-text">"Un vrai artiste ! Mon tatouage est exactement comme je l'imaginais, voire mieux."</p>
                <div class="testimonial-author">
                    <div class="author-info">
                        <h4>Sarah M.</h4>
                        <span>Tatouage floral</span>
                    </div>
                </div>
            </div>
        `;
    }
}

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
// FAQ ACCORDION
// ========================================

function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;

            // Fermer tous les autres items
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                }
            });

            // Toggle l'item cliqué
            faqItem.classList.toggle('active');
        });
    });
}

// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le FAQ
    initFAQ();

    // Charger les témoignages
    loadPublicTestimonials();

    // Charger la galerie
    loadGallery('all').then(() => {
        // Démarrer au milieu du carousel pour avoir du buffer
        const cards = document.querySelectorAll('.carousel-card');
        if (cards.length > 0) {
            const midPoint = Math.floor(cards.length / 2);
            currentCarouselIndex = midPoint;

            const firstCard = cards[0];
            const cardWidth = firstCard.offsetWidth;
            const gap = parseInt(getComputedStyle(document.getElementById('carouselTrack')).gap) || 32;
            const scrollAmount = cardWidth + gap;

            // Positionner au milieu sans animation
            document.getElementById('carouselTrack').scrollTo({
                left: midPoint * scrollAmount,
                behavior: 'auto'
            });
        }

        // Démarrer l'auto-play du carousel après le chargement
        setTimeout(() => {
            startCarouselAutoPlay();
        }, 2000);
    });

    // Démarrer l'auto-refresh
    startAutoRefresh();

    console.log('🎨 Nalla Ink - Site chargé avec succès!');
    console.log('📡 API:', API_URL);
    console.log('🔄 Auto-refresh activé (5s)');
    console.log('🎠 Carousel auto-play activé (5s) - Boucle infinie seamless');
    console.log('✨ Développé avec passion par Claude');
});

// Arrêter l'auto-refresh et l'auto-play quand on quitte la page
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
    stopCarouselAutoPlay();
});

// ========================================
// FORMULAIRE TÉMOIGNAGE PUBLIC
// ========================================

const testimonialModal = document.getElementById('testimonialModal');
const openTestimonialBtn = document.getElementById('openTestimonialForm');
const closeTestimonialBtn = document.getElementById('closeTestimonialModal');
const testimonialModalOverlay = document.getElementById('testimonialModalOverlay');
const cancelPublicTestimonialBtn = document.getElementById('cancelPublicTestimonial');
const publicTestimonialForm = document.getElementById('publicTestimonialForm');

// Ouvrir la modal
if (openTestimonialBtn) {
    openTestimonialBtn.addEventListener('click', () => {
        testimonialModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
}

// Fermer la modal
function closeTestimonialModal() {
    testimonialModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    if (publicTestimonialForm) {
        publicTestimonialForm.reset();
    }
}

if (closeTestimonialBtn) {
    closeTestimonialBtn.addEventListener('click', closeTestimonialModal);
}

if (cancelPublicTestimonialBtn) {
    cancelPublicTestimonialBtn.addEventListener('click', closeTestimonialModal);
}

if (testimonialModalOverlay) {
    testimonialModalOverlay.addEventListener('click', closeTestimonialModal);
}

// Soumettre le formulaire
if (publicTestimonialForm) {
    publicTestimonialForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const clientName = document.getElementById('clientNamePublic').value;
        const service = document.getElementById('clientServicePublic').value;
        const rating = document.querySelector('input[name="rating"]:checked')?.value;
        const text = document.getElementById('testimonialTextPublic').value;

        // Validation
        if (!rating) {
            alert('Veuillez sélectionner une note');
            return;
        }

        if (text.length < 20) {
            alert('Votre témoignage doit contenir au moins 20 caractères');
            return;
        }

        const submitBtn = document.getElementById('submitPublicTestimonial');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>⏳</span> Envoi en cours...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/testimonials/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
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
                alert('✅ Merci beaucoup pour votre témoignage !\n\nVotre avis sera vérifié et publié sous peu.');
                closeTestimonialModal();
                // Recharger les témoignages
                loadPublicTestimonials();
            } else {
                alert(data.error || 'Une erreur est survenue lors de l\'envoi de votre témoignage');
            }
        } catch (error) {
            console.error('Erreur soumission témoignage:', error);
            alert('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
        } finally {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }
    });
}

// ========================================
// GESTION DES ERREURS
// ========================================

window.addEventListener('error', (e) => {
    console.error('💥 Erreur:', e.message);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('💥 Promise rejetée:', e.reason);
});