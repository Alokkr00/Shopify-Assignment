/**
 * Purelane Shopify Theme Editor Aware Section Controller
 * Supports Shopify Online Store 2.0 theme lifecycle events:
 * - shopify:section:load
 * - shopify:section:unload
 * - shopify:section:select
 * - shopify:section:deselect
 * - shopify:block:select
 * - shopify:block:deselect
 */

(function () {
  'use strict';

  // Helper for dynamic reduced motion check
  function isReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Initialize Scroll Reveals via IntersectionObserver
  function initScrollReveals(root) {
    const context = root || document;
    const elements = [
      ...(context.matches && context.matches('.purelane-rv:not(.purelane-in)') ? [context] : []),
      ...Array.from(context.querySelectorAll('.purelane-rv:not(.purelane-in)'))
    ];
    if (!elements.length) return;

    if ('IntersectionObserver' in window && !isReducedMotion()) {
      const ro = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('purelane-in');
            ro.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

      elements.forEach((el) => ro.observe(el));
    } else {
      elements.forEach((el) => el.classList.add('purelane-in'));
    }
  }

  // Hero Product Stage Component (1 -> 2 -> 3 Products with price tags)
  class PurelaneHeroStage {
    constructor(element) {
      this.container = element;
      this.slides = Array.from(element.querySelectorAll('.purelane-hslide'));
      this.stageParent = element.closest('.purelane-hero-prod') || element.parentElement || element;
      this.dots = Array.from(this.stageParent.querySelectorAll('.purelane-hdots button'));
      this.currentIndex = 0;
      this.timer = null;
      this.observer = null;
      this.interval = parseInt(element.getAttribute('data-interval') || '3800', 10);

      this.init();
    }

    init() {
      if (!this.slides.length) return;

      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          this.stop();
          this.goTo(index);
          this.play();
        });
      });

      this.handleMouseEnter = () => this.stop();
      this.handleMouseLeave = () => this.play();

      this.container.addEventListener('mouseenter', this.handleMouseEnter);
      this.container.addEventListener('mouseleave', this.handleMouseLeave);
      if (this.stageParent && this.stageParent !== this.container) {
        this.stageParent.addEventListener('mouseenter', this.handleMouseEnter);
        this.stageParent.addEventListener('mouseleave', this.handleMouseLeave);
      }

      if ('IntersectionObserver' in window && !isReducedMotion()) {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.play();
            } else {
              this.stop();
            }
          });
        }, { threshold: 0.2 });
        this.observer.observe(this.container);
      } else if (!isReducedMotion()) {
        this.play();
      }
    }

    goTo(index) {
      if (!this.slides.length) return;
      this.currentIndex = (index + this.slides.length) % this.slides.length;
      this.slides.forEach((slide, i) => {
        slide.classList.toggle('purelane-on', i === this.currentIndex);
      });
      this.dots.forEach((dot, i) => {
        dot.classList.toggle('purelane-on', i === this.currentIndex);
      });
    }

    play() {
      if (!this.timer && !isReducedMotion() && this.slides.length > 1) {
        this.timer = setInterval(() => {
          this.goTo(this.currentIndex + 1);
        }, this.interval);
      }
    }

    stop() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }

    destroy() {
      this.stop();
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      this.container.removeEventListener('mouseenter', this.handleMouseEnter);
      this.container.removeEventListener('mouseleave', this.handleMouseLeave);
      if (this.stageParent && this.stageParent !== this.container) {
        this.stageParent.removeEventListener('mouseenter', this.handleMouseEnter);
        this.stageParent.removeEventListener('mouseleave', this.handleMouseLeave);
      }
    }
  }

  // Product Rotator Component (Proof Section)
  class PurelaneProductRotator {
    constructor(element) {
      this.container = element;
      this.images = Array.from(element.querySelectorAll('.purelane-frame .purelane-pimg, .purelane-frame img'));
      this.dots = Array.from(element.querySelectorAll('.purelane-dots i, .purelane-dots button'));
      this.captionTitle = element.querySelector('.purelane-cap b');
      this.captionNote = element.querySelector('.purelane-cap span');
      this.currentIndex = 0;
      this.timer = null;
      this.observer = null;
      this.interval = parseInt(element.getAttribute('data-interval') || '2900', 10);

      this.init();
    }

    init() {
      if (!this.images.length) return;

      this.dots.forEach((dot, index) => {
        dot.style.cursor = 'pointer';
        dot.addEventListener('click', () => {
          this.stop();
          this.goTo(index);
          this.play();
        });
      });

      this.handleMouseEnter = () => this.stop();
      this.handleMouseLeave = () => this.play();
      this.container.addEventListener('mouseenter', this.handleMouseEnter);
      this.container.addEventListener('mouseleave', this.handleMouseLeave);

      if (!isReducedMotion() && 'IntersectionObserver' in window) {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.play();
            } else {
              this.stop();
            }
          });
        }, { threshold: 0.25 });
        this.observer.observe(this.container);
      } else if (!isReducedMotion()) {
        this.play();
      }
    }

    goTo(index) {
      if (!this.images.length) return;
      this.currentIndex = (index + this.images.length) % this.images.length;

      this.images.forEach((img, i) => {
        img.classList.toggle('purelane-on', i === this.currentIndex);
      });

      this.dots.forEach((dot, i) => {
        dot.classList.toggle('purelane-on', i === this.currentIndex);
      });

      const activeImg = this.images[this.currentIndex];
      if (activeImg) {
        if (this.captionTitle) {
          this.captionTitle.textContent = activeImg.getAttribute('data-name') || '';
        }
        if (this.captionNote) {
          this.captionNote.textContent = activeImg.getAttribute('data-note') || '';
        }
      }
    }

    step() {
      this.goTo(this.currentIndex + 1);
    }

    play() {
      if (!this.timer && !isReducedMotion() && this.images.length > 1) {
        this.timer = setInterval(() => this.step(), this.interval);
      }
    }

    stop() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }

    destroy() {
      this.stop();
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      this.container.removeEventListener('mouseenter', this.handleMouseEnter);
      this.container.removeEventListener('mouseleave', this.handleMouseLeave);
    }
  }

  // Parallax & Mouse Movement Tracker
  function initParallax() {
    if (isReducedMotion()) return;

    let mx = 0;
    let my = 0;
    let raf = null;

    function render() {
      raf = null;
      const y = window.scrollY || window.pageYOffset;
      const waterLayers = document.querySelectorAll('.purelane-wl');
      const prod = document.querySelector('.purelane-hero-prod');

      waterLayers.forEach((layer, i) => {
        const depth = [0.05, 0.09, 0.03, 0.02][i] || 0.05;
        layer.style.setProperty('--px', (mx * depth * 130).toFixed(1) + 'px');
        layer.style.setProperty('--py', (-y * depth + my * depth * 90).toFixed(1) + 'px');
      });

      if (prod && window.innerWidth >= 900) {
        const f = Math.min(y / 700, 1);
        prod.style.transform = `translate3d(${(mx * -16).toFixed(2)}px, ${(-f * 54 + my * -10).toFixed(2)}px, 0) scale(${(1 - f * 0.06).toFixed(3)})`;
        prod.style.opacity = (1 - f * 0.55).toFixed(3);
      }
    }

    function onScroll() {
      if (!raf) raf = requestAnimationFrame(render);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    if (window.matchMedia('(min-width: 1024px)').matches) {
      window.addEventListener('mousemove', (e) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
        onScroll();
      }, { passive: true });
    }
  }

  // AJAX Add To Cart Helper
  function initAjaxForms(root) {
    const context = root || document;
    const forms = [
      ...(context.matches && context.matches('form[action*="/cart/add"]') ? [context] : []),
      ...Array.from(context.querySelectorAll('form[action*="/cart/add"]'))
    ];

    forms.forEach((form) => {
      if (form.getAttribute('data-purelane-ajax-init')) return;
      form.setAttribute('data-purelane-ajax-init', 'true');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : '';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.setAttribute('aria-disabled', 'true');
          submitBtn.innerHTML = '<span>Adding...</span>';
        }

        try {
          const formData = new FormData(form);

          // Integrate with Dawn theme drawer/notification section rendering
          const cartComponent = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
          if (cartComponent && typeof cartComponent.getSectionsToRender === 'function') {
            formData.append(
              'sections',
              cartComponent.getSectionsToRender().map((s) => s.id)
            );
            formData.append('sections_url', window.location.pathname);
            if (typeof cartComponent.setActiveElement === 'function') {
              cartComponent.setActiveElement(submitBtn || document.activeElement);
            }
          }

          const addEndpoint = (window.routes && window.routes.cart_add_url) 
            ? window.routes.cart_add_url 
            : (form.getAttribute('action') || '/cart/add.js');

          const response = await fetch(addEndpoint, {
            method: 'POST',
            body: formData,
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Accept': 'application/javascript, application/json'
            }
          });

          const data = await response.json();

          if (response.ok && !data.status) {
            if (submitBtn) {
              submitBtn.innerHTML = '<span>Added ✓</span>';
              setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.removeAttribute('aria-disabled');
                submitBtn.innerHTML = originalText;
              }, 1800);
            }

            // Dispatch global cart update event for listeners
            document.dispatchEvent(new CustomEvent('cart:updated', { 
              bubbles: true,
              detail: { item: data }
            }));

            // Publish Dawn PUB_SUB_EVENTS if present
            if (typeof publish === 'function' && window.PUB_SUB_EVENTS) {
              publish(PUB_SUB_EVENTS.cartUpdate, { 
                source: 'purelane-ajax-cart', 
                cartData: data 
              });
            }

            // Render Dawn cart drawer or notification
            if (cartComponent && typeof cartComponent.renderContents === 'function' && data.sections) {
              cartComponent.renderContents(data);
            } else if (cartComponent && typeof cartComponent.open === 'function') {
              cartComponent.open(submitBtn);
            }
          } else {
            throw new Error(data.description || data.message || 'Failed to add item to cart');
          }
        } catch (err) {
          console.error('[Purelane Cart]', err);
          if (submitBtn) {
            submitBtn.innerHTML = '<span>Try Again</span>';
            setTimeout(() => {
              submitBtn.disabled = false;
              submitBtn.removeAttribute('aria-disabled');
              submitBtn.innerHTML = originalText;
            }, 1800);
          }
        }
      });
    });
  }

  // Initialize Section Specific Modules
  function initSection(sectionElement) {
    if (!sectionElement) return;

    initScrollReveals(sectionElement);
    initAjaxForms(sectionElement);

    const heroStages = [
      ...(sectionElement.matches && sectionElement.matches('.purelane-hero-stage-container') ? [sectionElement] : []),
      ...Array.from(sectionElement.querySelectorAll('.purelane-hero-stage-container'))
    ];
    heroStages.forEach((heroStage) => {
      if (!heroStage._purelaneHero) {
        heroStage._purelaneHero = new PurelaneHeroStage(heroStage);
      }
    });

    const rotators = [
      ...(sectionElement.matches && sectionElement.matches('.purelane-rot') ? [sectionElement] : []),
      ...Array.from(sectionElement.querySelectorAll('.purelane-rot'))
    ];
    rotators.forEach((rotator) => {
      if (!rotator._purelaneRotator) {
        rotator._purelaneRotator = new PurelaneProductRotator(rotator);
      }
    });
  }

  // Global Page Initialization
  function initAll() {
    initScrollReveals();
    initParallax();
    initAjaxForms();

    document.querySelectorAll('.purelane-hero-stage-container').forEach((el) => {
      if (!el._purelaneHero) el._purelaneHero = new PurelaneHeroStage(el);
    });

    document.querySelectorAll('.purelane-rot').forEach((el) => {
      if (!el._purelaneRotator) el._purelaneRotator = new PurelaneProductRotator(el);
    });
  }

  // DOM Content Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Shopify Theme Editor Integration
  document.addEventListener('shopify:section:load', (e) => {
    initSection(e.target);
  });

  document.addEventListener('shopify:section:unload', (e) => {
    const heroStages = [
      ...(e.target.matches && e.target.matches('.purelane-hero-stage-container') ? [e.target] : []),
      ...Array.from(e.target.querySelectorAll('.purelane-hero-stage-container'))
    ];
    heroStages.forEach((stage) => {
      if (stage._purelaneHero) {
        stage._purelaneHero.destroy();
        delete stage._purelaneHero;
      }
    });

    const rotators = [
      ...(e.target.matches && e.target.matches('.purelane-rot') ? [e.target] : []),
      ...Array.from(e.target.querySelectorAll('.purelane-rot'))
    ];
    rotators.forEach((rot) => {
      if (rot._purelaneRotator) {
        rot._purelaneRotator.destroy();
        delete rot._purelaneRotator;
      }
    });
  });

  document.addEventListener('shopify:section:select', (e) => {
    const heroStage = e.target.querySelector?.('.purelane-hero-stage-container');
    if (heroStage && heroStage._purelaneHero) heroStage._purelaneHero.play();
    const rotator = e.target.querySelector?.('.purelane-rot');
    if (rotator && rotator._purelaneRotator) rotator._purelaneRotator.play();
  });

  document.addEventListener('shopify:block:select', (e) => {
    // 1. Focus Hero Stage slide block
    const slide = e.target.closest?.('.purelane-hslide') || (e.target.matches?.('.purelane-hslide') ? e.target : null);
    if (slide) {
      const stage = slide.closest('.purelane-hero-stage-container');
      if (stage && stage._purelaneHero) {
        const index = stage._purelaneHero.slides.indexOf(slide);
        if (index >= 0) {
          stage._purelaneHero.stop();
          stage._purelaneHero.goTo(index);
        }
      }
      return;
    }

    // 2. Focus Proof Rotator item block
    const rotImg = e.target.closest?.('.purelane-pimg') || (e.target.matches?.('.purelane-pimg') ? e.target : null);
    if (rotImg) {
      const rot = rotImg.closest('.purelane-rot');
      if (rot && rot._purelaneRotator) {
        const index = rot._purelaneRotator.images.indexOf(rotImg);
        if (index >= 0) {
          rot._purelaneRotator.stop();
          rot._purelaneRotator.goTo(index);
        }
      }
    }
  });

  document.addEventListener('shopify:block:deselect', (e) => {
    const heroStage = e.target.closest?.('.purelane-hero-stage-container') || e.target.querySelector?.('.purelane-hero-stage-container');
    if (heroStage && heroStage._purelaneHero) heroStage._purelaneHero.play();
    const rotator = e.target.closest?.('.purelane-rot') || e.target.querySelector?.('.purelane-rot');
    if (rotator && rotator._purelaneRotator) rotator._purelaneRotator.play();
  });
})();
