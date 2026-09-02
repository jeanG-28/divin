# Divin — ce qui a été construit, et pourquoi

Ce document retrace le projet depuis le début : les choix faits, les raisons
derrière, et ce qui reste ouvert. Il est là pour que rien ne se perde en
changeant d'ordinateur.

---

## Le produit

Une application de rencontres pour le milieu libertin, pensée d'abord pour
Chartres et sa région.

- **Nom** : Divin. Une note d'attention : aucune vérification n'a été faite pour
  savoir si ce nom est déjà déposé par quelqu'un d'autre. À faire avant d'en
  faire une vraie marque, auprès de l'INPI.
- **Baseline** affichée sur l'accueil : « Rencontres libertines entre adultes. »
- **Profils solo et couples.** Un couple a deux âges, deux descriptions
  physiques.
- **Photos floutées par défaut**, et masquables indépendamment des mensurations.
- **Soirées** : agenda, inscription gratuite, tarifs réglés à l'entrée du club.
- **Espace clubs séparé**, avec dossier d'ouverture et modération.

---

## Les décisions de conception, et pourquoi

Ces choix ont été discutés et validés au fil du travail. Ils peuvent être
défaits, mais autant savoir ce qu'ils protégeaient.

**La vérification bloque, et c'est elle la vraie sécurité.**
Tant qu'un profil n'est pas vérifié, il ne peut ni envoyer de message, ni lancer
de live, ni s'inscrire à une soirée. Un badge décoratif n'aurait rien empêché ;
un blocage réel, si. C'est ce qui tient les faux profils à distance.

**L'adresse des soirées reste cachée jusqu'à l'inscription validée.**
Pour que le lieu ne circule pas hors du cadre du club.

**Photos et mensurations se masquent séparément.**
Certaines personnes veulent montrer l'un sans l'autre.

**Les tarifs d'entrée dépendent du type de profil.**
Couple, femme seule, homme seul : chacun son prix, ou « non admis ». C'est
l'usage réel des clubs, l'application ne fait que le refléter.

**L'inscription à une soirée est gratuite et prévient le club.**
Le prix se règle sur place, à l'entrée. L'application n'encaisse rien.

**Les conversations sont conservées.**
Une première version annonçait un effacement au bout de trente jours. Retiré :
la promesse était inutile et fausse.

---

## Ce que le site sait faire aujourd'hui

Le parcours est complet, de bout en bout :

1. **Accueil** et présentation.
2. **Inscription** : solo ou couple, âges, description physique détaillée,
   orientation, description libre sans limite de longueur.
3. **Vérification** simulée : photo en direct avec un geste imposé au hasard.
4. **Découvrir** : profils filtrables par type (femmes seules, hommes seuls,
   couples) et par orientation, filtres combinables.
5. **Soirées** : liste, fiche détaillée, inscription et désinscription.
6. **Messagerie** : conversations, envoi, historique.
7. **Espace personnel** : profil, physique, disponibilités, notifications,
   paramètres, likes.
8. **Espace club** : dossier d'ouverture (nom, type, SIRET vérifié à 14 chiffres,
   adresse, justificatifs), modération simulée, création de soirées. Un club
   sans dossier validé ne peut pas y accéder.

---

## L'identité visuelle

- **Le logo** est le badge circulaire ange et diablesse, avec l'anneau violet et
  or. Il a été généré par Jean, puis détouré et recoloré (le fond blanc d'origine
  est devenu violet, l'or et les couleurs vives ont été préservés).
- Il sert partout : accueil, favicon, icône d'application.
- **Les couleurs** du site sont définies tout en haut de `styles.css`. La
  principale est le cuivre `#C08B77` sur un fond très sombre `#0E0C0D`.
- **Les polices** viennent de Google Fonts : Cormorant Garamond pour les titres,
  Manrope pour le reste.

Une note sur les droits, parce qu'elle compte : une image trouvée en ligne et
marquée d'un filigrane ne peut pas servir de logo, même provisoirement. C'est ce
qui a conduit à générer une image dont vous détenez les droits.

---

## Les contrôles à refaire après chaque modification

Quatre vérifications simples, qui évitent la plupart des ennuis :

1. Toutes les pages s'ouvrent sans erreur.
2. Sur un téléphone (largeur 390 pixels), rien ne dépasse sur les côtés.
3. Aucun lien ne mène à une page inexistante.
4. Les boutons font au moins 44 pixels de haut, sinon ils sont difficiles à
   toucher au doigt.

---

## Les questions encore ouvertes

Aucune n'empêche de continuer, mais chacune devra être tranchée un jour.

- **La vérification d'identité** : concrètement, par quel moyen ?
- **Le modèle économique** : gratuit, payant, ou mixte ?
- **Les clubs** : abonnement, ou commission sur les soirées ?
- **Les lives vidéo** : c'est le poste le plus lourd du projet. Diffuser de la
  vidéo coûte cher, et la modérer en direct encore plus. À chiffrer avant de
  s'engager.

---

## Où en est le projet techniquement

- Site entièrement statique : des pages HTML, une feuille de style, un fichier de
  comportement. Aucun serveur, aucune base de données.
- Tout ce qu'un visiteur saisit reste dans son navigateur.
- Le site est en ligne et navigable, mais volontairement invisible des moteurs
  de recherche.

Pour reprendre le projet sur vos comptes, suivez le tutoriel :
**https://divin-app.vercel.app/reprendre**
