/**
 * NexBoost — Premium Site
 * Main JavaScript
 */

// ═══════════════════════════════════════
//  THEME TOGGLE
// ═══════════════════════════════════════
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('nexboost-theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  if (next === 'dark') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', next);
  }
  localStorage.setItem('nexboost-theme', next);
});

// ═══════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a:not(.nav-cta)');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (scrollY >= s.offsetTop - 150) current = s.id;
  });
  navAnchors.forEach(a => {
    a.style.color = '';
    if (a.getAttribute('href') === '#' + current) a.style.color = 'var(--text)';
  });
}, { passive: true });

// ═══════════════════════════════════════
//  SCROLL REVEAL
// ═══════════════════════════════════════
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const parent = entry.target.parentElement;
      const siblings = [...parent.children].filter(el =>
        el.classList.contains('reveal') ||
        el.classList.contains('reveal-left') ||
        el.classList.contains('reveal-right') ||
        el.classList.contains('reveal-scale')
      );
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${idx * 0.08}s`;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
  revealObserver.observe(el);
});

// ═══════════════════════════════════════
//  PARTICLES
// ═══════════════════════════════════════
const canvas = document.getElementById('particles-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.25;
      this.speedY = (Math.random() - 0.5) * 0.25;
      this.opacity = Math.random() * 0.35 + 0.08;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
      ctx.fill();
    }
  }

  const pCount = Math.min(50, Math.floor((w * h) / 20000));
  for (let i = 0; i < pCount; i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.05 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  }
  animate();
}

// ═══════════════════════════════════════
//  PRICING TABS
// ═══════════════════════════════════════
const pricingTabs = document.querySelectorAll('.pricing-tab');
const pricingCards = document.querySelectorAll('.pricing-card');

pricingTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const cat = tab.dataset.category;
    pricingTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    pricingCards.forEach(card => {
      if (cat === 'all' || card.dataset.category === cat) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ═══════════════════════════════════════
//  CART SYSTEM
// ═══════════════════════════════════════
let cart = [];

const cartFab = document.getElementById('cartFab');
const cartOverlay = document.getElementById('cartOverlay');
const cartSidebar = document.getElementById('cartSidebar');
const cartClose = document.getElementById('cartClose');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');
const cartFooterEl = document.getElementById('cartFooter');
const toast = document.getElementById('toast');

function openCart() {
  cartOverlay.classList.add('open');
  cartSidebar.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartOverlay.classList.remove('open');
  cartSidebar.classList.remove('open');
  document.body.style.overflow = '';
  // Hide devis form when closing
  const df = document.getElementById('cartDevisForm');
  if (df) df.classList.remove('visible');
}

cartFab.addEventListener('click', openCart);
cartOverlay.addEventListener('click', closeCart);
cartClose.addEventListener('click', closeCart);

function showToast(msg) {
  toast.querySelector('.toast-text').textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2500);
}

function updateCartUI() {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  // FAB visibility
  cartFab.classList.toggle('visible', count > 0);
  cartCountEl.textContent = count;

  // Footer visibility
  cartFooterEl.style.display = count > 0 ? '' : 'none';
  cartTotalEl.textContent = total.toLocaleString('fr-FR') + ' €';

  // Items
  if (count === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <p>Votre panier est vide</p>
      </div>`;
    return;
  }

  cartItemsEl.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price.toLocaleString('fr-FR')} € / unité</div>
      </div>
      <div class="cart-item-controls">
        <button class="cart-qty-btn" onclick="changeQty(${i}, -1)" aria-label="Diminuer">−</button>
        <span class="cart-qty">${item.qty}</span>
        <button class="cart-qty-btn" onclick="changeQty(${i}, 1)" aria-label="Augmenter">+</button>
        <button class="cart-item-remove" onclick="removeItem(${i})" aria-label="Supprimer">✕</button>
      </div>
    </div>
  `).join('');
}

function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  updateCartUI();
  showToast(`${name} ajouté au panier`);
}

window.changeQty = function(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  updateCartUI();
};

window.removeItem = function(index) {
  cart.splice(index, 1);
  updateCartUI();
};

// Add to cart buttons
document.querySelectorAll('[data-add-cart]').forEach(btn => {
  btn.addEventListener('click', () => {
    addToCart(btn.dataset.name, parseInt(btn.dataset.price));
  });
});

// ═══════════════════════════════════════
//  EMAIL HELPERS (shared by cart + contact)
// ═══════════════════════════════════════
function sendViaFormSubmit(data) {
  const formData = new FormData();
  Object.entries(data).forEach(([k, v]) => formData.append(k, v));
  formData.append('_captcha', 'false');
  return fetch('https://formsubmit.co/ajax/nathan.lepretre@nexboost.fr', {
    method: 'POST',
    body: formData
  });
}

function sendViaMailto(subject, body) {
  const a = document.createElement('a');
  a.href = `mailto:nathan.lepretre@nexboost.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  a.click();
}

// Devis form inside cart
const devisToggle = document.getElementById('devisToggle');
const cartDevisForm = document.getElementById('cartDevisForm');

