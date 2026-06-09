document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // DYNAMIC HERO HERO VIDEO LOADER (AVOID DOUBLE DOWNLOAD)
  // ==========================================================================
  const desktopVideo = document.querySelector('.hero-video-desktop');
  const mobileVideo = document.querySelector('.hero-video-mobile');
  
  if (desktopVideo && mobileVideo) {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      desktopVideo.remove();
      mobileVideo.setAttribute('preload', 'auto');
      mobileVideo.autoplay = true;
      mobileVideo.load();
      mobileVideo.play().catch(err => console.log('Autoplay blocked:', err));
    } else {
      mobileVideo.remove();
      desktopVideo.setAttribute('preload', 'auto');
      desktopVideo.autoplay = true;
      desktopVideo.load();
      desktopVideo.play().catch(err => console.log('Autoplay blocked:', err));
    }
  }

  // ==========================================================================
  // STICKY HEADER & NAV HIGHLIGHT
  // ==========================================================================
  const header = document.querySelector('header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const handleScroll = () => {
    // Sticky Header
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active Section Link Highlight
    let currentId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Trigger initial check

  // ==========================================================================
  // MOBILE MENU TOGGLE
  // ==========================================================================
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-links');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      
      // Toggle burger menu icon transformation
      const spans = mobileToggle.querySelectorAll('span');
      if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'translateY(9px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-9px) rotate(-45deg)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close mobile menu on clicking nav link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = mobileToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }

  // ==========================================================================
  // SCROLL REVEAL ANIMATION (INTERSECTION OBSERVER)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // ==========================================================================
  // PORTFOLIO FILTER SYSTEM
  // ==========================================================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  const portfolioGrid = document.querySelector('.portfolio-grid');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Set active button class
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filterValue = button.getAttribute('data-filter');

      // Toggle filtering class
      if (portfolioGrid) {
        if (filterValue === 'all') {
          portfolioGrid.classList.remove('filtering');
        } else {
          portfolioGrid.classList.add('filtering');
        }
      }

      portfolioItems.forEach(item => {
        item.style.transform = 'scale(0.85)';
        item.style.opacity = '0';
        
        setTimeout(() => {
          if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
            item.classList.remove('hidden');
            setTimeout(() => {
              item.style.transform = 'scale(1)';
              item.style.opacity = '1';
            }, 50);
          } else {
            item.classList.add('hidden');
          }
        }, 300);
      });
    });
  });

  // Check if original images have loaded in portfolio items
  portfolioItems.forEach(item => {
    const img = item.querySelector('img');
    if (img) {
      // Check if image source is set and exists
      img.addEventListener('load', () => {
        item.classList.add('has-img');
      });
      // Handle cached images
      if (img.complete && img.naturalWidth > 0) {
        item.classList.add('has-img');
      }
    }
  });

  // ==========================================================================
  // PORTFOLIO LIGHTBOX MODAL
  // ==========================================================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-content');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const lightboxCategory = lightbox.querySelector('.lightbox-category');
  const lightboxClose = lightbox.querySelector('.lightbox-close');

  portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
      const title = item.querySelector('h4').textContent;
      const category = item.querySelector('span').textContent;
      const img = item.querySelector('img');

      lightboxCaption.textContent = title;
      lightboxCategory.textContent = category;

      if (img && item.classList.contains('has-img')) {
        lightboxImg.src = img.src;
        lightboxImg.style.display = 'block';
      } else {
        // Fallback: If no custom image loaded, show a gold vector/icon block representation
        lightboxImg.src = '';
        lightboxImg.style.display = 'none';
        lightboxCaption.textContent = `${title} (Drop your original file in assets to show here)`;
      }

      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock background scroll
    });
  });

  lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto'; // Unlock scroll
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });

  // ==========================================================================
  // TESTIMONIALS SLIDER
  // ==========================================================================
  const slides = document.querySelectorAll('.testimonial-slide');
  const prevBtn = document.querySelector('.prev-testimonial');
  const nextBtn = document.querySelector('.next-testimonial');
  let currentSlide = 0;
  let slideInterval;

  const showSlide = (index) => {
    slides.forEach(slide => slide.classList.remove('active'));
    
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
  };

  const nextSlide = () => showSlide(currentSlide + 1);
  const prevSlide = () => showSlide(currentSlide - 1);

  if (slides.length > 0) {
    showSlide(currentSlide);

    // Manual triggers
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetInterval();
    });

    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetInterval();
    });

    // Auto rotate
    const startInterval = () => {
      slideInterval = setInterval(nextSlide, 6000);
    };

    const resetInterval = () => {
      clearInterval(slideInterval);
      startInterval();
    };

    startInterval();
  }

  // ==========================================================================
  // FAQ ACCORDION (GEO/AEO SMOOTH TRANSITIONS)
  // ==========================================================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all open FAQs
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-content').style.maxHeight = null;
      });

      // Toggle current FAQ
      if (!isActive) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

});
