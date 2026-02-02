/**
 * Photography Portfolio - Gallery Functionality
 * Handles building gallery, filtering, lightbox, and navigation
 */

document.addEventListener('DOMContentLoaded', () => {
    // Build gallery from photos.js, then initialize components
    buildGallery();
    initMobileMenu();
    initHeaderScroll();
    initGalleryFilter();
    initLightbox();
});

/**
 * Build Gallery from MY_PHOTOS array (defined in photos.js)
 */
function buildGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid || typeof MY_PHOTOS === 'undefined') return;

    // Clear any existing content
    galleryGrid.innerHTML = '';

    // Create gallery items from photo list
    MY_PHOTOS.forEach(photo => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.category = photo.category;

        // Capitalize category for display
        const categoryDisplay = photo.category.charAt(0).toUpperCase() + photo.category.slice(1);

        item.innerHTML = `
            <img src="${photo.src}" alt="${photo.title}" loading="lazy">
            <div class="gallery-overlay">
                <h3>${photo.title}</h3>
                <p>${categoryDisplay}</p>
            </div>
        `;

        galleryGrid.appendChild(item);
    });
}

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (!menuBtn || !nav) return;

    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/**
 * Header Background on Scroll
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    const updateHeader = () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
}

/**
 * Gallery Category Filter
 */
function initGalleryFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (!filterBtns.length || !galleryItems.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            // Filter gallery items
            galleryItems.forEach(item => {
                const category = item.dataset.category;

                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                    item.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
}

/**
 * Lightbox Functionality
 */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxCategory = document.getElementById('lightbox-category');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (!lightbox || !galleryItems.length) return;

    let currentIndex = 0;
    let visibleItems = [];

    // Update visible items based on current filter
    function updateVisibleItems() {
        visibleItems = Array.from(document.querySelectorAll('.gallery-item')).filter(
            item => !item.classList.contains('hidden')
        );
    }

    // Open lightbox
    function openLightbox(index) {
        updateVisibleItems();
        currentIndex = index;
        showImage(currentIndex);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Show specific image
    function showImage(index) {
        if (index < 0 || index >= visibleItems.length) return;

        const item = visibleItems[index];
        const img = item.querySelector('img');
        const title = item.querySelector('h3');
        const category = item.querySelector('p');

        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxTitle.textContent = title ? title.textContent : '';
        lightboxCategory.textContent = category ? category.textContent : '';

        currentIndex = index;
    }

    // Navigate to previous image
    function showPrev() {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : visibleItems.length - 1;
        showImage(currentIndex);
    }

    // Navigate to next image
    function showNext() {
        currentIndex = currentIndex < visibleItems.length - 1 ? currentIndex + 1 : 0;
        showImage(currentIndex);
    }

    // Event listeners for gallery items
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            updateVisibleItems();
            const visibleIndex = visibleItems.indexOf(item);
            if (visibleIndex !== -1) {
                openLightbox(visibleIndex);
            }
        });
    });

    // Close button
    closeBtn.addEventListener('click', closeLightbox);

    // Navigation buttons
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrev();
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showNext();
    });

    // Click outside to close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPrev();
                break;
            case 'ArrowRight':
                showNext();
                break;
        }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                showNext();
            } else {
                showPrev();
            }
        }
    }
}
