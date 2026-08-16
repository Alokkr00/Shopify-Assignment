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

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize Scroll Reveals via IntersectionObserver
  function initScrollReveals(root) {
    const context = root || document;
    const revs = context.querySelectorAll('.purelane-rv:not(.purelane-in)');
    if (!revs.length) return;

    if ('IntersectionObserver' in window && !reduceMotion) {
      const ro = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('purelane-in');
            ro.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

      revs.forEach((el) => ro.observe(el));
    } else {
      revs.forEach((el) => el.classList.add('purelane-in'));
    }
  }

  // Hero Product Stage Component (1 -> 2 -> 3 Products with price tags)
  class PurelaneHeroStage {
    constructor(element) {
      this.container = element;
      this.slides = Array.from(element.querySelectorAll('.purelane-hslide'));
      const stageParent = element.closest('.purelane-hero-prod') || element.parentElement || element;
      this.dots = Array.from(stageParent.querySelectorAll('.purelane-hdots button'));
      this.currentIndex = 0;
      this.timer = null;
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

      this.container.addEventListener('mouseenter', () => this.stop());
      this.container.addEventListener('mouseleave', () => this.play());

      if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.play();
            } else {
              this.stop();
            }
          });
        }, { threshold: 0.2 }).observe(this.container);
      } else {
        this.play();
      }
    }

    goTo(index) {
      this.currentIndex = (index + this.slides.length) % this.slides.length;
      this.slides.forEach((slide, i) => {
        slide.classList.toggle('purelane-on', i === this.currentIndex);
      });
      this.dots.forEach((dot, i) => {
        dot.classList.toggle('purelane-on', i === this.currentIndex);
      });
    }

    play() {
      if (!this.timer && !reduceMotion && this.slides.length > 1) {
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
    }
  }

  // Product Rotator Component (Proof Section)
  class PurelaneProductRotator {
    constructor(element) {
      this.container = element;
      this.images = Array.from(element.querySelectorAll('.purelane-frame .purelane-pimg, .purelane-frame img'));
      this.dots = Array.from(element.querySelectorAll('.purelane-dots i'));
      this.captionTitle = element.querySelector('.purelane-cap b');
      this.captionNote = element.querySelector('.purelane-cap span');
      this.currentIndex = 0;
      this.timer = null;
      this.interval = parseInt(element.getAttribute('data-interval') || '2900', 10);

      this.init();
    }

    init() {
      if (!this.images.length) return;

      if (!reduceMotion && 'IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.play();
            } else {
              this.stop();
            }
          });
        }, { threshold: 0.25 }).observe(this.container);
      } else if (!reduceMotion) {
        this.play();
      }
    }

    step() {
      if (!this.images.length) return;

      if (this.images[this.currentIndex]) {
        this.images[this.currentIndex].classList.remove('purelane-on');
      }
      if (this.dots[this.currentIndex]) {
        this.dots[this.currentIndex].classList.remove('purelane-on');
      }

      this.currentIndex = (this.currentIndex + 1) % this.images.length;

      const activeImg = this.images[this.currentIndex];
      if (activeImg) {
        activeImg.classList.add('purelane-on');
        if (this.captionTitle) {
          this.captionTitle.textContent = activeImg.getAttribute('data-name') || '';
        }
        if (this.captionNote) {
          this.captionNote.textContent = activeImg.getAttribute('data-note') || '';
        }
      }

      if (this.dots[this.currentIndex]) {
        this.dots[this.currentIndex].classList.add('purelane-on');
      }
    }

    play() {
      if (!this.timer && !reduceMotion && this.images.length > 1) {
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
    }
  }

  // Parallax & Mouse Movement Tracker
  function initParallax() {
    if (reduceMotion) return;

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
    const forms = context.querySelectorAll('form[action*="/cart/add"]');

    forms.forEach((form) => {
      if (form.getAttribute('data-purelane-ajax-init')) return;
      form.setAttribute('data-purelane-ajax-init', 'true');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : '';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Adding...</span>';
        }

        try {
          const formData = new FormData(form);
          const response = await fetch(window.routes ? window.routes.cart_add_url : '/cart/add.js', {
            method: 'POST',
            body: formData,
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Accept': 'application/javascript'
            }
          });

          if (response.ok) {
            if (submitBtn) {
              submitBtn.innerHTML = '<span>Added ✓</span>';
              setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
              }, 1800);
            }

            // Dispatch global cart update event for Dawn theme header cart counter/drawer
            document.dispatchEvent(new CustomEvent('cart:updated', { bubbles: true }));
            if (window.routes && window.routes.cart_url) {
              // Trigger Dawn's cart notification or drawer if available
              const cartNotification = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
              if (cartNotification && typeof cartNotification.renderContents === 'function') {
                const item = await response.json();
                cartNotification.renderContents(item);
              }
            }
          } else {
            throw new Error('Failed to add item to cart');
          }
        } catch (err) {
          console.error('[Purelane Cart]', err);
          if (submitBtn) {
            submitBtn.innerHTML = '<span>Try Again</span>';
            setTimeout(() => {
              submitBtn.disabled = false;
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

    // Hero stage init
    const heroStage = sectionElement.querySelector('.purelane-hero-stage-container');
    if (heroStage && !heroStage._purelaneHero) {
      heroStage._purelaneHero = new PurelaneHeroStage(heroStage);
    }

    // Rotator init
    const rotator = sectionElement.querySelector('.purelane-rot');
    if (rotator && !rotator._purelaneRotator) {
      rotator._purelaneRotator = new PurelaneProductRotator(rotator);
    }
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
    const heroStage = e.target.querySelector('.purelane-hero-stage-container');
    if (heroStage && heroStage._purelaneHero) {
      heroStage._purelaneHero.destroy();
      delete heroStage._purelaneHero;
    }

    const rotator = e.target.querySelector('.purelane-rot');
    if (rotator && rotator._purelaneRotator) {
      rotator._purelaneRotator.destroy();
      delete rotator._purelaneRotator;
    }
  });

  document.addEventListener('shopify:block:select', (e) => {
    const slide = e.target.closest('.purelane-hslide');
    if (slide) {
      const stage = slide.closest('.purelane-hero-stage-container');
      if (stage && stage._purelaneHero) {
        const index = stage._purelaneHero.slides.indexOf(slide);
        if (index >= 0) {
          stage._purelaneHero.stop();
          stage._purelaneHero.goTo(index);
        }
      }
    }
  });
})();
