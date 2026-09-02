// Divin — logique du prototype. Tout vit dans le navigateur (localStorage),
// aucune donnée n'est envoyée nulle part.

/* ---------------- service worker (installation, hors-ligne) ---------------- */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}

/* ---------------- supabase (comptes reels, synchronises entre appareils) ---------------- */

var SUPABASE_URL = 'https://tsbllhsphusqnubvxyug.supabase.co';
var SUPABASE_KEY = 'sb_publishable_3xQeMvR3Zw2u2VNFDpTzDw_7fE6jYHz';
var sb = (typeof supabase !== 'undefined' && supabase.createClient)
  ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

  function synchroniserProfil() {
      if (!sb) return;
      sb.auth.getSession().then(function (res) {
            var session = res.data.session;
            if (!session) return;
            var p = lireProfil();
            sb.from('profiles').update({
                    pseudo: p.pseudo, age: p.age, age_elle: p.ageElle, age_lui: p.ageLui,
                    ville: p.ville, type: p.type, genre: p.genre, description: p.description,
                    physique: p.physique || {}, verifie: !!p.verifie
            }).eq('id', session.user.id).then(function () {});
      });
  }

/* ---------------- installation (ajout à l'écran d'accueil) ---------------- */

var invitePrompt = null;

function enModeInstalle() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function afficherBanniereInstallation(contenu) {
  if (enModeInstalle() || localStorage.getItem('divin.installMasque') === '1') return;
  if (document.getElementById('divin-installer')) return;

  var decale = document.querySelector('.nav') ? 'calc(var(--nav-h, 62px) + 14px + env(safe-area-inset-bottom,0px))' : 'calc(14px + env(safe-area-inset-bottom,0px))';
  var b = document.createElement('div');
  b.id = 'divin-installer';
  b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);width:min(calc(100% - 28px), 400px);bottom:' + decale + ';z-index:98;display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:12px;background:#1C1517;border:1px solid #2C2729;box-shadow:0 10px 30px rgba(0,0,0,.5);';
  b.innerHTML =
    '<img src="/icone-180.png" width="34" height="34" alt="" style="border-radius:8px;flex:0 0 auto;">' +
    '<div style="flex:1 1 auto;font-size:12.5px;line-height:1.4;color:#EFE9EA;">' + contenu.texte + '</div>' +
    (contenu.bouton ? '<button id="divin-installer-go" style="flex:0 0 auto;min-height:38px;padding:0 14px;border-radius:8px;background:#C08B77;color:#1A1214;font-size:13px;font-weight:700;">' + contenu.bouton + '</button>' : '') +
    '<button id="divin-installer-fermer" aria-label="Fermer" style="flex:0 0 auto;width:28px;height:28px;color:#9A9093;font-size:16px;">×</button>';
  document.body.appendChild(b);

  document.getElementById('divin-installer-fermer').addEventListener('click', function () {
    localStorage.setItem('divin.installMasque', '1');
    b.remove();
  });

  var goBtn = document.getElementById('divin-installer-go');
  if (goBtn) {
    goBtn.addEventListener('click', function () {
      if (!invitePrompt) return;
      invitePrompt.prompt();
      invitePrompt.userChoice.finally(function () {
        invitePrompt = null;
        b.remove();
      });
    });
  }
}

window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  invitePrompt = e;
  afficherBanniereInstallation({ texte: 'Installez Divin sur votre écran d\'accueil pour un accès plus rapide.', bouton: 'Installer' });
});

document.addEventListener('DOMContentLoaded', function () {
  var estIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (estIOS && !invitePrompt) {
    afficherBanniereInstallation({ texte: 'Pour installer Divin : appuyez sur Partager, puis « Sur l\'écran d\'accueil ».', bouton: null });
  }
});

/* ---------------- état ---------------- */

function lireProfil() {
  try { return JSON.parse(localStorage.getItem('divin.profil')) || {}; }
  catch (e) { return {}; }
}
function ecrireProfil(delta) {
  try {
    var p = lireProfil();
    for (var k in delta) p[k] = delta[k];
    localStorage.setItem('divin.profil', JSON.stringify(p));
    return p;
  } catch (e) { return delta; }
}
function lireEtat(cle, defaut) {
  try { var v = JSON.parse(localStorage.getItem('divin.' + cle)); return v === null ? defaut : v; }
  catch (e) { return defaut; }
}
function ecrireEtat(cle, valeur) {
  try { localStorage.setItem('divin.' + cle, JSON.stringify(valeur)); } catch (e) {}
}

/* ---------------- toast (retour visuel global) ---------------- */

function toast(message) {
  var t = document.getElementById('divin-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'divin-toast';
    t.style.cssText = 'position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) translateY(8px);z-index:99;max-width:86%;padding:12px 18px;border-radius:10px;background:#2A2224;color:#EFE9EA;font-size:13.5px;line-height:1.4;box-shadow:0 10px 30px rgba(0,0,0,.5);opacity:0;transition:opacity .18s ease, transform .18s ease;pointer-events:none;text-align:center;';
    document.body.appendChild(t);
  }
  t.textContent = message;
  requestAnimationFrame(function () {
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
  });
  clearTimeout(t._minuteur);
  t._minuteur = setTimeout(function () {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(8px)';
  }, 2400);
}

/* ---------------- profils et lives de démonstration ---------------- */

var PROFILS = {
  nina: { nom: 'Nina', meta: 'Bi · 32 ans · Chartres · à 2 km · vue il y a 2 h', couple: false,
    presentation: 'Douce et curieuse, je découvre le milieu à mon rythme. Discussion d’abord, toujours.',
    amorce: 'Bonsoir, merci pour le like. On discute ?',
    phys: [{ titre: 'Nina, 32 ans', lignes: [['Taille', '1,68 m'], ['Poids', '58 kg'], ['Silhouette', 'Mince'], ['Poitrine', '90 C'], ['Cheveux', 'Bruns'], ['Yeux', 'Verts'], ['Épilation', 'Intégrale'], ['Tatouages', '1']] }],
    teinte: 't1' },
  camille: { nom: 'Camille & Théo', meta: 'Hétéros · 34 et 37 ans · Lucé · à 5 km · vus hier', couple: true,
    presentation: 'Ensemble depuis douze ans, curieux et sans pression. Le respect et le consentement passent avant tout le reste.',
    amorce: 'On sera au Loft samedi soir, vous venez ?',
    phys: [
      { titre: 'Camille, 34 ans', lignes: [['Taille', '1,68 m'], ['Poids', '58 kg'], ['Silhouette', 'Mince'], ['Poitrine', '90 C'], ['Cheveux', 'Bruns'], ['Yeux', 'Verts'], ['Épilation', 'Intégrale'], ['Tatouages', '1']] },
      { titre: 'Théo, 37 ans', lignes: [['Taille', '1,82 m'], ['Poids', '78 kg'], ['Silhouette', 'Sportif'], ['Dimensions', '17 cm'], ['Cheveux', 'Châtains'], ['Yeux', 'Bruns'], ['Épilation', 'Rasé'], ['Barbe', 'Courte']] }
    ],
    teinte: 't2' },
  adrien: { nom: 'Adrien', meta: 'Pan · 41 ans · Luisant · à 7 km · vu il y a 3 j', couple: false,
    presentation: 'Discret et courtois. J’aime prendre le temps d’un verre avant toute chose.',
    amorce: 'Merci pour l’accès aux photos.',
    phys: [{ titre: 'Adrien, 41 ans', lignes: [['Taille', '1,79 m'], ['Poids', '76 kg'], ['Silhouette', 'Sportif'], ['Dimensions', '16 cm'], ['Cheveux', 'Noirs'], ['Yeux', 'Marron'], ['Épilation', 'Naturelle'], ['Barbe', 'Rasé de près']] }],
    teinte: 't3' },
  lise: { nom: 'Lise & Marc', meta: 'Bis · 45 et 48 ans · Mainvilliers · à 9 km · vus il y a 5 j', couple: true,
    presentation: 'Couple épanoui, habitués des soirées du Loft. Amitiés bienvenues.',
    amorce: 'Vous serez à la soirée Velours samedi ?',
    phys: [
      { titre: 'Lise, 45 ans', lignes: [['Taille', '1,62 m'], ['Poids', '68 kg'], ['Silhouette', 'Pulpeuse'], ['Poitrine', '95 D'], ['Cheveux', 'Blonds'], ['Yeux', 'Bleus'], ['Épilation', 'Partielle'], ['Tatouages', 'Aucun']] },
      { titre: 'Marc, 48 ans', lignes: [['Taille', '1,75 m'], ['Poids', '88 kg'], ['Silhouette', 'Enrobé'], ['Dimensions', '15 cm'], ['Cheveux', 'Gris'], ['Yeux', 'Verts'], ['Épilation', 'Naturelle'], ['Barbe', 'Moustache']] }
    ],
    teinte: 't4' }
};

