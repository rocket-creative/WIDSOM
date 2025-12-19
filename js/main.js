/* =====================================================
   PATHWAYS WITHIN - MAIN JAVASCRIPT
   Shared functionality for all pages
   ===================================================== */

// Enable JS-dependent features IMMEDIATELY to prevent content flash
// This runs before DOMContentLoaded to hide reveal elements as soon as possible
document.documentElement.classList.add('js-enabled');

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initScrollReveal();
  initHeaderScroll();
  initMobileMenu();
  initFaqAccordions();
  initFormValidation();
  initSmoothScroll();
});

/* ==================== SCROLL REVEAL ==================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // If reduced motion, show everything immediately
    revealElements.forEach(el => el.classList.add('revealed'));
    return;
  }

  // Intersection Observer for scroll reveals
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Once revealed, stop observing
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

/* ==================== HEADER SCROLL ==================== */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  }, { passive: true });
}

/* ==================== MOBILE MENU ==================== */
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const menuIcon = menuBtn?.querySelector('.icon');
  
  if (!menuBtn || !mobileNav) return;
  
  menuBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('active');
    menuBtn.setAttribute('aria-expanded', isOpen);
    
    // Change icon
    if (menuIcon) {
      menuIcon.innerHTML = isOpen 
        ? '<use href="#icon-close"/>' 
        : '<use href="#icon-menu"/>';
    }
  });
  
  // Close menu when clicking a link
  const mobileLinks = mobileNav.querySelectorAll('.mobile-nav-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
      if (menuIcon) {
        menuIcon.innerHTML = '<use href="#icon-menu"/>';
      }
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileNav.contains(e.target) && !menuBtn.contains(e.target)) {
      mobileNav.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
      if (menuIcon) {
        menuIcon.innerHTML = '<use href="#icon-menu"/>';
      }
    }
  });
}

/* ==================== FAQ ACCORDIONS ==================== */
function initFaqAccordions() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    if (!question || !answer) return;
    
    // Set initial ARIA attributes
    const id = question.id || `faq-${Math.random().toString(36).substr(2, 9)}`;
    const answerId = `${id}-answer`;
    
    question.id = id;
    question.setAttribute('aria-expanded', 'false');
    question.setAttribute('aria-controls', answerId);
    
    answer.id = answerId;
    answer.setAttribute('role', 'region');
    answer.setAttribute('aria-labelledby', id);
    
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      
      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('open')) {
          otherItem.classList.remove('open');
          otherItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        }
      });
      
      // Toggle current item
      item.classList.toggle('open');
      question.setAttribute('aria-expanded', !isOpen);
    });
    
    // Keyboard navigation
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });
}

/* ==================== FORM VALIDATION ==================== */
function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate]');
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      // Validate on blur
      input.addEventListener('blur', () => {
        validateField(input);
      });
      
      // Clear error on input
      input.addEventListener('input', () => {
        clearError(input);
      });
    });
    
    // Validate on submit
    form.addEventListener('submit', (e) => {
      let isValid = true;
      
      inputs.forEach(input => {
        if (!validateField(input)) {
          isValid = false;
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        // Focus first invalid field
        const firstInvalid = form.querySelector('.error');
        if (firstInvalid) {
          firstInvalid.focus();
        }
      }
    });
  });
}

function validateField(input) {
  const value = input.value.trim();
  const type = input.type;
  const required = input.hasAttribute('required');
  
  // Clear previous error
  clearError(input);
  
  // Required validation
  if (required && !value) {
    showError(input, 'This field is required');
    return false;
  }
  
  // Email validation
  if (type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showError(input, 'Please enter a valid email address');
      return false;
    }
  }
  
  // Phone validation
  if (type === 'tel' && value) {
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
      showError(input, 'Please enter a valid phone number');
      return false;
    }
  }
  
  return true;
}

function showError(input, message) {
  input.classList.add('error');
  
  const errorId = input.getAttribute('aria-describedby');
  const errorEl = errorId ? document.getElementById(errorId) : null;
  
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

function clearError(input) {
  input.classList.remove('error');
  
  const errorId = input.getAttribute('aria-describedby');
  const errorEl = errorId ? document.getElementById(errorId) : null;
  
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
}

/* ==================== SMOOTH SCROLL ==================== */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ==================== UTILITY FUNCTIONS ==================== */

// Toggle FAQ - Can be called from onclick handlers
function toggleFaq(button) {
  const item = button.closest('.faq-item');
  if (item) {
    item.classList.toggle('open');
    const isOpen = item.classList.contains('open');
    button.setAttribute('aria-expanded', isOpen);
  }
}

// Format phone number as user types
function formatPhone(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 0) {
    if (value.length <= 3) {
      value = `(${value}`;
    } else if (value.length <= 6) {
      value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else {
      value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    }
  }
  input.value = value;
}

// Show form success message
function showFormSuccess(formId, message) {
  const form = document.getElementById(formId);
  const statusEl = form?.querySelector('[role="alert"]');
  
  if (statusEl) {
    statusEl.innerHTML = `
      <div class="alert alert-success">
        <svg class="icon" style="width:20px;height:20px"><use href="#icon-check"/></svg>
        ${message}
      </div>
    `;
    statusEl.style.display = 'block';
  }
}

// Show form error message
function showFormError(formId, message) {
  const form = document.getElementById(formId);
  const statusEl = form?.querySelector('[role="alert"]');
  
  if (statusEl) {
    statusEl.innerHTML = `
      <div class="alert alert-error">
        ${message}
      </div>
    `;
    statusEl.style.display = 'block';
  }
}