devisToggle.addEventListener('click', () => {
  cartDevisForm.classList.toggle('visible');
  if (cartDevisForm.classList.contains('visible')) {
    cartDevisForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

// Submit devis
document.getElementById('cartDevisForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Validate
  let valid = true;
  this.querySelectorAll('[required]').forEach(field => {
    const err = field.parentElement.querySelector('.field-error');
    if (!field.value.trim()) {
      field.classList.add('error');
      if (err) err.classList.add('visible');
      valid = false;
    } else {
      field.classList.remove('error');
      if (err) err.classList.remove('visible');
    }
  });
  if (!valid) return;

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartSummary = cart.map(i => `- ${i.name} x${i.qty} = ${(i.price * i.qty).toLocaleString('fr-FR')} €`).join('\n');

  const name = this.querySelector('[name="devis-name"]').value;
  const company = this.querySelector('[name="devis-company"]').value || 'Non renseignée';
  const email = this.querySelector('[name="devis-email"]').value;
  const phone = this.querySelector('[name="devis-phone"]').value || 'Non renseigné';
  const message = this.querySelector('[name="devis-message"]').value || 'Aucun message';

  const subject = 'Demande de devis NexBoost — ' + name;
  const body = `Nom : ${name}\nEntreprise : ${company}\nEmail : ${email}\nTéléphone : ${phone}\nMessage : ${message}\n\n--- PANIER ---\n${cartSummary}\n\nTotal estimé : ${total.toLocaleString('fr-FR')} € HT`;

  // Try FormSubmit, fallback mailto
  sendViaFormSubmit({
    name, company, email, phone, message,
    panier: cartSummary,
    total: total.toLocaleString('fr-FR') + ' € HT',
    _subject: subject
  })
    .then(res => {
      if (!res.ok) throw new Error('err');
      return res.json();
    })
    .then(data => {
      if (data.success !== 'true' && data.success !== true) throw new Error('err');
    })
    .catch(() => {
      sendViaMailto(subject, body);
    });

  showToast('Demande de devis envoyée !');
  cart = [];
  updateCartUI();
  closeCart();
  this.reset();
  cartDevisForm.classList.remove('visible');
});

// Init cart UI
updateCartUI();

// ═══════════════════════════════════════
//  CONTACT FORM
// ═══════════════════════════════════════
const contactForm = document.getElementById('contactForm');
const contactFormInner = document.getElementById('contactFormInner');
const contactSuccess = document.getElementById('contactSuccess');

contactForm.addEventListener('submit', function(e) {
  e.preventDefault();

  // Validate
  let valid = true;
  this.querySelectorAll('[required]').forEach(field => {
    const err = field.parentElement.querySelector('.field-error');
    if (!field.value.trim()) {
      field.classList.add('error');
      if (err) err.classList.add('visible');
      valid = false;
    } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      field.classList.add('error');
      if (err) { err.textContent = 'Email invalide'; err.classList.add('visible'); }
      valid = false;
    } else {
      field.classList.remove('error');
      if (err) err.classList.remove('visible');
    }
  });
  if (!valid) return;

  const name = this.querySelector('[name="name"]').value;
  const email = this.querySelector('[name="email"]').value;
  const phone = this.querySelector('[name="phone"]').value || 'Non renseigné';
  const company = this.querySelector('[name="company"]').value || 'Non renseignée';
  const message = this.querySelector('[name="message"]').value;

  const subject = 'Nouveau message NexBoost — ' + name;
  const body = `Nom : ${name}\nEntreprise : ${company}\nEmail : ${email}\nTéléphone : ${phone}\n\nMessage :\n${message}`;

  // Try FormSubmit first, fallback to mailto
  sendViaFormSubmit({ name, email, phone, company, message, _subject: subject })
    .then(res => {
      if (!res.ok) throw new Error('FormSubmit error');
      return res.json();
    })
    .then(data => {
      if (data.success !== 'true' && data.success !== true) throw new Error('Not confirmed');
      // FormSubmit worked
    })
    .catch(() => {
      // FormSubmit failed (not verified yet), use mailto
      sendViaMailto(subject, body);
    });

  // Show success regardless
  contactFormInner.style.display = 'none';
  contactSuccess.classList.add('visible');

  setTimeout(() => {
    contactFormInner.style.display = '';
    contactSuccess.classList.remove('visible');
    this.reset();
  }, 5000);
});

// Remove error on input
document.querySelectorAll('.form-group input, .form-group textarea').forEach(field => {
  field.addEventListener('input', () => {
    field.classList.remove('error');
    const err = field.parentElement.querySelector('.field-error');
    if (err) err.classList.remove('visible');
  });
});

// ═══════════════════════════════════════
//  FAQ ACCORDION
// ═══════════════════════════════════════
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      openItem.classList.remove('open');
      openItem.querySelector('.faq-answer').style.maxHeight = '0';
    });

    // Open if wasn't open
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// ═══════════════════════════════════════
//  CURSOR BUBBLE
// ═══════════════════════════════════════
const cursorBubble = document.getElementById('cursorBubble');
if (cursorBubble && window.matchMedia('(min-width: 901px)').matches) {
  let bx = 0, by = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => {
    bx = e.clientX;
    by = e.clientY;
    if (!cursorBubble.classList.contains('visible')) cursorBubble.classList.add('visible');
  });
  document.addEventListener('mouseleave', () => cursorBubble.classList.remove('visible'));

  function animateBubble() {
    cx += (bx - cx) * 0.12;
    cy += (by - cy) * 0.12;
    cursorBubble.style.left = cx + 'px';
    cursorBubble.style.top = cy + 'px';
    requestAnimationFrame(animateBubble);
  }
  animateBubble();
}
