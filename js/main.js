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
function setMenu(open) {
  menuToggle.classList.toggle('active', open);
  navLinks.classList.toggle('open', open);
  // Verrouille le scroll de la page derriere le menu
  document.body.style.overflow = open ? 'hidden' : '';
  menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
}
menuToggle.addEventListener('click', () => {
  setMenu(!navLinks.classList.contains('open'));
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenu(false));
});
// Ferme le menu avec la touche Echap
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) setMenu(false);
});

// Active nav link on scroll (using IntersectionObserver to avoid layout thrashing)
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a:not(.nav-cta)');
let currentSection = '';
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      currentSection = entry.target.id;
      navAnchors.forEach(a => {
        a.style.color = a.getAttribute('href') === '#' + currentSection ? 'var(--text)' : '';
      });
    }
  });
}, { threshold: 0.2, rootMargin: '-100px 0px -50% 0px' });
sections.forEach(s => sectionObserver.observe(s));

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

// Particles removed — replaced by V4 hero

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
  const activite = this.querySelector('[name="devis-activite"]').value || 'Non renseignée';
  const budget = this.querySelector('[name="devis-budget"]').value || 'Non renseigné';
  const delai = this.querySelector('[name="devis-delai"]').value || 'Non renseigné';
  const message = this.querySelector('[name="devis-message"]').value || 'Aucun message';

  const subject = 'Demande de devis NexBoost — ' + name;
  const body = `Nom : ${name}\nEntreprise : ${company}\nActivité : ${activite}\nEmail : ${email}\nTéléphone : ${phone}\nBudget : ${budget}\nDélai : ${delai}\nMessage : ${message}\n\n--- PANIER ---\n${cartSummary}\n\nTotal estimé : ${total.toLocaleString('fr-FR')} € HT`;

  // Try FormSubmit, fallback mailto
  sendViaFormSubmit({
    name, company, activite, email, phone, budget, delai, message,
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
  btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      openItem.classList.remove('open');
      openItem.querySelector('.faq-answer').style.maxHeight = '0';
      openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    // Open if wasn't open
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// Cursor bubble removed — replaced by V4 cursor

// ═══════════════════════════════════════
//  CHATBOT
// ═══════════════════════════════════════
const chatbotFab = document.getElementById('chatbotFab');
const chatbot = document.getElementById('chatbot');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotForm = document.getElementById('chatbotForm');
const chatbotInput = document.getElementById('chatbotInput');

const botResponses = {
  tarifs: `Voici nos tarifs :\n\n🚀 <b>Sites web</b>\n• Landing page : à partir de 490 €\n• Site vitrine (3-5 pages) : à partir de 990 €\n• Site e-commerce : à partir de 1 900 €\n\n🎨 <b>Identité visuelle</b>\n• Logo : 150 €\n• Flyer recto/verso : 200 €\n• Carte de visite : 90 €\n\n📸 <b>Photo & Vidéo</b>\n• Pack 5 photos : 100 €\n• 3 photos drone : 150 €\n• Vidéo drone (15-30s) : 240 €\n\nTous nos prix sont sans engagement. <a href="#tarifs" style="color:var(--accent-light)">Voir la section tarifs →</a>`,

  services: `Nous proposons :\n\n🌐 <b>Création de site web</b> — landing page, site vitrine, e-commerce\n📈 <b>SEO local</b> — être trouvé sur Google à Valenciennes\n📱 <b>Réseaux sociaux</b> — stratégie et gestion de contenu\n🎨 <b>Identité visuelle</b> — logo, flyer, carte de visite\n📸 <b>Photo & vidéo drone</b> — mise en valeur de votre activité\n📣 <b>Publicité en ligne</b> — Google Ads, Facebook Ads\n\nOn s'adapte à votre budget et vos besoins. <a href="#services" style="color:var(--accent-light)">Voir nos services →</a>`,

  fonctionnement: `C'est très simple :\n\n1️⃣ <b>On échange</b> — vous nous parlez de votre activité et vos besoins\n2️⃣ <b>On vous propose un devis gratuit</b> — clair, sans surprise\n3️⃣ <b>On réalise le projet</b> — vous validez chaque étape\n4️⃣ <b>On livre</b> — votre site/contenu est en ligne !\n\nPas de jargon, pas de contrat longue durée. Vous restez concentré sur votre métier.`,

  contact: `Vous pouvez nous contacter de plusieurs façons :\n\n📧 <b>Email</b> : nathan.lepretre@nexboost.fr\n📍 <b>Localisation</b> : Valenciennes, Hauts-de-France\n\nOu remplissez directement notre <a href="#contact" style="color:var(--accent-light)">formulaire de contact →</a>\n\nOn vous répond sous 24h, promis ! 🤝`,

  delai: `Les délais dépendent du projet :\n\n• Landing page : <b>1-2 semaines</b>\n• Site vitrine : <b>2-4 semaines</b>\n• Site e-commerce : <b>4-6 semaines</b>\n• Logo / flyer : <b>3-5 jours</b>\n\nOn s'adapte aussi à vos urgences si besoin !`,

  engagement: `<b>Aucun engagement</b> ! Chez NexBoost :\n\n✅ Pas de contrat longue durée\n✅ Devis gratuit et sans obligation\n✅ Vous payez uniquement ce que vous commandez\n✅ Réponse sous 24h\n\nOn veut gagner votre confiance par la qualité, pas par un contrat.`,

  apropos: `NexBoost a été fondé par <b>Nathan</b>, un passionné du Nord qui a vu — ici et jusqu'au Vietnam — le même problème : <b>les meilleurs artisans et commerçants sont souvent les moins visibles en ligne</b>.\n\nFace aux grands, il faut lutter. NexBoost existe pour ça : booster votre activité avec un marketing humain, accessible et sans jargon.\n\n<a href="a-propos.html" style="color:var(--accent-light)">Lire l'histoire complète →</a>`,

  default: `Je n'ai pas de réponse précise à cette question, mais je peux vous aider sur :\n\n💰 Nos <b>tarifs</b>\n🛠 Nos <b>services</b>\n📋 Notre <b>fonctionnement</b>\n📞 Comment nous <b>contacter</b>\n⏱ Nos <b>délais</b>\n🤝 Notre politique <b>sans engagement</b>\n\nOu contactez-nous directement : <a href="#contact" style="color:var(--accent-light)">formulaire de contact →</a>`
};

function detectIntent(msg) {
  const m = msg.toLowerCase();
  if (/tarif|prix|co[uû]t|combien|€|euro|cher/.test(m)) return 'tarifs';
  if (/service|propos|offr|fait|activit/.test(m)) return 'services';
  if (/comment.*march|fonctionn|étape|process|dérou|concr/.test(m)) return 'fonctionnement';
  if (/contact|joindre|appel|mail|téléph|adresse|où/.test(m)) return 'contact';
  if (/délai|temps|durée|combien de temps|livr|rapide/.test(m)) return 'delai';
  if (/engagement|contrat|obligation|annul|sans engagement/.test(m)) return 'engagement';
  if (/qui|fondateur|nathan|histoire|propos|parcours|créé|equipe/.test(m)) return 'apropos';
  if (/bonjour|salut|hello|hey|coucou/.test(m)) return 'salut';
  if (/merci|super|parfait|génial|top/.test(m)) return 'merci';
  return 'default';
}

function addBotMsg(html) {
  // Show typing
  const typing = document.createElement('div');
  typing.className = 'chatbot-typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  chatbotMessages.appendChild(typing);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

  setTimeout(() => {
    typing.remove();
    const div = document.createElement('div');
    div.className = 'chatbot-msg chatbot-msg-bot';
    div.innerHTML = `<span>${html}</span>`;
    chatbotMessages.appendChild(div);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }, 800 + Math.random() * 600);
}

function addUserMsg(text) {
  const div = document.createElement('div');
  div.className = 'chatbot-msg chatbot-msg-user';
  div.innerHTML = `<span>${text}</span>`;
  chatbotMessages.appendChild(div);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function handleChatMessage(text) {
  addUserMsg(text);
  const suggestions = document.getElementById('chatbotSuggestions');
  if (suggestions) suggestions.remove();

  const intent = detectIntent(text);
  if (intent === 'salut') {
    addBotMsg('Bonjour ! 😊 Ravi de vous accueillir. Comment puis-je vous aider aujourd\'hui ?');
  } else if (intent === 'merci') {
    addBotMsg('Avec plaisir ! N\'hésitez pas si vous avez d\'autres questions. 😊');
  } else {
    addBotMsg(botResponses[intent]);
  }
}

// Toggle chatbot
chatbotFab.addEventListener('click', () => {
  chatbot.classList.toggle('open');
  chatbotFab.classList.toggle('active');
  if (chatbot.classList.contains('open')) chatbotInput.focus();
});

// Submit message
chatbotForm.addEventListener('submit', e => {
  e.preventDefault();
  const val = chatbotInput.value.trim();
  if (!val) return;
  chatbotInput.value = '';
  handleChatMessage(val);
});

// Suggestion buttons
document.querySelectorAll('.chatbot-suggestion').forEach(btn => {
  btn.addEventListener('click', () => handleChatMessage(btn.dataset.q));
});
