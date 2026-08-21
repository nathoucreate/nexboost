/**
 * NexBoost — Thème
 *
 * Le clair est le thème par défaut : il est posé directement dans le HTML
 * (`<html data-theme="light">`), donc il s'affiche sans attendre le JavaScript
 * et sans le moindre clignotement. Le sombre correspond à l'ABSENCE d'attribut,
 * ce qui laisse intactes les 33 règles [data-theme="light"] déjà écrites.
 *
 * Ce fichier ne fait que deux choses : câbler le bouton, et le créer sur les
 * pages qui n'en ont pas. La préférence enregistrée, elle, est appliquée par un
 * court script en <head> — trop tard ici, la page serait déjà peinte.
 */
(function () {
  'use strict';

  var CLE = 'nexboost-theme';

  var LUNE = '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  var SOLEIL = '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

  function estSombre() {
    return !document.documentElement.hasAttribute('data-theme');
  }

  function appliquer(sombre) {
    if (sombre) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', 'light');
    try { localStorage.setItem(CLE, sombre ? 'dark' : 'light'); } catch (e) {}
    etiqueter();
  }

  function etiqueter() {
    var b = document.getElementById('themeToggle');
    if (b) b.setAttribute('aria-label', estSombre() ? 'Passer en thème clair' : 'Passer en thème sombre');
  }

  function init() {
    var b = document.getElementById('themeToggle');

    if (!b) {
      // Les barres de navigation sont en space-between : on insère le bouton
      // avant le dernier élément et on le colle à droite, pour qu'il rejoigne
      // le bouton existant au lieu de flotter au milieu.
      var hote = document.querySelector('.nav-inner') || document.querySelector('.blog-nav');
      if (!hote || !hote.lastElementChild) return;
      b = document.createElement('button');
      b.className = 'theme-toggle';
      b.id = 'themeToggle';
      b.type = 'button';
      b.setAttribute('data-injecte', '');
      b.innerHTML = LUNE + SOLEIL;
      hote.insertBefore(b, hote.lastElementChild);
    }

    if (b.getAttribute('data-cable')) return;   // jamais deux écouteurs
    b.setAttribute('data-cable', '1');
    b.addEventListener('click', function () { appliquer(!estSombre()); });
    etiqueter();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
