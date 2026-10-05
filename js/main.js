/**
 * NexBoost — Premium Site
 * Main JavaScript
 */

// ═══════════════════════════════════════
//  THÈME
// ═══════════════════════════════════════
// Déplacé dans js/theme.js. Le bloc qui se trouvait ici faisait
// themeToggle.addEventListener sans vérifier que le bouton existe : sur toute
// page dépourvue de #themeToggle, il levait une TypeError qui interrompait
// TOUT le reste de ce fichier (navigation, révélations, formulaire, chatbot).

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
      // Décalage plafonné : une rangée de cartes apparaît en cascade, mais le
      // dernier élément n'attend jamais plus d'un quart de seconde.
      entry.target.style.transitionDelay = `${Math.min(idx, 4) * 0.06}s`;
      entry.target.classList.remove('masque');
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
  // on ne masque que ce qui est sous la ligne de flottaison : le premier écran peint immédiatement
  if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
    el.classList.add('masque');
    revealObserver.observe(el);
  } else {
    el.classList.add('visible');
  }
});

// Particles removed — replaced by V4 hero

// ═══════════════════════════════════════
//  DEMANDES PRÉREMPLIES
// ═══════════════════════════════════════
// Le panier a disparu avec les prix affichés : chaque bouton « Demander un
// devis » ou « Choisir cette formule » mène au formulaire de contact et y
// écrit la première phrase du message. Si le visiteur a déjà commencé à
// écrire, on ne touche pas à son texte.
document.querySelectorAll('[data-demande]').forEach(lien => {
  lien.addEventListener('click', () => {
    const champ = document.querySelector('#contactForm [name="message"]');
    if (!champ) return;
    const intact = !champ.value.trim() || champ.value === champ.dataset.prerempli;
    if (intact) {
      champ.value = `Bonjour, je suis intéressé(e) par ${lien.dataset.demande}. `;
      champ.dataset.prerempli = champ.value;
    }
    // Le défilement vers #contact est fait par le navigateur ; on place le
    // curseur une fois arrivé, sans provoquer un second saut.
    setTimeout(() => {
      champ.focus({ preventScroll: true });
      champ.setSelectionRange(champ.value.length, champ.value.length);
    }, 650);
  });
});

// ═══════════════════════════════════════
//  EMAIL HELPERS
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
  tarifs: `Pour un <b>site</b>, le prix varie en fonction de vos attentes : nombre de pages, fonctionnalités (réservation, boutique…), textes et photos à créer. On en parle 15 minutes, puis vous recevez un <b>devis détaillé, gratuit et sans engagement</b>.\n\nPour faire vivre le site ensuite, trois formules de suivi :\n• <b>Essentiel</b> : 49 € HT/mois\n• <b>Croissance</b> : 99 € HT/mois\n• <b>Performance</b> : 199 € HT/mois\n\nEt la formule <b>Sérénité</b> : le site et son suivi réglés en mensualités. <a href="#abonnements" style="color:var(--accent-light)">Voir les formules →</a>`,

  services: `Nous proposons :\n\n🌐 <b>Création de site web</b> — landing page, site vitrine, e-commerce\n📈 <b>SEO local</b> — être trouvé sur Google à Valenciennes\n📱 <b>Réseaux sociaux</b> — stratégie et gestion de contenu\n🎨 <b>Identité visuelle</b> — logo, flyer, carte de visite\n📸 <b>Photo & vidéo drone</b> — mise en valeur de votre activité\n📣 <b>Publicité en ligne</b> — Google Ads, Facebook Ads\n\nOn s'adapte à votre budget et vos besoins. <a href="#services" style="color:var(--accent-light)">Voir nos services →</a>`,

  fonctionnement: `C'est très simple :\n\n1️⃣ <b>On échange</b> — vous nous parlez de votre activité et vos besoins\n2️⃣ <b>On vous propose un devis gratuit</b> — clair, sans surprise\n3️⃣ <b>On réalise le projet</b> — vous validez chaque étape\n4️⃣ <b>On livre</b> — votre site/contenu est en ligne !\n\nPas de jargon, pas de contrat longue durée. Vous restez concentré sur votre métier.`,

  contact: `Vous pouvez nous contacter de plusieurs façons :\n\n📧 <b>Email</b> : nathan.lepretre@nexboost.fr\n📍 <b>Localisation</b> : Valenciennes, Hauts-de-France\n\nOu remplissez directement notre <a href="#contact" style="color:var(--accent-light)">formulaire de contact →</a>\n\nOn vous répond sous 24h, promis ! 🤝`,

  delai: `Les délais dépendent du projet :\n\n• Landing page : <b>1-2 semaines</b>\n• Site vitrine : <b>2-4 semaines</b>\n• Site e-commerce : <b>4-6 semaines</b>\n• Logo / flyer : <b>3-5 jours</b>\n\nOn s'adapte aussi à vos urgences si besoin !`,

  engagement: `Le <b>devis est gratuit et sans obligation</b>, et la création de votre site se règle à la prestation : vous payez uniquement ce que vous commandez.\n\nLes formules de suivi sont <b>optionnelles</b>. Seule la formule <b>Sérénité</b>, qui étale le prix du site en mensualités, comporte une durée d'engagement (12 ou 24 mois), indiquée noir sur blanc sur le devis.`,

  apropos: `NexBoost a été fondé par <b>Nathan</b>, un passionné du Nord qui a vu — ici et jusqu'au Vietnam — le même problème : <b>les meilleurs artisans et commerçants sont souvent les moins visibles en ligne</b>.\n\nFace aux grands, il faut lutter. NexBoost existe pour ça : booster votre activité avec un marketing humain, accessible et sans jargon.\n\n<a href="a-propos.html" style="color:var(--accent-light)">Lire l'histoire complète →</a>`,

  default: `Je n'ai pas de réponse précise à cette question, mais je peux vous aider sur :\n\n💰 Nos <b>tarifs</b>\n🛠 Nos <b>services</b>\n📋 Notre <b>fonctionnement</b>\n📞 Comment nous <b>contacter</b>\n⏱ Nos <b>délais</b>\n🤝 La question de <b>l’engagement</b>\n\nOu contactez-nous directement : <a href="#contact" style="color:var(--accent-light)">formulaire de contact →</a>`
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
  const bulle = document.createElement('span');
  bulle.textContent = text; // jamais de HTML venant du visiteur
  div.appendChild(bulle);
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
