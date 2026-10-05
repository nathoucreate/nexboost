/**
 * Blog NexBoost : ce que chaque article a en commun.
 *
 *  · la barre de lecture au bas de l'en-tête ;
 *  · le sommaire, tiré des intertitres (replié dans le texte, ou en marge
 *    sur grand écran, où le filet de la partie en cours se remplit) ;
 *  · la durée de lecture quand l'article ne la donne pas, et un bouton pour
 *    partager le lien ;
 *  · la carte de l'auteur, puis trois articles à lire ensuite, pris dans
 *    blog/index.html : la liste des articles n'existe qu'à un seul endroit.
 *
 * Tout est un complément : sans JavaScript, l'article se lit en entier.
 */
(function () {
  'use strict';

  var art = document.querySelector('.blog-article');
  if (!art) return;
  var nav = document.querySelector('.blog-nav');
  var meta = art.querySelector('.blog-meta, .blog-article-meta');
  var tactile = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  var ICONE_LIEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
  var ICONE_PARTAGE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>';
  var CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  // ─── Durée de lecture et partage ──────────────────────────────────────
  if (meta) {
    if (!/min de lecture/i.test(meta.textContent)) {
      var mots = (art.textContent || '').trim().split(/\s+/).length;
      meta.appendChild(document.createTextNode(' · ' + Math.max(1, Math.round(mots / 210)) + ' min de lecture'));
    }
    var partage = document.createElement('button');
    partage.type = 'button';
    partage.className = 'partager';
    var natif = !!(navigator.share && tactile);
    partage.innerHTML = (natif ? ICONE_PARTAGE : ICONE_LIEN) + '<span>' + (natif ? 'Partager' : 'Copier le lien') + '</span>';
    partage.addEventListener('click', function () {
      var lien = location.href.split('#')[0];
      if (natif) {
        navigator.share({ title: document.title, url: lien }).catch(function () {});
        return;
      }
      var etiquette = partage.querySelector('span');
      var copie = navigator.clipboard ? navigator.clipboard.writeText(lien) : Promise.reject();
      copie.then(function () {
        etiquette.textContent = 'Lien copié';
        partage.classList.add('fait');
        setTimeout(function () { etiquette.textContent = 'Copier le lien'; partage.classList.remove('fait'); }, 2200);
      }).catch(function () { window.prompt('Le lien de l’article :', lien); });
    });
    meta.appendChild(partage);
  }

  // ─── Sommaire ─────────────────────────────────────────────────────────
  var parties = Array.prototype.filter.call(art.children, function (el) { return el.tagName === 'H2'; });
  var liensCote = [];
  if (parties.length >= 3) {
    var pris = {};
    parties.forEach(function (h, i) {
      if (!h.id) {
        var base = (h.textContent || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || ('partie-' + (i + 1));
        var id = base, n = 2;
        while (pris[id] || document.getElementById(id)) id = base + '-' + n++;
        h.id = id;
      }
      pris[h.id] = true;
    });
    var liens = parties.map(function (h) {
      return '<li><a href="#' + h.id + '">' + esc((h.textContent || '').trim()) + '</a></li>';
    }).join('');

    var replie = document.createElement('details');
    replie.className = 'sommaire';
    replie.innerHTML = '<summary>Au sommaire <span class="n">' + parties.length + ' parties</span>' + CHEVRON + '</summary><ol>' + liens + '</ol>';
    if (meta) meta.insertAdjacentElement('afterend', replie);
    else art.insertBefore(replie, art.firstElementChild ? art.firstElementChild.nextSibling : null);
    // Un lien choisi referme le sommaire : on lit la partie, pas la liste.
    replie.addEventListener('click', function (e) { if (e.target.closest('a')) replie.open = false; });

    var cote = document.createElement('nav');
    cote.className = 'sommaire-cote';
    cote.setAttribute('aria-label', 'Sommaire de l’article');
    cote.innerHTML = '<p class="titre">Sommaire</p><ol>' + liens + '</ol>';
    document.body.appendChild(cote);
    liensCote = Array.prototype.slice.call(cote.querySelectorAll('a'));
  }

  // ─── Barre de lecture et partie en cours ──────────────────────────────
  var barre = null;
  if (nav) {
    barre = document.createElement('div');
    barre.className = 'lecture-barre';
    barre.setAttribute('aria-hidden', 'true');
    // En premier : theme.js range son bouton juste avant le dernier élément de la barre.
    nav.insertBefore(barre, nav.firstChild);
  }
  var attente = false;
  function suivre() {
    attente = false;
    var r = art.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    if (barre) {
      var lu = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
      barre.style.setProperty('--lu', lu.toFixed(4));
    }
    if (!liensCote.length || !liensCote[0].offsetParent) return;   // sommaire de marge masqué
    var repere = vh * 0.3, actif = -1;
    for (var i = 0; i < parties.length; i++) {
      if (parties[i].getBoundingClientRect().top <= repere) actif = i;
    }
    for (var j = 0; j < liensCote.length; j++) {
      var a = liensCote[j];
      a.classList.toggle('actif', j === actif);
      a.classList.toggle('lu', j < actif);
      if (j === actif) {
        var debut = parties[j].getBoundingClientRect().top;
        var fin = parties[j + 1] ? parties[j + 1].getBoundingClientRect().top : r.bottom;
        a.style.setProperty('--s', Math.min(1, Math.max(0, (repere - debut) / Math.max(1, fin - debut))).toFixed(3));
        a.setAttribute('aria-current', 'true');
      } else {
        a.style.removeProperty('--s');
        a.removeAttribute('aria-current');
      }
    }
  }
  function demander() { if (!attente) { attente = true; requestAnimationFrame(suivre); } }
  window.addEventListener('scroll', demander, { passive: true });
  window.addEventListener('resize', demander);
  suivre();

  // ─── L'auteur ─────────────────────────────────────────────────────────
  // L'article a déjà son appel à l'action : la carte ne lui ajoute pas un second bouton plein.
  var dejaCta = !!art.querySelector('a[href*="#contact"]');
  var auteur = document.createElement('aside');
  auteur.className = 'auteur';
  auteur.setAttribute('aria-label', 'L’auteur de l’article');
  auteur.innerHTML =
    '<img src="../assets/nathan.webp" alt="" width="68" height="68" loading="lazy" decoding="async">' +
    '<div><p class="qui">Nathan Leprêtre</p>' +
    '<p class="role">Fondateur de NexBoost, à Valenciennes. J’aide les artisans et les commerçants à être trouvés ' +
    'en ligne, avec un marketing humain, accessible et sans jargon.</p>' +
    '<p class="liens"><a' + (dejaCta ? '' : ' class="contact"') + ' href="../index.html#contact">Me poser une question</a>' +
    '<a href="../a-propos.html">Mon parcours</a></p></div>';
  art.appendChild(auteur);

  // ─── À lire ensuite : trois articles pris dans l'index du blog ───────
  // Un article qui a déjà sa liste « À lire aussi », écrite à la main, la garde seule.
  if (art.querySelector('.liens-lies') || document.querySelector('.blog-related') || !window.fetch || !window.DOMParser) return;
  var ici = location.pathname.split('/').pop() || '';
  function charger() {
    fetch('index.html', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
      .then(function (txt) {
        var doc = new DOMParser().parseFromString(txt, 'text/html');
        var cartes = Array.prototype.map.call(doc.querySelectorAll('.blog-card'), function (c) {
          var a = c.querySelector('a[href]');
          var h = c.querySelector('h2');
          var tag = c.querySelector('.card-tag');
          var duree = c.querySelector('.card-time');
          return {
            href: a ? a.getAttribute('href') : '', titre: h ? h.textContent.trim() : '',
            cat: c.getAttribute('data-cat') || '', libelle: tag ? tag.textContent.trim() : '',
            duree: duree ? duree.textContent.trim() : ''
          };
        }).filter(function (c) { return c.href && c.titre && !/^(https?:)?\/\//.test(c.href); });
        var moi = cartes.filter(function (c) { return c.href === ici; })[0];
        var autres = cartes.filter(function (c) { return c.href !== ici; });
        // D'abord le même sujet, puis les plus récents (l'index est rangé du plus récent au plus ancien).
        var choix = autres.filter(function (c) { return moi && c.cat === moi.cat; })
          .concat(autres.filter(function (c) { return !moi || c.cat !== moi.cat; })).slice(0, 3);
        if (!choix.length) return;
        var zone = document.createElement('section');
        zone.className = 'a-lire';
        zone.setAttribute('aria-labelledby', 'a-lire-titre');
        zone.innerHTML = '<h2 id="a-lire-titre">À lire ensuite</h2><div class="cartes">' + choix.map(function (c) {
          return '<article class="carte-lire"><span class="cat">' + esc(c.libelle) + '</span>' +
            '<a href="' + esc(c.href) + '">' + esc(c.titre) + '</a>' +
            (c.duree ? '<span class="duree">' + esc(c.duree) + '</span>' : '') + '</article>';
        }).join('') + '</div>';
        art.insertAdjacentElement('afterend', zone);
      })
      .catch(function () {});
  }
  // Chargé quand le lecteur approche de la fin : rien de plus au premier affichage.
  if ('IntersectionObserver' in window) {
    var guet = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { guet.disconnect(); charger(); }
    }, { rootMargin: '0px 0px 900px 0px' });
    guet.observe(auteur);
  } else {
    charger();
  }
})();