var LIVES = {
  nina: { nom: 'Nina', sous: 'On papote · Chartres · 2 km', teinte: 't1', v: '42' },
  camille: { nom: 'Camille & Théo', sous: 'Avant de sortir · Lucé · 5 km', teinte: 't2', v: '118' },
  adrien: { nom: 'Adrien', sous: 'Question du soir · Luisant · 7 km', teinte: 't3', v: '7' },
  lise: { nom: 'Lise & Marc', sous: 'Soirée tranquille · Mainvilliers · 9 km', teinte: 't4', v: '23' }
};

var SOIREES = {
  velours: { titre: 'Soirée Velours', sur: 'Samedi 6 septembre · 22 h', lieu: 'Le Loft · Chartres · 3 km',
    organisateur: 'Le Loft', teinte: 't4', horaires: '22 h – 5 h', placesTexte: '18 sur 40', complet: false,
    tarifCouple: '40 €', tarifFemme: 'Gratuit', hommeAdmis: false,
    description: 'Ambiance feutrée, musique lounge jusqu’à minuit puis house. Buffet salé offert à 23 h. Espace détente et sauna ouverts toute la nuit.',
    etiquettes: ['Couples et femmes seules', 'Buffet offert', 'Sauna', 'Parking gratuit', 'Accès PMR'] },
  apero: { titre: 'Apéro rencontre', sur: 'Vendredi 12 septembre · 19 h', lieu: 'Bar privatisé · Lucé · 6 km',
    organisateur: 'Bar privatisé', teinte: 't2', horaires: '19 h – 23 h', placesTexte: '9 sur 25', complet: false,
    tarifCouple: 'Entrée libre', tarifFemme: 'Entrée libre', hommeAdmis: true, tarifHomme: '10 €',
    description: 'Rencontre informelle autour d’un verre, sans obligation de suite. Idéal pour découvrir le milieu et poser des questions sans pression.',
    etiquettes: ['Sans suite obligatoire', 'Débutants bienvenus', 'Discussions ouvertes'] },
  masquee: { titre: 'Soirée masquée', sur: 'Samedi 20 septembre · 21 h', lieu: 'Domicile privé · Dreux · 34 km',
    organisateur: 'Hôtes privés', teinte: 't3', horaires: '21 h – 4 h', placesTexte: '12 places, sur sélection', complet: false,
    surSelection: true, tarifCouple: 'Communiqué après sélection', tarifFemme: 'Communiqué après sélection', hommeAdmis: false,
    description: 'Soirée intimiste sur invitation, masque obligatoire jusqu’à minuit. Nombre de places volontairement limité pour préserver l’ambiance.',
    etiquettes: ['Sur sélection', 'Masque obligatoire', '12 places'] },
  nuitblanche: { titre: 'Nuit blanche', sur: 'Samedi 27 septembre · 22 h', lieu: 'Le Loft · Chartres · 3 km',
    organisateur: 'Le Loft', teinte: 't4', horaires: '22 h – 6 h', placesTexte: '40 sur 40', complet: true,
    tarifCouple: '45 €', tarifFemme: 'Gratuit', hommeAdmis: false,
    description: 'Édition spéciale de fin de mois jusqu’au lever du jour. Ouverture des portes à 22 h, dernier service au buffet à 3 h.',
    etiquettes: ['Couples et femmes seules', 'Buffet offert', 'Ouvert jusqu’au matin'] }
};

function param(nom) {
  try { return new URLSearchParams(location.search).get(nom); } catch (e) { return null; }
}

/* ---------------- interactions génériques ---------------- */

document.addEventListener('click', function (e) {
  var b = e.target.closest('.bascule');
  if (b && !b.closest('a')) { b.classList.toggle('bascule--off'); e.preventDefault(); return; }

  var c = e.target.closest('.dispo__c');
  if (c) {
    if (c.classList.contains('on')) { c.classList.remove('on'); c.classList.add('peut'); }
    else if (c.classList.contains('peut')) { c.classList.remove('peut'); }
    else { c.classList.add('on'); }
    return;
  }

  var x = e.target.closest('[data-choix]');
  if (x) {
    var freres = x.parentElement.querySelectorAll('[data-choix]');
    for (var i = 0; i < freres.length; i++) freres[i].classList.remove('actif');
    x.classList.add('actif');
    var evt = new CustomEvent('divin:choix', { detail: x.getAttribute('data-choix') });
    document.dispatchEvent(evt);
    return;
  }

  // action simulée générique : data-action="message" affiché en toast + état "fait"
  var a = e.target.closest('[data-action]');
  if (a) {
    e.preventDefault();
    if (a.classList.contains('fait')) return;
    a.classList.add('fait');
    var apres = a.getAttribute('data-apres');
    if (apres) {
      a.textContent = apres;
      a.style.opacity = '.65';
    }
    toast(a.getAttribute('data-action'));
    return;
  }

  var p = e.target.closest('.pastille');
  if (p && !p.classList.contains('pastille--plus') && !p.closest('a')) {
    if (p.classList.contains('pastille--non')) return;
    if (p.hasAttribute('data-filtre')) { filtrer(p); return; }
    if (p.parentElement.hasAttribute('data-exclusif')) {
      var frP = p.parentElement.querySelectorAll('.pastille');
      for (var fi = 0; fi < frP.length; fi++) frP[fi].classList.remove('pastille--on');
      p.classList.add('pastille--on');
      return;
    }
    p.classList.toggle('pastille--on');
    return;
  }
});

/* ---------------- filtres réels (découvrir) ---------------- */

function filtrer(pastille) {
  var groupe = pastille.parentElement;
  var toutes = groupe.querySelectorAll('[data-filtre]');
  var f = pastille.getAttribute('data-filtre');
  for (var i = 0; i < toutes.length; i++) toutes[i].classList.remove('pastille--on');
  pastille.classList.add('pastille--on');
  // filtre combine : une carte doit passer la pastille active de CHAQUE rangee
  var actifs = document.querySelectorAll('.pastille--on[data-filtre]');
  var cartes = document.querySelectorAll('[data-type]');
  for (var j = 0; j < cartes.length; j++) {
    var ct = cartes[j], visible = true;
    for (var k = 0; k < actifs.length; k++) {
      var f2 = actifs[k].getAttribute('data-filtre');
      var ok =
        f2 === 'tous' || f2 === 'toutes' ? true :
        f2 === 'couples' ? ct.getAttribute('data-type') === 'couple' :
        f2 === 'seuls' ? ct.getAttribute('data-type') !== 'couple' :
        f2 === 'solo-f' || f2 === 'solo-h' ? ct.getAttribute('data-type') === f2 :
        f2 === 'dispo' ? ct.getAttribute('data-dispo') === 'oui' :
        (ct.getAttribute('data-orientation') || '') === f2;
      if (!ok) { visible = false; break; }
    }
    ct.style.display = visible ? '' : 'none';
  }
  var unVisible = false;
  for (var m = 0; m < cartes.length; m++) if (cartes[m].style.display !== 'none') { unVisible = true; break; }
  var vide = document.getElementById('aucun-profil');
  if (!vide && cartes.length) {
    vide = document.createElement('p');
    vide.id = 'aucun-profil';
    vide.style.cssText = 'margin:26px 0;text-align:center;font-size:13px;color:#6E6467;';
    vide.textContent = 'Aucun profil ne correspond à ces filtres.';
    cartes[0].parentElement.appendChild(vide);
  }
  if (vide) vide.style.display = unVisible ? 'none' : '';
}

/* ---------------- logique par page ---------------- */

