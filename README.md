# Divin

Prototype web d'une application de rencontres pour adultes. Site statique :
chaque page est un fichier HTML, il n'y a **rien à compiler**.

Ce dossier contient tout le travail fait jusqu'ici. Il est prêt à être repris
sur un autre ordinateur et publié sur un autre compte.

---

## Ce qu'il y a dedans

| Fichier / dossier | À quoi ça sert |
|---|---|
| `index.html` | La page d'accueil |
| `inscription.html` | La création de profil |
| `decouvrir.html`, `soirees.html`, `club.html` | Les pages de découverte |
| `messages.html`, `conversation.html` | La messagerie |
| `moi.html`, `profil.html`, `parametres.html` | L'espace personnel |
| `pro/` | L'espace des clubs et organisateurs |
| `app.js` | Tout le comportement du site (un seul fichier) |
| `styles.css` | Toute la mise en forme (un seul fichier) |
| `photos/`, `badge.png`, `icone*.png` | Les images et le logo |
| `manifest.webmanifest` | Ce qui permet d'installer le site comme une application |

Le site ne se connecte à aucun serveur : tout ce qu'on saisit est gardé dans le
navigateur. C'est voulu, c'est un prototype pour montrer et essayer.

---

## Le voir sur son ordinateur

Ouvrir `index.html` dans le navigateur suffit pour regarder.

Pour que tout fonctionne exactement comme en ligne (certaines pages se parlent
entre elles), mieux vaut lancer un petit serveur local. Dans ce dossier :

```
python -m http.server 8000
```

puis ouvrir `http://localhost:8000` dans le navigateur.

---

## Le modifier

Il n'y a pas de programme à installer et rien à recompiler.

- Changer un texte ou une page : ouvrir le `.html` correspondant.
- Changer une couleur, une taille, un espacement : `styles.css`.
- Changer un comportement (un bouton, un enregistrement) : `app.js`.

On enregistre, on recharge la page, c'est fait.

---

## Le mettre en ligne sous son propre compte

1. Créer un compte sur **github.com**, puis un dépôt vide (par exemple `divin`).
2. Depuis ce dossier, envoyer le travail dessus :

```
git remote add origin https://github.com/VOTRE-COMPTE/divin.git
git branch -M main
git push -u origin main
```

3. Créer un compte sur **vercel.com** en choisissant « Continuer avec GitHub ».
4. Dans Vercel : **Add New → Project**, choisir le dépôt `divin`, laisser tous
   les réglages par défaut (aucun réglage de build : le site est statique),
   puis **Deploy**.

À partir de là, chaque fois que le travail est envoyé sur GitHub, le site en
ligne se met à jour tout seul.

---

## À savoir avant de publier pour de vrai

- Le site porte volontairement une balise `noindex` et un `robots.txt` qui
  demandent aux moteurs de recherche de l'ignorer. C'est normal pour un
  prototype ; à retirer le jour d'une vraie ouverture, et pas avant.
- Aucune vérification d'âge réelle n'est en place : l'écran de vérification est
  simulé. Un service ouvert au public en aurait besoin.
- Les profils et les messages ne sont enregistrés que dans le navigateur de la
  personne. Rien n'est partagé entre deux appareils.
