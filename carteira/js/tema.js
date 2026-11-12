/* Aplica o tema salvo antes de a página aparecer (evita piscar). */
(function () {
  'use strict';
  var tema = null;
  try { tema = localStorage.getItem('msc:tema'); } catch (e) { /* sem armazenamento */ }
  if (tema === 'claro' || tema === 'escuro') document.documentElement.setAttribute('data-tema', tema);
})();