document.addEventListener('DOMContentLoaded', function () {
  var page = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  var profil = lireProfil();

  /* ---- logo sur toutes les pages (demande Jean 01/09) ---- */
  if (!document.querySelector('img[src$="badge.png"]')) {
    var hoteLogo = document.querySelector('.entete') || document.querySelector('.barre') || document.querySelector('.plateau__haut') || document.querySelector('.bandeau');
    if (hoteLogo) {
      var logo = document.createElement('img');
      logo.src = '/badge-petit.png'; logo.alt = '';
      if (hoteLogo.classList.contains('entete')) {
        var h1Logo = hoteLogo.querySelector('.titre');
        logo.style.cssText = 'width:26px;height:26px;vertical-align:-4px;margin-right:10px;';
        if (h1Logo) h1Logo.insertBefore(logo, h1Logo.firstChild);
      } else if (hoteLogo.classList.contains('bandeau')) {
        logo.style.cssText = 'position:absolute;top:14px;right:14px;width:26px;height:26px;z-index:5;';
        hoteLogo.appendChild(logo);
      } else {
        logo.style.cssText = 'width:24px;height:24px;flex:0 0 auto;margin-left:auto;';
        hoteLogo.appendChild(logo);
      }
    }
  }

  /* ---- accueil : la case 18 ans doit être cochée PAR L'UTILISATEUR ---- */
  if (page === '/' || page === '/index') {
    var case18 = document.getElementById('case18');
    var btnCreer = document.getElementById('btn-creer');
    if (case18 && btnCreer) {
      var coche = false;
      var maj = function () {
        case18.classList.toggle('cocher--off', !coche);
        btnCreer.style.opacity = coche ? '' : '.45';
      };
      maj();
      case18.parentElement.addEventListener('click', function () { coche = !coche; maj(); });
      btnCreer.addEventListener('click', function (ev) {
        if (!coche) {
          ev.preventDefault();
          toast('Cochez d’abord la case : vous devez certifier avoir 18 ans ou plus.');
        }
      });
    }
  }

  /* ---- inscription : validation + stockage ---- */
  if (page === '/inscription') {
    var blocGenre = document.getElementById('bloc-genre');
    var majGenre = function (type) {
      var couple = (type === 'couple');
      if (blocGenre) blocGenre.style.display = couple ? 'none' : '';
      var duoCouple = document.getElementById('duo-age-couple');
      var champAge = document.getElementById('age');
      var champVille = document.getElementById('ville');
      if (duoCouple) duoCouple.style.display = couple ? '' : 'none';
      if (champAge) champAge.style.display = couple ? 'none' : '';
      if (champVille) champVille.style.gridColumn = couple ? '1 / -1' : '';
    };
    majGenre((document.querySelector('[data-choix].actif') || {}).getAttribute
      ? (document.querySelector('[data-choix].actif').getAttribute('data-choix')) : 'solo');
    document.addEventListener('divin:choix', function (ev) {
      if (ev.detail === 'solo' || ev.detail === 'couple') majGenre(ev.detail);
    });
    // pré-remplir si profil déjà stocké
    if (profil.pseudo) document.getElementById('pseudo').value = profil.pseudo;
    if (profil.age) document.getElementById('age').value = profil.age;
    if (profil.ville) document.getElementById('ville').value = profil.ville;

    document.getElementById('btn-continuer').addEventListener('click', function (ev) {
      ev.preventDefault();
      var email = (document.getElementById('email').value || '').trim();
      var motDePasse = document.getElementById('mot-de-passe').value || '';
      var pseudo = (document.getElementById('pseudo').value || '').trim();
      var ville = (document.getElementById('ville').value || '').trim();
      var type = (document.querySelector('[data-choix].actif') || { getAttribute: function () { return 'solo'; } }).getAttribute('data-choix');
      var genre = (document.querySelector('#bloc-genre .pastille--on') || { textContent: 'Une femme' }).textContent.trim();
      if (!email || email.indexOf('@') === -1) { toast('Indiquez une adresse email valide.'); return; }
      if (motDePasse.length < 6) { toast('Le mot de passe doit faire au moins 6 caractères.'); return; }
      if (!pseudo) { toast('Choisissez un pseudo pour continuer.'); return; }
      var lireAge = function (id) { return parseInt((document.getElementById(id).value || '').replace(/\D/g, ''), 10); };
      var donnees;
      if (type === 'couple') {
        var aE = lireAge('age-elle'), aL = lireAge('age-lui');
        if (!aE || !aL || isNaN(aE) || isNaN(aL)) { toast('Indiquez l’âge de chacun de vous deux.'); return; }
        if (aE < 18 || aL < 18) { toast('Divin est réservé aux adultes : 18 ans minimum pour chacun.'); return; }
        donnees = { pseudo: pseudo, age: Math.min(aE, aL), ageElle: aE, ageLui: aL, ville: ville || 'Chartres', type: 'couple', genre: 'couple' };
      } else {
        var age = lireAge('age');
        if (!age || isNaN(age)) { toast('Indiquez votre âge.'); return; }
        if (age < 18) { toast('Divin est réservé aux adultes : 18 ans minimum.'); return; }
        donnees = { pseudo: pseudo, age: age, ageElle: null, ageLui: null, ville: ville || 'Chartres', type: 'solo', genre: (genre === 'Un homme' ? 'homme' : 'femme') };
      }
      if (!sb) { toast('Connexion au service impossible pour le moment. Réessayez plus tard.'); return; }
      var btnC = document.getElementById('btn-continuer');
      btnC.style.opacity = '.6';
      sb.auth.signUp({ email: email, password: motDePasse }).then(function (res) {
        if (res.error) {
          btnC.style.opacity = '';
          toast(res.error.message.indexOf('already registered') !== -1 || res.error.message.indexOf('already been registered') !== -1
            ? 'Un compte existe déjà avec cet email.' : 'Inscription impossible : ' + res.error.message);
          return;
        }
        ecrireProfil(donnees);
        var utilisateur = res.data.user;
        if (utilisateur) {
          sb.from('profiles').update({
            pseudo: donnees.pseudo, age: donnees.age, age_elle: donnees.ageElle, age_lui: donnees.ageLui,
            ville: donnees.ville, type: donnees.type, genre: donnees.genre
          }).eq('id', utilisateur.id).then(function () {});
        }
        location.href = '/physique';
      });
    });
  }

  /* ---- connexion : compte existant ---- */
  if (page === '/connexion') {
    var btnConn = document.getElementById('btn-connexion');
    var erreurConn = document.getElementById('erreur-connexion');
    if (btnConn) btnConn.addEventListener('click', function (ev) {
      ev.preventDefault();
      var email = (document.getElementById('email-connexion').value || '').trim();
      var mdp = document.getElementById('mdp-connexion').value || '';
      if (erreurConn) erreurConn.style.display = 'none';
      if (!email || !mdp) { toast('Indiquez votre email et votre mot de passe.'); return; }
      if (!sb) { toast('Connexion au service impossible pour le moment. Réessayez plus tard.'); return; }
      btnConn.style.opacity = '.6';
      sb.auth.signInWithPassword({ email: email, password: mdp }).then(function (res) {
        btnConn.style.opacity = '';
        if (res.error) {
          if (erreurConn) { erreurConn.textContent = 'Email ou mot de passe incorrect.'; erreurConn.style.display = ''; }
          return;
        }
        sb.from('profiles').select('*').eq('id', res.data.user.id).single().then(function (r) {
          if (r.data) {
            ecrireProfil({
              pseudo: r.data.pseudo, age: r.data.age, ageElle: r.data.age_elle, ageLui: r.data.age_lui,
              ville: r.data.ville, type: r.data.type, genre: r.data.genre,
              description: r.data.description, physique: r.data.physique || {}, verifie: r.data.verifie
            });
          }
          location.href = '/decouvrir';
        });
      });
    });
  }

  /* ---- physique : adapté au profil, données séparées Elle/Lui ---- */
  if (page === '/physique') {
    var estCouple = profil.type === 'couple';
    var estHomme = profil.genre === 'homme';
    var onglets = document.getElementById('onglets-physique');
    var titrePoitrine = document.getElementById('champ-poitrine');
    var silhouettes = document.getElementById('pastilles-silhouette');
    var cote = lireEtat('physique.cote', 'elle');

    if (!estCouple && onglets) onglets.style.display = 'none';
    if (estCouple && onglets) {
      onglets.children[0].textContent = 'Elle';
      onglets.children[1].textContent = 'Lui';
    }
    var masculin = (!estCouple && estHomme) || (estCouple && cote === 'lui');
    var appliquerGenre = function () {
      if (titrePoitrine) {
        var lab = titrePoitrine.querySelector('span');
        var inp = titrePoitrine.querySelector('input');
        if (lab) lab.textContent = masculin ? 'Dimensions' : 'Poitrine';
        if (inp) inp.placeholder = masculin ? '17 cm' : '90 C';
      }
      var barbe = document.getElementById('ligne-barbe');
      if (barbe) barbe.style.display = masculin ? '' : 'none';
      if (silhouettes) {
        var libs = masculin ? ['Mince', 'Sportif', 'Costaud', 'Enrobé']
                            : ['Mince', 'Sportive', 'Pulpeuse', 'Ronde'];
        var pastilles = silhouettes.querySelectorAll('.pastille');
        for (var i = 0; i < pastilles.length && i < libs.length; i++) pastilles[i].textContent = libs[i];
      }
    };
    var lignesDetail = function () { return document.querySelectorAll('.lignes .ligne'); };
    var chargerCote = function () {
      var d = (profil.physique || {})[estCouple ? cote : 'solo'] || {};
      var t = document.getElementById('taille'); if (t) t.value = d.taille || '';
      var po = document.getElementById('poids'); if (po) po.value = d.poids || '';
      var pt = document.getElementById('poitrine'); if (pt) pt.value = d.poitrine || '';
      var DEFAUTS_DETAILS = { Orientation: 'Hétéro', Cheveux: 'Bruns', Yeux: 'Verts', 'Épilation': 'Intégrale', Tatouages: '1', Piercings: 'Non renseigné', Barbe: 'Courte' };
      var detailsCote = d.details || {};
      var ls = lignesDetail();
      for (var dj = 0; dj < ls.length; dj++) {
        var nEl = ls[dj].querySelector('.ligne__nom'), vEl = ls[dj].querySelector('.ligne__val');
        if (nEl && vEl) {
          var nomDet = nEl.textContent.trim();
          vEl.textContent = detailsCote[nomDet] || DEFAUTS_DETAILS[nomDet] || vEl.textContent.trim();
        }
      }
      if (silhouettes) {
        var ps = silhouettes.querySelectorAll('.pastille');
        for (var dk = 0; dk < ps.length; dk++) {
          ps[dk].classList.toggle('pastille--on', d.silhouette ? ps[dk].textContent.trim() === d.silhouette : dk === 0);
        }
      }
    };
    var sauverCote = function () {
      var phys = profil.physique || {};
      var dets = {};
      var ls2 = lignesDetail();
      for (var sj = 0; sj < ls2.length; sj++) {
        var nE = ls2[sj].querySelector('.ligne__nom'), vE = ls2[sj].querySelector('.ligne__val');
        if (nE && vE) dets[nE.textContent.trim()] = vE.textContent.trim();
      }
      var silAct = silhouettes ? silhouettes.querySelector('.pastille--on') : null;
      phys[estCouple ? cote : 'solo'] = {
        taille: (document.getElementById('taille') || {}).value || '',
        poids: (document.getElementById('poids') || {}).value || '',
        poitrine: (document.getElementById('poitrine') || {}).value || '',
        details: dets,
        silhouette: silAct ? silAct.textContent.trim() : ''
      };
      profil = ecrireProfil({ physique: phys });
    };
    appliquerGenre(); chargerCote();
    // description libre (commune au profil, pas par cote)
    var descEl = document.getElementById('description');
    if (descEl) {
      descEl.value = profil.description || '';
      descEl.addEventListener('input', function () { profil = ecrireProfil({ description: descEl.value }); });
    }
    document.addEventListener('divin:choix', function (ev) {
      if (ev.detail === 'elle' || ev.detail === 'lui') {
        sauverCote();
        cote = ev.detail; ecrireEtat('physique.cote', cote);
        masculin = estCouple ? (cote === 'lui') : estHomme;
        appliquerGenre(); chargerCote();
      }
    });
    // lignes Cheveux / Yeux / ... : le clic fait défiler les valeurs
    var CYCLES = {
      Orientation: ['Hétéro', 'Bi', 'Bi-curieux(se)', 'Homo', 'Pan'],
      Cheveux: ['Bruns', 'Blonds', 'Châtains', 'Noirs', 'Gris', 'Rasés'],
      Yeux: ['Verts', 'Bleus', 'Marron', 'Noisette', 'Gris'],
      'Épilation': ['Intégrale', 'Partielle', 'Naturelle'],
      Tatouages: ['1', 'Plusieurs', 'Aucun'],
      Piercings: ['Non renseigné', 'Oui', 'Non'],
      Barbe: ['Courte', 'Longue', 'Rasé de près', 'Moustache']
    };
    var lignes = document.querySelectorAll('.lignes .ligne');
    for (var li = 0; li < lignes.length; li++) {
      (function (l) {
        var nomEl = l.querySelector('.ligne__nom');
        var valEl = l.querySelector('.ligne__val');
        if (!nomEl || !valEl || !CYCLES[nomEl.textContent.trim()]) return;
        l.style.cursor = 'pointer';
        l.addEventListener('click', function () {
          var nomLigne = nomEl.textContent.trim();
          var liste = CYCLES[nomLigne].slice();
          // demande de Jean (01/09) : option « Autre » pour les cheveux, cote femme
          if (nomLigne === 'Cheveux' && !masculin) liste.push('Autre');
          var idx = liste.indexOf(valEl.textContent.trim());
          valEl.textContent = liste[(idx + 1) % liste.length];
          valEl.style.color = '';
          sauverCote();
        });
      })(lignes[li]);
    }
    if (silhouettes) silhouettes.addEventListener('click', function () { setTimeout(sauverCote, 0); });
    var btnSuite = document.getElementById('btn-continuer');
    if (btnSuite) {
      // demande de Jean (01/09) : pas de verification photo apres une simple modification
      if (profil.verifie) { btnSuite.textContent = 'Enregistrer'; btnSuite.setAttribute('href', '/moi'); }
      btnSuite.addEventListener('click', function () { sauverCote(); synchroniserProfil(); });
    }
  }

  /* ---- vérification : séquence simulée ---- */
  if (page === '/verification') {
    var btnCam = document.getElementById('btn-camera');
    var geste = document.getElementById('cadre-geste');
    if (btnCam && profil.verifie) {
      if (geste) geste.innerHTML = '<div style="font-size:15px;font-weight:700;color:#8CB79A;padding:26px 10px;text-align:center;">Profil déjà vérifié ✓<br><span style="font-size:12px;color:#9A9093;font-weight:400;">La vérification ne se refait pas après une modification du profil.</span></div>';
      btnCam.textContent = 'Continuer';
      btnCam.addEventListener('click', function (ev) { ev.preventDefault(); location.href = '/decouvrir'; });
    } else if (btnCam) {
      btnCam.addEventListener('click', function (ev) {
        ev.preventDefault();
        if (btnCam.classList.contains('fait')) return;
        btnCam.classList.add('fait');
        btnCam.textContent = 'Photo prise ✓';
        toast('Photo envoyée. Contrôle en cours…');
        setTimeout(function () {
          ecrireProfil({ verifie: true });
                        synchroniserProfil();
          if (geste) geste.innerHTML = '<div style="font-size:15px;font-weight:700;color:#8CB79A;padding:26px 10px;text-align:center;">Profil vérifié ✓<br><span style="font-size:12px;color:#9A9093;font-weight:400;">(simulé — dans la vraie application, une personne contrôle sous 24 h)</span></div>';
          btnCam.textContent = 'Continuer';
          btnCam.classList.remove('fait');
          btnCam.addEventListener('click', function () { location.href = '/decouvrir'; }, { once: true });
        }, 1600);
      });
    }
  }

  /* ---- mon profil : affiche VOS données ---- */
  if (page === '/moi') {
    var nomEl = document.getElementById('moi-nom');
    var metaEl = document.getElementById('moi-meta');
    if (nomEl && profil.pseudo) nomEl.childNodes[0].nodeValue = profil.pseudo + ' ';
    if (metaEl) {
      var bouts = [];
      if (profil.type === 'couple' && profil.ageElle && profil.ageLui) {
        bouts.push(profil.ageElle + ' et ' + profil.ageLui + ' ans');
      } else {
        bouts.push((profil.age ? profil.age + ' ans' : 'Âge non renseigné'));
      }
      bouts.push(profil.ville || 'Chartres');
      bouts.push(profil.type === 'couple' ? 'profil couple' : 'profil solo');
      bouts.push(profil.verifie ? 'vérifié ✓' : 'non vérifié');
      metaEl.textContent = bouts.join(' · ');
    }
    var descMoi = document.getElementById('moi-description');
    if (descMoi && profil.pseudo) {
      if (profil.description) { descMoi.textContent = profil.description; descMoi.style.color = '#C9C0C2'; }
      else { descMoi.textContent = 'Ajoutez quelques phrases sur vous depuis « Physique et mensurations ».'; descMoi.style.color = '#6E6467'; }
    }
    if (!profil.pseudo && nomEl) {
      nomEl.childNodes[0].nodeValue = 'Votre profil ';
      if (metaEl) metaEl.textContent = 'Créez votre profil pour commencer';
      toast('Astuce : passez par « Créer mon profil » pour voir vos informations ici.');
    }
  }

  /* ---- /moi : la carte club depend du statut du dossier ---- */
  if (page === '/moi') {
    var carteClub = document.getElementById('carte-club');
    if (carteClub) {
      var st = lireEtat('pro.statut', null);
      var titreC = carteClub.querySelector('b');
      var sousC = carteClub.querySelector('.carte__corps span');
      if (st === 'valide') {
        carteClub.setAttribute('href', '/pro');
        if (sousC) sousC.textContent = 'Accéder à mon espace établissement';
      } else if (st === 'attente') {
        carteClub.setAttribute('href', '/pro/creer');
        if (sousC) sousC.textContent = 'Dossier en cours de contrôle par la modération';
      } else {
        carteClub.setAttribute('href', '/pro/creer');
        if (titreC) titreC.textContent = 'Ouvrir un espace établissement';
        if (sousC) sousC.textContent = 'Réservé aux établissements réels — dossier contrôlé avant ouverture';
      }
    }
  }

  /* ---- fiche profil paramétrée ---- */
  if (page === '/profil') {
    var cle = param('p');
    var d = PROFILS[cle];
    if (d) {
      var titre = document.getElementById('profil-nom');
      var meta = document.getElementById('profil-meta');
      var pres = document.getElementById('profil-presentation');
      if (titre) titre.childNodes[0].nodeValue = d.nom + ' ';
      document.title = d.nom.replace(/&amp;/g, '&') + ' · Divin';
      if (meta) meta.textContent = d.meta;
      if (pres) pres.textContent = d.presentation;
      var bandoTeinte = document.querySelector('.bandeau');
      if (bandoTeinte && d.teinte) bandoTeinte.className = bandoTeinte.className.replace(/t[1-4]/, d.teinte);
      var lienEcrire = document.querySelector('a[href^="/conversation"]');
      if (lienEcrire) lienEcrire.setAttribute('href', '/conversation?c=' + cle); // conv-lien-profil
      // like memorise par profil (demande Jean 01/09)
      var btnLike = document.getElementById('btn-like');
      var coeurLike = document.getElementById('coeur-like');
      var peindreLike = function (on) {
        if (!coeurLike) return;
        coeurLike.style.fill = on ? '#C08B77' : 'none';
        coeurLike.style.stroke = on ? '#C08B77' : '#EFE9EA';
      };
      if (btnLike) {
        peindreLike(lireEtat('like.' + cle, false));
        btnLike.addEventListener('click', function (ev) {
          ev.preventDefault();
          var on = !lireEtat('like.' + cle, false);
          ecrireEtat('like.' + cle, on);
          peindreLike(on);
          toast(on ? 'Vous aimez le profil de ' + d.nom.replace(/&amp;/g, '&') + ' ✓ La personne sera prévenue.' : 'Like retiré.');
        });
      }
      // signalement motive (demande Jean 01/09)
      var lienSig = document.getElementById('lien-signaler');
      var blocSig = document.getElementById('bloc-signaler');
      var motifSig = document.getElementById('motif-signalement');
      var btnSig = document.getElementById('btn-signaler');
      var sigFait = function () {
        if (lienSig) { lienSig.textContent = 'Signalement envoyé ✓'; lienSig.style.textDecoration = 'none'; lienSig.style.opacity = '.7'; }
        if (blocSig) blocSig.style.display = 'none';
      };
      if (lireEtat('signale.' + cle, false)) sigFait();
      if (lienSig) lienSig.addEventListener('click', function (ev) {
        ev.preventDefault();
        if (lireEtat('signale.' + cle, false)) { toast('Ce profil est déjà signalé. La modération l’examine.'); return; }
        if (blocSig) {
          var ouvert = blocSig.style.display !== 'none';
          blocSig.style.display = ouvert ? 'none' : 'flex';
          if (!ouvert && motifSig) motifSig.focus();
        }
      });
      if (btnSig) btnSig.addEventListener('click', function (ev) {
        ev.preventDefault();
        if (!motifSig || !motifSig.value.trim()) { toast('Expliquez en quelques mots la raison du signalement.'); if (motifSig) motifSig.focus(); return; }
        ecrireEtat('signale.' + cle, true);
        sigFait();
        toast('Signalement transmis à la modération avec votre explication. Le profil sera examiné sous 24 h.');
      });
      if (d.phys) {
        var colonnes = document.querySelector('.phys');
        var remplirCol = function (col, cd) {
          col.innerHTML = '<h4></h4>';
          col.querySelector('h4').textContent = cd.titre;
          for (var pi = 0; pi < cd.lignes.length; pi++) {
            var lg = document.createElement('div');
            lg.className = 'phys__l';
            lg.innerHTML = '<span></span><b></b>';
            lg.querySelector('span').textContent = cd.lignes[pi][0];
            lg.querySelector('b').textContent = cd.lignes[pi][1];
            col.appendChild(lg);
          }
        };
        if (colonnes && colonnes.children[0]) {
          remplirCol(colonnes.children[0], d.phys[0]);
          if (d.phys[1] && colonnes.children[1]) {
            remplirCol(colonnes.children[1], d.phys[1]);
          } else if (colonnes.children[1]) {
            colonnes.style.gridTemplateColumns = 'minmax(0,1fr)';
            colonnes.children[1].style.display = 'none';
            colonnes.children[0].style.borderRight = '0';
            colonnes.children[0].style.paddingRight = '0';
          }
        }
      }
    }
  }

  /* ---- live paramétré + chat réel ---- */
  if (page === '/live') {
    var lv = LIVES[param('l')] || LIVES.camille;
    var lnom = document.getElementById('live-nom');
    var lsous = document.getElementById('live-sous');
    var lvues = document.getElementById('live-vues');
    if (lnom) lnom.childNodes[0].nodeValue = lv.nom + ' ';
    if (lsous) lsous.textContent = lv.sous;
    if (lvues) lvues.textContent = lv.v;
    var posterLive = document.querySelector('video');
    if (posterLive && lv.teinte) posterLive.setAttribute('poster', '/photos/' + lv.teinte + '.jpg');
    var vigLive = document.querySelector('.vig--mini');
    if (vigLive && lv.teinte) vigLive.className = 'vig vig--mini ' + lv.teinte;
    var fil = document.getElementById('tchat');
    var champ = document.getElementById('tchat-champ');
    var envoyer = document.getElementById('tchat-envoyer');
    var envoyerMsg = function () {
      if (!champ || !champ.value.trim() || !fil) return;
      var ligne = document.createElement('div');
      ligne.innerHTML = '<b class="hote" style="color:#E6C87E;">Vous</b><span></span>';
      ligne.querySelector('span').textContent = champ.value.trim();
      fil.appendChild(ligne);
      champ.value = '';
    };
    if (envoyer) envoyer.addEventListener('click', function (ev) { ev.preventDefault(); envoyerMsg(); });
    if (champ) champ.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); envoyerMsg(); } });
  }

  /* ---- soirée : contenu paramétré + inscription/désinscription par événement ---- */
  if (page === '/soiree') {
    var cleSoiree = param('s') || 'velours';
    var s = SOIREES[cleSoiree] || SOIREES.velours;
    if (!SOIREES[cleSoiree]) cleSoiree = 'velours';

    document.title = s.titre + ' · Divin';
    var bandeauS = document.querySelector('.bandeau');
    if (bandeauS && s.teinte) bandeauS.className = bandeauS.className.replace(/t[1-4]/, s.teinte);
    var surS = document.getElementById('soiree-sur'); if (surS) surS.textContent = s.sur;
    var titreS = document.getElementById('soiree-titre'); if (titreS) titreS.textContent = s.titre;
    var orgS = document.getElementById('soiree-organisateur');
    if (orgS && orgS.childNodes[0]) orgS.childNodes[0].nodeValue = s.organisateur + ' ';
    var orgVigS = document.getElementById('soiree-org-vig');
    if (orgVigS && s.teinte) orgVigS.className = orgVigS.className.replace(/t[1-4]/, s.teinte);
    var horairesS = document.getElementById('soiree-horaires'); if (horairesS) horairesS.textContent = s.horaires;
    var placesS = document.getElementById('soiree-places'); if (placesS) placesS.textContent = s.complet ? 'Complet' : s.placesTexte;
    var descS = document.getElementById('soiree-desc'); if (descS) descS.textContent = s.description;
    var tarifCoupleS = document.getElementById('soiree-tarif-couple'); if (tarifCoupleS) tarifCoupleS.textContent = s.tarifCouple;
    var tarifFemmeS = document.getElementById('soiree-tarif-femme'); if (tarifFemmeS) tarifFemmeS.textContent = s.tarifFemme;
    var ligneHommeS = document.getElementById('soiree-ligne-homme');
    var tarifHommeS = document.getElementById('soiree-tarif-homme');
    if (ligneHommeS && tarifHommeS) {
      if (s.hommeAdmis) {
        ligneHommeS.classList.remove('ligne--off'); ligneHommeS.classList.add('ligne--sur');
        tarifHommeS.className = 'ligne__prix'; tarifHommeS.textContent = s.tarifHomme || '';
      } else {
        ligneHommeS.classList.remove('ligne--sur'); ligneHommeS.classList.add('ligne--off');
        tarifHommeS.className = 'ligne__note'; tarifHommeS.textContent = 'Non admis ce soir';
      }
    }
    var etiqS = document.getElementById('soiree-etiquettes');
    if (etiqS && s.etiquettes) {
      etiqS.innerHTML = '';
      for (var ei = 0; ei < s.etiquettes.length; ei++) {
        var etEl = document.createElement('span');
        etEl.className = ei === 0 ? 'etiquette etiquette--couple' : 'etiquette';
        etEl.textContent = s.etiquettes[ei];
        etiqS.appendChild(etEl);
      }
    }

    var cleEtat = 'soiree.' + cleSoiree + '.inscrit';
    var btnIns = document.getElementById('btn-inscription');
    var sousIns = document.getElementById('sous-inscription');
    var btnDes = document.getElementById('btn-desinscrire');
    if (btnIns) {
      var type = profil.type || null;
      var genre = profil.genre || null;
      var admis = (genre === 'homme' && type !== 'couple') ? !!s.hommeAdmis : true;
      var texteLibre, sousLibre;
      if (s.complet) { texteLibre = 'Complet'; sousLibre = 'Cette soirée affiche complet. Une place peut se libérer, revenez y jeter un œil.'; }
      else if (!admis) { texteLibre = 'Hommes seuls non admis ce soir'; sousLibre = 'Cette soirée est réservée aux couples et aux femmes seules.'; }
      else if (s.surSelection) { texteLibre = 'Je fais ma demande'; sousLibre = 'Sur sélection : votre demande est examinée avant confirmation.'; }
      else { texteLibre = 'Je m’inscris'; sousLibre = 'Inscription gratuite : le tarif se règle à l’entrée (couple ' + s.tarifCouple + ', femme seule ' + s.tarifFemme + ').'; }
      var rendre = function (inscrit) {
        if (inscrit) {
          btnIns.textContent = s.surSelection ? 'Demande envoyée ✓' : 'Inscrit ✓';
          btnIns.style.opacity = '.65';
          if (sousIns) sousIns.textContent = s.surSelection ? 'Votre demande a été transmise. Vous serez recontacté après sélection.' : 'Votre inscription est envoyée. L’adresse arrive après validation.';
          if (btnDes) btnDes.style.display = '';
        } else {
          btnIns.textContent = texteLibre;
          btnIns.style.opacity = '';
          if (sousIns) sousIns.textContent = sousLibre;
          if (btnDes) btnDes.style.display = 'none';
        }
      };
      if (s.complet || !admis) { btnIns.style.background = 'none'; btnIns.style.border = '1px solid #4A3230'; btnIns.style.color = '#C99089'; }
      rendre(!s.complet && admis && lireEtat(cleEtat, false));
      btnIns.addEventListener('click', function (ev) {
        ev.preventDefault();
        if (s.complet) { toast('Cette soirée affiche complet.'); return; }
        if (!admis) { toast('Cette soirée n’accepte pas les hommes seuls. D’autres soirées oui : regardez l’Apéro rencontre du 12.'); return; }
        if (lireEtat(cleEtat, false)) { toast('Vous êtes déjà inscrit. Le lien juste en dessous permet de vous désinscrire.'); return; }
        if (!profil.pseudo) { toast('Créez d’abord votre profil pour vous inscrire.'); return; }
        if (!profil.verifie) { toast('Il faut un profil vérifié pour s’inscrire (étape Vérification).'); return; }
        ecrireEtat(cleEtat, true);
        rendre(true);
        toast(s.surSelection ? 'Demande transmise ✓ Vous serez recontacté après sélection.' : 'Inscription envoyée ✓ Le club sait que vous comptez venir. L’adresse exacte arrive après validation.');
      });
      if (btnDes) btnDes.addEventListener('click', function (ev) {
        ev.preventDefault();
        ecrireEtat(cleEtat, false);
        rendre(false);
        toast('Vous êtes désinscrit. Le club est prévenu que vous ne viendrez plus.');
      });
    }
  }

  /* ---- messages : onglets réels ---- */
  if (page === '/messages') {
    var ongletConv = document.getElementById('onglet-conversations');
    var ongletDem = document.getElementById('onglet-demandes');
    var listeConv = document.getElementById('liste-conversations');
    var listeDem = document.getElementById('liste-demandes');
    var basculerOnglet = function (versDemandes) {
      if (!listeConv || !listeDem) return;
      listeConv.style.display = versDemandes ? 'none' : '';
      listeDem.style.display = versDemandes ? '' : 'none';
      ongletConv.classList.toggle('onglet--on', !versDemandes);
      ongletDem.classList.toggle('onglet--on', versDemandes);
    };
    if (ongletConv && ongletDem) {
      ongletConv.style.cursor = 'pointer';
      ongletDem.style.cursor = 'pointer';
      ongletConv.addEventListener('click', function () { basculerOnglet(false); });
      ongletDem.addEventListener('click', function () { basculerOnglet(true); });
    }
  }

  /* ---- conversation : fil + envoi ---- */
  if (page === '/conversation') {
    var qui = param('c') || 'camille';
    var dp = PROFILS[qui] || PROFILS.camille;
    var cNom = document.getElementById('conv-nom');
    if (cNom) cNom.textContent = dp.nom;
    var vigConv = document.querySelector('.vig--mini');
    if (vigConv && dp.teinte) vigConv.className = 'vig vig--mini ' + dp.teinte;
    var filC = document.getElementById('conv-fil');
    var amorceConv = filC ? filC.querySelector('div') : null; // premiere bulle du gabarit
    if (amorceConv && dp.amorce) amorceConv.textContent = dp.amorce;
    var stock = lireEtat('conv.' + qui, []);
    var ajouterBulle = function (texte, moi) {
      var b = document.createElement('div');
      b.style.cssText = 'max-width:78%;padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.45;' +
        (moi ? 'align-self:flex-end;background:#C08B77;color:#1A1214;border-bottom-right-radius:4px;'
             : 'align-self:flex-start;background:#221B1D;color:#EFE9EA;border-bottom-left-radius:4px;');
      b.textContent = texte;
      filC.appendChild(b);
    };
    for (var si = 0; si < stock.length; si++) ajouterBulle(stock[si], true);
    var champC = document.getElementById('conv-champ');
    var envC = document.getElementById('conv-envoyer');
    var envoyerC = function () {
      if (!champC || !champC.value.trim()) return;
      ajouterBulle(champC.value.trim(), true);
      stock.push(champC.value.trim());
      ecrireEtat('conv.' + qui, stock);
      champC.value = '';
      filC.scrollTop = filC.scrollHeight;
    };
    if (envC) envC.addEventListener('click', function (ev) { ev.preventDefault(); envoyerC(); });
    if (champC) champC.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); envoyerC(); } });
  }

  /* ---- creation du compte club : dossier controle par la moderation ---- */
  if (page === '/pro/creer') {
    var statut = lireEtat('pro.statut', null);
    if (statut === 'valide') { location.replace('/pro'); return; }
    var certif = false;
    var caseC = document.getElementById('certif-responsable');
    var ligneC = document.getElementById('ligne-certif');
    if (ligneC && caseC) ligneC.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-action]')) return;
      certif = !certif;
      caseC.classList.toggle('cocher--off', !certif);
    });
    var basculerAttente = function () {
      document.getElementById('ecran-formulaire').style.display = 'none';
      document.getElementById('ecran-attente').style.display = 'flex';
      setTimeout(function () {
        ecrireEtat('pro.statut', 'valide');
        var be = document.getElementById('btn-entrer');
        if (be) be.style.display = '';
        toast('Etablissement verifie ✓ — votre espace est ouvert.');
      }, 6000);
    };
    if (statut === 'attente') { basculerAttente(); }
    var btnD = document.getElementById('btn-dossier');
    if (btnD) btnD.addEventListener('click', function (ev) {
      ev.preventDefault();
      var nom = (document.getElementById('etab-nom').value || '').trim();
      var siret = (document.getElementById('etab-siret').value || '').replace(/\D/g, '');
      var adresse = (document.getElementById('etab-adresse').value || '').trim();
      if (!nom) { toast('Indiquez le nom de votre etablissement.'); return; }
      if (siret.length !== 14) { toast('Le numero SIRET compte 14 chiffres — il permet de verifier que l’etablissement existe.'); return; }
      if (!adresse) { toast('Indiquez l’adresse de l’etablissement.'); return; }
      if (!certif) { toast('Cochez la certification : vous devez etre le responsable legal.'); return; }
      ecrireEtat('pro.statut', 'attente');
      ecrireEtat('pro.dossier', { nom: nom, siret: siret, adresse: adresse, quand: Date.now() });
      basculerAttente();
    });
  }

  /* ---- garde d acces : pas d espace club sans dossier valide ---- */
  if (page === '/pro' || page === '/pro/nouvelle-soiree') {
    if (lireEtat('pro.statut', null) !== 'valide') { location.replace('/pro/creer'); return; }
    var dossier = lireEtat('pro.dossier', null);
    if (dossier && dossier.nom) {
      var titreClub = document.getElementById('pro-nom-club');
      if (titreClub) titreClub.childNodes[0].nodeValue = dossier.nom + ' ';
    }
  }

  /* ---- espace pro : publier ajoute la soirée ---- */
  if (page === '/pro/nouvelle-soiree') {
    var btnPub = document.getElementById('btn-publier');
    if (btnPub) btnPub.addEventListener('click', function (ev) {
      ev.preventDefault();
      var nomS = (document.getElementById('soiree-nom') || {}).value || 'Nouvelle soirée';
      ecrireEtat('pro.publiee', { nom: nomS, quand: Date.now() });
      location.href = '/pro?publie=1';
    });
    var btnBrouillon = document.getElementById('btn-brouillon');
    if (btnBrouillon) btnBrouillon.addEventListener('click', function () {
      toast('Brouillon gardé.');
    });
  }
  if (page === '/pro') {
    var pub = lireEtat('pro.publiee', null);
    if (pub) {
      var listeS = document.getElementById('liste-soirees-pro');
      if (listeS && !document.getElementById('soiree-publiee')) {
        var carte = document.createElement('div');
        carte.className = 'carte';
        carte.id = 'soiree-publiee';
        carte.style.cssText = 'align-items:center;padding:13px 14px;';
        carte.innerHTML = '<span class="date" style="width:42px;"><u class="on">Sam</u><b style="font-size:26px;">04</b></span>' +
          '<div class="carte__corps" style="gap:5px;"><b style="font-size:14.5px;"></b>' +
          '<span style="font-size:11.5px;color:#9A9093;">0 inscrit — publiée à l’instant</span></div>' +
          '<span class="badge badge--en-ligne">EN LIGNE</span>';
        carte.querySelector('.carte__corps b').textContent = pub.nom;
        listeS.insertBefore(carte, listeS.children[1]);
      }
      if (param('publie')) toast('Soirée publiée ✓ — elle apparaît dans vos soirées.');
    }
  }

  /* ---- decouvrir : vrais membres inscrits, en plus des profils de demo ---- */
    if (page === '/decouvrir' && sb) {
          sb.auth.getSession().then(function (res) {
                  var session = res.data.session;
                  if (!session) return;
                  sb.from('profiles').select('*').neq('id', session.user.id).not('pseudo', 'is', null).order('created_at', { ascending: false }).then(function (r) {
                            var liste = (r.data || []);
                            if (!liste.length) return;
                            var corpsEl = document.querySelector('.corps');
                            if (!corpsEl) return;
                            var titreSection = document.createElement('div');
                            titreSection.className = 'legende';
                            titreSection.style.margin = '4px 0 -4px';
                            titreSection.textContent = 'Vrais membres';
                            corpsEl.insertBefore(titreSection, corpsEl.firstChild);
                            var curseur = titreSection;
                            liste.forEach(function (p, i) {
                                        var a = document.createElement('a');
                                        a.className = 'carte';
                                        a.href = '/profil?u=' + p.id;
                                        var teinte = 't' + ((i % 4) + 1);
                                        var bits = [];
                                        if (p.type === 'couple' && p.age_elle && p.age_lui) bits.push(p.age_elle + ' et ' + p.age_lui + ' ans');
                                        else if (p.age) bits.push(p.age + ' ans');
                                        if (p.ville) bits.push(p.ville);
                                        bits.push(p.type === 'couple' ? 'couple' : (p.genre === 'homme' ? 'homme seul' : 'femme seule'));
                                        a.innerHTML = '<div class="vig vig--liste ' + teinte + '"></div>' +
                                                      '<div class="carte__corps"><div class="carte__nom"><b></b></div><div class="carte__meta"></div></div>';
                                        a.querySelector('.carte__nom b').textContent = p.pseudo || 'Membre';
                                        a.querySelector('.carte__meta').textContent = bits.join(' · ');
                                        corpsEl.insertBefore(a, curseur.nextSibling);
                                        curseur = a;
                            });
                  });
          });
    }

    /* ---- profil reel (vrai membre inscrit, parametre ?u=) ---- */
    if (page === '/profil' && param('u') && sb) {
          var uReel = param('u');
          sb.from('profiles').select('*').eq('id', uReel).single().then(function (r) {
                  if (!r.data) return;
                  var p = r.data;
                  var nomAffiche = p.pseudo || 'Membre';
                  var titreP = document.getElementById('profil-nom');
                  if (titreP) {
                            titreP.childNodes[0].nodeValue = nomAffiche + ' ';
                            var svgVerif = titreP.querySelector('svg');
                            if (svgVerif) svgVerif.style.display = p.verifie ? '' : 'none';
                  }
                  document.title = nomAffiche + ' · Divin';
                  var metaP = document.getElementById('profil-meta');
                  if (metaP) {
                            var bits = [];
                            if (p.type === 'couple' && p.age_elle && p.age_lui) bits.push(p.age_elle + ' et ' + p.age_lui + ' ans');
                            else if (p.age) bits.push(p.age + ' ans');
                            if (p.ville) bits.push(p.ville);
                            bits.push(p.type === 'couple' ? 'couple' : (p.genre === 'homme' ? 'homme seul' : 'femme seule'));
                            metaP.textContent = bits.join(' · ');
                  }
                  var presP = document.getElementById('profil-presentation');
                  if (presP) presP.textContent = p.description || 'Ce membre n a pas encore ajoute de description.';
                  var bandoP = document.querySelector('.bandeau');
                  if (bandoP) bandoP.className = bandoP.className.replace(/t[1-4]/, 't' + ((uReel.charCodeAt(0) % 4) + 1));
                  var lienEcrireP = document.querySelector('a[href^="/conversation"]');
                  if (lienEcrireP) lienEcrireP.setAttribute('href', '/conversation?u=' + uReel);
                  var btnLikeP = document.getElementById('btn-like');
                  var coeurLikeP = document.getElementById('coeur-like');
                  var peindreLikeP = function (on) {
                            if (!coeurLikeP) return;
                            coeurLikeP.style.fill = on ? '#C08B77' : 'none';
                            coeurLikeP.style.stroke = on ? '#C08B77' : '#EFE9EA';
                  };
                  if (btnLikeP) {
                            peindreLikeP(lireEtat('like.' + uReel, false));
                            btnLikeP.addEventListener('click', function (ev) {
                                        ev.preventDefault();
                                        var on = !lireEtat('like.' + uReel, false);
                                        ecrireEtat('like.' + uReel, on);
                                        peindreLikeP(on);
                                        toast(on ? 'Vous aimez le profil de ' + nomAffiche : 'Like retire.');
                            });
                  }
                  var lienSigP = document.getElementById('lien-signaler');
                  var blocSigP = document.getElementById('bloc-signaler');
                  var motifSigP = document.getElementById('motif-signalement');
                  var btnSigP = document.getElementById('btn-signaler');
                  var sigFaitP = function () {
                            if (lienSigP) { lienSigP.textContent = 'Signalement envoye'; lienSigP.style.textDecoration = 'none'; lienSigP.style.opacity = '.7'; }
                            if (blocSigP) blocSigP.style.display = 'none';
                  };
                  if (lireEtat('signale.' + uReel, false)) sigFaitP();
                  if (lienSigP) lienSigP.addEventListener('click', function (ev) {
                            ev.preventDefault();
                            if (lireEtat('signale.' + uReel, false)) { toast('Ce profil est deja signale.'); return; }
                            if (blocSigP) {
                                        var ouvert = blocSigP.style.display !== 'none';
                                        blocSigP.style.display = ouvert ? 'none' : 'flex';
                                        if (!ouvert && motifSigP) motifSigP.focus();
                            }
                  });
                  if (btnSigP) btnSigP.addEventListener('click', function (ev) {
                            ev.preventDefault();
                            if (!motifSigP || !motifSigP.value.trim()) { toast('Expliquez la raison du signalement.'); if (motifSigP) motifSigP.focus(); return; }
                            ecrireEtat('signale.' + uReel, true);
                            sigFaitP();
                            toast('Signalement transmis.');
                  });
                  var physP = p.physique || {};
                  var colonnesP = document.querySelector('.phys');
                  var lignesDe = function (cote) {
                            var lignes = [];
                            if (cote.taille) lignes.push(['Taille', cote.taille]);
                            if (cote.poids) lignes.push(['Poids', cote.poids]);
                            if (cote.silhouette) lignes.push(['Silhouette', cote.silhouette]);
                            if (cote.details) { for (var k in cote.details) lignes.push([k, cote.details[k]]); }
                            return lignes;
                  };
                  var remplirColP = function (col, titreCol, cote) {
                            col.innerHTML = '<h4></h4>';
                            col.querySelector('h4').textContent = titreCol;
                            lignesDe(cote).forEach(function (paire) {
                                        var lg = document.createElement('div');
                                        lg.className = 'phys__l';
                                        lg.innerHTML = '<span></span><b></b>';
                                        lg.querySelector('span').textContent = paire[0];
                                        lg.querySelector('b').textContent = paire[1];
                                        col.appendChild(lg);
                            });
                  };
                  if (colonnesP && colonnesP.children[0]) {
                            if (p.type === 'couple') {
                                        remplirColP(colonnesP.children[0], 'Elle' + (p.age_elle ? ', ' + p.age_elle + ' ans' : ''), physP.elle || {});
                                        if (colonnesP.children[1]) remplirColP(colonnesP.children[1], 'Lui' + (p.age_lui ? ', ' + p.age_lui + ' ans' : ''), physP.lui || {});
                            } else {
                                        remplirColP(colonnesP.children[0], nomAffiche + (p.age ? ', ' + p.age + ' ans' : ''), physP.solo || {});
                                        if (colonnesP.children[1]) {
                                                      colonnesP.style.gridTemplateColumns = 'minmax(0,1fr)';
                                                      colonnesP.children[1].style.display = 'none';
                                                      colonnesP.children[0].style.borderRight = '0';
                                                      colonnesP.children[0].style.paddingRight = '0';
                                        }
                            }
                  }
          });
    }

    /* ---- conversation reelle (vrai membre, parametre ?u=) ---- */
    if (page === '/conversation' && param('u') && sb) {
          var uAutre = param('u');
          var cNomR = document.getElementById('conv-nom');
          var filR = document.getElementById('conv-fil');
          var champR = document.getElementById('conv-champ');
          var envR = document.getElementById('conv-envoyer');
          var moiIdR = null;
          var chargerMessagesReels = function () {
                  if (!filR || !moiIdR) return;
                  sb.from('messages').select('*')
                    .or('and(sender_id.eq.' + moiIdR + ',receiver_id.eq.' + uAutre + '),and(sender_id.eq.' + uAutre + ',receiver_id.eq.' + moiIdR + ')')
                    .order('created_at', { ascending: true })
                    .then(function (r) {
                                if (!r.data) return;
                                filR.innerHTML = '';
                                r.data.forEach(function (m) {
                                              var moi = m.sender_id === moiIdR;
                                              var b = document.createElement('div');
                                              b.style.cssText = 'max-width:78%;padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.45;' +
                                                              (moi ? 'align-self:flex-end;background:#C08B77;color:#1A1214;border-bottom-right-radius:4px;'
                                                                                  : 'align-self:flex-start;background:#221B1D;color:#EFE9EA;border-bottom-left-radius:4px;');
                                              b.textContent = m.contenu;
                                              filR.appendChild(b);
                                });
                                filR.scrollTop = filR.scrollHeight;
                    });
          };
          var envoyerReel = function () {
                  if (!champR || !champR.value.trim() || !moiIdR) return;
                  var texte = champR.value.trim();
                  champR.value = '';
                  sb.from('messages').insert({ sender_id: moiIdR, receiver_id: uAutre, contenu: texte }).then(function () { chargerMessagesReels(); });
          };
          sb.auth.getSession().then(function (res) {
                  var session = res.data.session;
                  if (!session) return;
                  moiIdR = session.user.id;
                  sb.from('profiles').select('pseudo').eq('id', uAutre).single().then(function (r) {
                            if (cNomR) cNomR.textContent = (r.data && r.data.pseudo) ? r.data.pseudo : 'Membre';
                  });
                  chargerMessagesReels();
                  setInterval(chargerMessagesReels, 4000);
          });
          if (envR) envR.addEventListener('click', function (ev) { ev.preventDefault(); envoyerReel(); });
          if (champR) champR.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); envoyerReel(); } });
    }

    /* ---- messages : conversations reelles en plus des demos ---- */
    if (page === '/messages' && sb) {
          sb.auth.getSession().then(function (res) {
                  var session = res.data.session;
                  if (!session) return;
                  var moiIdM = session.user.id;
                  sb.from('messages').select('*')
                    .or('sender_id.eq.' + moiIdM + ',receiver_id.eq.' + moiIdM)
                    .order('created_at', { ascending: false })
                    .then(function (r) {
                                var lignesMsg = r.data || [];
                                if (!lignesMsg.length) return;
                                var vus = {};
                                var partenaires = [];
                                lignesMsg.forEach(function (m) {
                                              var autre = m.sender_id === moiIdM ? m.receiver_id : m.sender_id;
                                              if (!vus[autre]) { vus[autre] = m; partenaires.push(autre); }
                                });
                                sb.from('profiles').select('id, pseudo').in('id', partenaires).then(function (rp) {
                                              var noms = {};
                                              (rp.data || []).forEach(function (p) { noms[p.id] = p.pseudo || 'Membre'; });
                                              var conteneurM = document.getElementById('liste-conversations');
                                              if (!conteneurM) return;
                                              partenaires.forEach(function (id, i) {
                                                              var m = vus[id];
                                                              var a = document.createElement('a');
                                                              a.className = 'conv';
                                                              a.href = '/conversation?u=' + id;
                                                              var teinte = 't' + ((i % 4) + 1);
                                                              var heure = new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                                              a.innerHTML = '<div class="vig vig--rond ' + teinte + '"></div>' +
                                                                                '<div class="conv__c"><div class="conv__h"><b></b><span></span></div><div class="conv__x"></div></div>';
                                                              a.querySelector('b').textContent = noms[id] || 'Membre';
                                                              a.querySelector('span').textContent = heure;
                                                              a.querySelector('.conv__x').textContent = m.contenu;
                                                              conteneurM.insertBefore(a, conteneurM.firstChild);
                                              });
                                });
                    });
          });
    }
  
});
