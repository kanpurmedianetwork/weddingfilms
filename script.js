document.addEventListener('DOMContentLoaded', () => {



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
  // PORTFOLIO HORIZONTAL INFINITE LOOP WITH MOUSE/DRAG RESPONSIVENESS
  // ==========================================================================
  const track = document.getElementById('portfolio-track');
  const container = document.querySelector('.portfolio-loop-container');
  const tabs = document.querySelectorAll('.portfolio-tab');
  
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-content');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const lightboxCategory = lightbox.querySelector('.lightbox-category');
  const lightboxClose = lightbox.querySelector('.lightbox-close');

  if (track && container) {
    let activeCategory = 'eng';
    let trackWidth = 0;
    let xOffset = 0;
    let speed = 0.6; // Auto-scroll speed
    let targetSpeed = 0.6;
    let isHovered = false;
    let isDragging = false;
    let startX = 0;
    let dragOffset = 0;
    let animationId = null;

    // Load images dynamically
    const loadCategory = (cat) => {
      activeCategory = cat;
      track.innerHTML = '';
      
      // Select files for display
      const catImages = Array.from({ length: 15 }, (_, i) => `assets/gallery/${cat}/${cat}_${i + 1}.webp`);
      
      // Duplicate for infinite scrolling loop
      const doubleImages = [...catImages, ...catImages];
      
      // Create elements
      doubleImages.forEach((src, idx) => {
        const item = document.createElement('div');
        item.className = 'loop-item';
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = `${cat.toUpperCase()} Showcase Frame ${idx % 15 + 1}`;
        img.loading = 'lazy';
        
        // Open lightbox on click
        img.addEventListener('click', (e) => {
          if (isDragging) return; // Prevent clicking during drag
          
          lightboxCaption.textContent = img.alt;
          lightboxCategory.textContent = `${cat.toUpperCase()} Portfolio`;
          lightboxImg.src = src;
          lightboxImg.style.display = 'block';
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden'; // Lock background scroll
        });

        item.appendChild(img);
        track.appendChild(item);
      });

      // Recalculate dimensions after images load
      setTimeout(recalculateWidth, 300);
    };

    const recalculateWidth = () => {
      const items = track.querySelectorAll('.loop-item');
      if (items.length === 0) return;

      let totalWidth = 0;
      items.forEach(item => {
        totalWidth += item.getBoundingClientRect().width + 24; // Width + 24px gap (1.5rem)
      });
      
      // Since we duplicated, trackWidth of one loop is totalWidth / 2
      trackWidth = totalWidth / 2;
    };

    // Auto-scroll loop
    const animate = () => {
      if (trackWidth > 0) {
        if (!isDragging) {
          // Update position based on current speed
          // Interpolate current speed to target speed for smooth transition
          speed += (targetSpeed - speed) * 0.1;
          xOffset -= speed;

          // Seamless loop check:
          // If we scroll past one full set of images (xOffset <= -trackWidth), snap back
          if (xOffset <= -trackWidth) {
            xOffset += trackWidth;
          }
          // If we scroll past the left boundary (xOffset >= 0), snap forward
          if (xOffset > 0) {
            xOffset -= trackWidth;
          }
          
          track.style.transform = `translateX(${xOffset}px)`;
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    // Mouse hover position responsiveness
    container.addEventListener('mousemove', (e) => {
      isHovered = true;
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const centerX = rect.width / 2;
      
      // Calculate normalized offset from center (-1 to 1)
      const offset = (mouseX - centerX) / centerX;
      
      // Control scroll speed and direction based on offset
      // Max speed is 5px per frame in either direction
      targetSpeed = offset * 5;
    });

    container.addEventListener('mouseleave', () => {
      isHovered = false;
      targetSpeed = 0.6; // Return to default auto-scroll speed
    });

    // Drag and swipe functionality
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - xOffset;
      container.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const currentX = e.clientX;
      xOffset = currentX - startX;
      
      // Looping checks while dragging
      if (trackWidth > 0) {
        if (xOffset <= -trackWidth) {
          startX += trackWidth;
          xOffset += trackWidth;
        }
        if (xOffset > 0) {
          startX -= trackWidth;
          xOffset -= trackWidth;
        }
      }
      
      track.style.transform = `translateX(${xOffset}px)`;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        container.style.cursor = 'grab';
      }
    });

    // Touch support for mobile
    let touchStartX = 0;
    container.addEventListener('touchstart', (e) => {
      isDragging = true;
      touchStartX = e.touches[0].clientX - xOffset;
    });

    container.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const currentX = e.touches[0].clientX;
      xOffset = currentX - touchStartX;
      
      if (trackWidth > 0) {
        if (xOffset <= -trackWidth) {
          touchStartX += trackWidth;
          xOffset += trackWidth;
        }
        if (xOffset > 0) {
          touchStartX -= trackWidth;
          xOffset -= trackWidth;
        }
      }
      track.style.transform = `translateX(${xOffset}px)`;
    });

    container.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Tab bindings
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Fade out
        track.style.opacity = '0';
        setTimeout(() => {
          loadCategory(tab.getAttribute('data-category'));
          xOffset = 0; // Reset scroll position
          track.style.opacity = '1';
        }, 300);
      });
    });

    // Lightbox close helpers
    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto'; // Unlock scroll
      });
    }

    if (lightbox) {
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
          lightbox.classList.remove('active');
          document.body.style.overflow = 'auto';
        }
      });
    }

    // Initial load
    loadCategory('eng');
    animate();
    
    // Recalculate on resize
    window.addEventListener('resize', recalculateWidth);
  }

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

  // ==========================================================================
  // 3D ALBUM TILT EFFECT
  // ==========================================================================
  const albumCover = document.getElementById('album-cover');
  if (albumCover) {
    albumCover.addEventListener('mousemove', (e) => {
      const rect = albumCover.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element
      const y = e.clientY - rect.top;  // y position within the element
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation based on cursor distance from center (Max rotation: 12deg)
      const rotateX = ((centerY - y) / centerY) * 12;
      const rotateY = ((x - centerX) / centerX) * 12;
      
      albumCover.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    
    albumCover.addEventListener('mouseleave', () => {
      albumCover.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    });
  }

  // ==========================================================================
  // SERVICES HOVER MEDIA PREVIEW
  // ==========================================================================
  const serviceRows = document.querySelectorAll('.service-row');
  
  // Create floating preview element
  const preview = document.createElement('div');
  preview.className = 'service-hover-preview';
  const previewImg = document.createElement('img');
  preview.appendChild(previewImg);
  document.body.appendChild(preview);
  
  serviceRows.forEach(row => {
    const imgSrc = row.getAttribute('data-image');
    if (!imgSrc) return;
    
    row.addEventListener('mouseenter', () => {
      previewImg.src = imgSrc;
      preview.classList.add('active');
    });
    
    row.addEventListener('mousemove', (e) => {
      const offset = 20; // Offset preview card from cursor pointer
      preview.style.left = `${e.clientX + offset}px`;
      preview.style.top = `${e.clientY + offset}px`;
    });
    
    row.addEventListener('mouseleave', () => {
      preview.classList.remove('active');
    });
  });

  // ==========================================================================
  // TRAILER VIDEO PLAYER MODAL
  // ==========================================================================
  const trailerModal = document.getElementById('trailer-modal');
  const trailerPlayer = document.getElementById('trailer-player');
  const trailerClose = document.getElementById('trailer-modal-close');
  
  const openTrailer = (videoSrc) => {
    if (trailerModal && trailerPlayer) {
      if (videoSrc) {
        let source = trailerPlayer.querySelector('source');
        if (!source) {
          source = document.createElement('source');
          trailerPlayer.appendChild(source);
        }
        source.src = videoSrc;
        trailerPlayer.load();
      }
      
      trailerModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      trailerPlayer.currentTime = 0;
      trailerPlayer.play().catch(err => console.log('Auto-play blocked or failed:', err));
    }
  };
  
  const closeTrailer = () => {
    if (trailerModal && trailerPlayer) {
      trailerModal.classList.remove('active');
      document.body.style.overflow = 'auto';
      trailerPlayer.pause();
    }
  };
  
  // Bind all teaser showcase cards
  const teaserCards = document.querySelectorAll('.teaser-showcase-card');
  teaserCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const videoSrc = card.getAttribute('data-video');
      openTrailer(videoSrc);
    });
  });
  
  if (trailerClose) {
    trailerClose.addEventListener('click', closeTrailer);
  }
  
  if (trailerModal) {
    trailerModal.addEventListener('click', (e) => {
      if (e.target === trailerModal) {
        closeTrailer();
      }
    });
  }

  // ==========================================================================
  // LAZY LOAD AND DEFER VIDEOS IN VIEWPORT
  // ==========================================================================
  const lazyVideos = document.querySelectorAll('video.hero-teaser-video');
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(err => {});
        } else {
          video.pause();
        }
      });
    });
    
    lazyVideos.forEach(video => {
      videoObserver.observe(video);
    });
  }

});
