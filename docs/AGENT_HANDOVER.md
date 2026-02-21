# 📁 Dossier de Transmission (Handover) - FlavorQuest

*Dernière mise à jour : 26 Janvier 2026*

Ce document sert de référence pour tout agent (humain ou IA) prenant le relais sur le projet. Il concentre le contexte technique, l'état d'avancement et les points de vigilance.

---

## 🏗️ 1. Architecture & Fonctionnement

**Stack Technique :**
- **Frontend** : React 18, Vite, TailwindCSS (Pas de TypeScript pour l'instant).
- **Backend / Data** : Firebase (Firestore, Auth, Storage).
- **Hosting** : Vercel (SPA avec Rewrite rules).
- **SEO Strategy** : Hybrid (Client-Side Rendering + Prerender script + Sitemap Generation au build).

**Dossiers Clés :**
- `src/pages/CityPage.jsx` : Le template dynamique pour les pages de ville (Silos SEO). Utilise `src/data/cityDescriptions.js` pour le contenu riche.
- `src/pages/Search.jsx` : Moteur de recherche central avec autocomplétion et filtres.
- `scripts/generate-sitemap.js` : **CRITIQUE**. S'exécute au build (`npm run build`). Scanne Firebase et génère `sitemap.xml` statique ainsi que `articles.json`/`places.json`.
- `scripts/inject-seo.js` : **CRITIQUE**. S'exécute juste après le sitemap. Injecte les balises SEO exactes (Titre, Description) dans de vrais fichiers `index.html` pour chaque article, pour un référencement immédiat sans Javascript.
- `scripts/prerender.js` : Tente de pré-rendre le HTML pour les bots. (Peut être capricieux sur Vercel).

---

## ✅ 2. Ce qui fonctionne (État Stable)

1.  **Architecture SEO "Villes"**
    *   Les URLs comme `/liege`, `/namur`, `/rocourt` sont captées par `CityPage.jsx`.
    *   Le système normalise les noms (ex: "Liège" -> "liege").
    *   Les métadonnées (Title, Description) sont injectées dynamiquement.
    *   **Nouveau** : `src/data/cityDescriptions.js` centralise les contenus riches (Textes Hero, Meta) pour les grandes villes.
    *   **FAQ Dynamique** : Chaque ville importante dispose de questions/réponses dédiées (Schema.org FAQPage) injectées via `FAQSection.jsx`.
    *   **Filtres Contextuels** : La page ville intègre désormais la `FilterBar` (comme l'accueil) pour filtrer les lieux localement (ex: "Italien" à Liège).

2.  **Expérience de Recherche**
    *   **Recherche Robuste** : Gestion des accents (ex: "liege" trouve "Liège") grâce à `normalizeText`.
    *   La barre de recherche détecte l'intention.
    *   **Dropdown "Toutes les villes"** : Redirige désormais directement vers la page ville (`/ville`) au clic ou via Entrée.
    *   Si l'utilisateur tape une ville, on propose "Explorer [Ville]" qui redirige vers la page SEO dédiée.
    *   Si c'est un mot clé, on filte la liste globale.
    *   **Home Search Bar** : La saisie dans "Où ?" détecte aussi les accents et redirige vers `/ville` si aucun mot-clé n'est saisi.
4.  **Blog (Le Mag)**
    *   **Wizard de Création** : Processus en 2 étapes pour les rédacteurs (Contenu -> Métadonnées).
    *   **Optimisation Images** : Compression WebP automatique côté client pour toutes les images (Cover et Editor).
    *   **Validation** : Vérification des champs requis et feedback temps réel.

3.  **Layout & Responsive**
    *   **Pages Villes** : Optimisées pour mobile (`px-4`, `text-3xl`) et Desktop (`px-6`, `text-5xl`).
    *   Le "saut" de header est minimisé grâce à une structure fixe.

3.  **Pipeline de Build**
    *   La commande `npm run build` enchaîne : `vite build` -> `generate-sitemap.js` -> `inject-seo.js` -> `prerender.js`.
    *   Cela garantit qu'un déploiement a toujours un sitemap à jour.

---

## ⚠️ 3. Historique des Problèmes & Solutions

| Composant | Problème Rencontré | Solution / État Actuel |
| :--- | :--- | :--- |
| **Prerender** | Timeout sur Vercel (Puppeteer trop lent sur les machines gratuites). | Le script a un `try/catch` global. S'il échoue, il ne casse pas le build, on fallback sur le SPA classique. |
| **Search.jsx** | `ReferenceError: searchTerm` et boucles infinies. | Composant réécrit pour séparer l'état local du `query param` URL. |
| **Sitemap** | URLs dupliquées ou accents mal gérés. | Création de la fonction utilitaire `slugifyCity` alignée entre `generate-sitemap.js` et `slugs.js`. |
| **Blog Wizard** | Style Toolbar manquant & Erreur 500 (TDZ). | Ajout manuel des styles CSS Quill + Correction ordre déclaration `quillRef`. |

---

## 🔭 4. Points de Vigilance pour le Futur Agent

Si vous devez travailler sur ce projet, vérifiez systématiquement ces points :

1.  **Modification des Routes** :
    *   Si vous ajoutez une nouvelle page (ex: `/regions`), vous **DEVEZ** mettre à jour `scripts/generate-sitemap.js` pour qu'elle apparaisse dans le XML.

2.  **Ajout de Contenu Ville** :
    *   Pour enrichir le texte d'une ville (ex: Charleroi), ne touchez pas au React. Allez dans `src/data/cityDescriptions.js` et ajoutez l'entrée.

3.  **Déploiement** :
    *   Toujours vérifier que le fichier `dist/sitemap.xml` est bien généré après un build local.

4.  **Performance Vercel** :
    *   Surveillez les logs de build. Si le "Prerender" prend > 10min, il faudra peut-être le désactiver temporairement dans `package.json`.

---

## 📝 5. Journal des Mises à Jour (Log)

*   **[31/12/2025] - Session SEO & Stabilisation**
    *   Création des landing pages ville automatiques.
    *   Mise en place de `cityDescriptions.js` pour le contenu éditorial.
    *   Correction sitemap automatique (Priorité 0.8 pour les villes).
    *   **Vérification Complète** : Audit architecture, routes, et `robots.txt` validés.
    *   **Accessibilité & UX** : Ajout des `aria-label` manquants et ajustement du spacing sur les pages villes (`pt-8`).
    *   **Prêt pour déploiement** : Le site est stable et optimisé pour le SEO local.

*   **[02/01/2026] - Session Performance & Blog**
    *   **Optimisation Vitesse** : Code splitting (`framer-motion` isolé), Preconnect polices, vérification Lazy Loading.
    *   **Le Mag 2.0** :
        *   Layout "A la Une" (Hero header pour le dernier article).
        *   Partage WhatsApp intégré.
        *   Pagination "Voir plus" (Load More) pour alléger le chargement.

*   **[08/01/2026] - Refonte Éditeur Blog (Wizard)**
    *   Remplacement du formulaire monolithique par un **Wizard en 2 étapes**.
    *   Intégration de `react-quill-new` avec styles customisés.
    *   **Performance** : Intégration de `browser-image-compression` pour toutes les uploads images.
    *   **Validation** : Build de production validé (0 erreurs).

*   **[09/01/2026] - Session Corrections Blog & UX**
    *   **Fix Césure de Mots** : Correction du problème de mots coupés en fin de ligne (ex: "Charl-eroi").
        *   **Cause** : Espaces insécables (`&nbsp;` / `\u00A0`) dans le contenu collé depuis Word ou autres éditeurs.
        *   **Solution** : Nettoyage automatique dans `renderContent()` de `BlogArticle.jsx` qui remplace tous les `&nbsp;` par des espaces normaux.
        *   **Impact** : Tous les articles (nouveaux et existants) sont désormais nettoyés automatiquement à l'affichage.
    
    *   **Amélioration Visibilité des Liens** :
        *   Ajout de styles Tailwind pour les liens dans les articles : couleur orange, soulignement, effet hover.
        *   Classes ajoutées : `prose-a:text-brand-orange prose-a:font-medium prose-a:underline prose-a:decoration-brand-orange/30`.
        *   Les liens sources sont désormais clairement identifiables et cliquables.
    
    *   **Fix Sidebar Sticky** : Correction de la sidebar "Lieux cités" qui ne suivait plus le scroll.
        *   **Cause** : L'élément `<aside>` avec `items-start` ne prenait que la hauteur de son contenu (1344px) au lieu de s'étendre sur toute la hauteur de l'article (2991px).
        *   **Solution** : Ajout de la classe `h-full` sur l'`<aside>` pour qu'il s'étende sur toute la hauteur.
        *   **Impact** : La sidebar reste sticky sur toute la durée de la lecture de l'article.
    
    *   **Fix Bouton J'aime** : Restauration de la fonctionnalité du bouton J'aime sur les articles.
        *   **Cause** : Champ `likes` manquant sur les nouveaux articles créés.
        *   **Solution** : 
            *   Ajout de `likes: 0` par défaut dans `SEED_ARTICLES` et `addArticle()` du `BlogContext.jsx`.
            *   Amélioration de `toggleArticleLike()` pour gérer les cas où le champ n'existe pas (avec `getDoc` et validation).
            *   Script de migration créé : `scripts/add-likes-to-articles.js`.
        *   **Impact** : Tous les nouveaux articles ont désormais le champ likes initialisé correctement.

*   **[12/01/2026] - Session SEO & Optimisation CTR**
    *   **Fix Redirections GSC** : Résolution des erreurs "Page avec redirection" dans Google Search Console.
        *   **Cause** : Incohérence entre `sitemap.xml` (généré avec `https://flavorquest.be`) et le site réel (redirige vers `https://www.flavorquest.be`).
        *   **Solution** : Mise à jour de `BASE_URL` dans `scripts/generate-sitemap.js` et de l'URL du sitemap dans `robots.txt` pour utiliser exclusivement la version `www`.
        *   **Impact** : Indexation propre sans chaînes de redirection.
    *   **Optimisation CTR (Taux de Clic)** :
        *   **Rich Snippets FAQ** : Ajout automatique de Schema.org `FAQPage` sur toutes les fiches restaurants (Généré dynamiquement depuis les horaires et l'adresse).
        *   **Rich Snippets Restaurant** : Affinement du schéma `Restaurant` (ajout `servesCuisine`, `priceRange`) pour l'affichage des prix (€€) et du type de cuisine.
        *   **Social Sharing** : Amélioration des balises OpenGraph (`og:image:width/height/alt`) pour garantir de beaux aperçus sur Facebook/WhatsApp.

*   **[26/01/2026] - Session Admin & UX Améliorations**
    *   **Featured Article Selection** : Ajout de la possibilité de choisir l'article "À la une" depuis l'admin.
        *   **Nouvelle fonctionnalité** : Bouton étoile ⭐ dans l'onglet Articles de l'admin.
        *   **Backend** : Méthode `setFeaturedArticle()` dans `BlogContext.jsx` qui garantit qu'un seul article est featured à la fois.
        *   **Frontend** : `BlogHome.jsx` affiche automatiquement l'article featured avec fallback sur le plus récent.
        *   **Impact** : Contrôle éditorial total sur le contenu "À la une" du blog.
    
    *   **Filtre "Ouvert maintenant" sur Pages Ville** :
        *   **Ajout** : Bouton "Ouvert maintenant" sur toutes les pages de villes (`CityPage.jsx`).
        *   **Logique** : Utilise la fonction `checkIsOpen()` pour filtrer en temps réel les restaurants ouverts.
        *   **UI** : Bouton avec style cohérent (vert quand actif), positionné au-dessus de la FilterBar.
    
    *   **Sélecteur de Ville dans Random Discovery** :
        *   **Amélioration** : Le bouton "Pas d'inspiration ?" (`MagicRandomizer.jsx`) propose maintenant un filtre ville optionnel.
        *   **Fonctionnement** : 
            *   Dropdown "Cibler une ville ?" avec option "Toute la Wallonie" par défaut.
            *   Si une ville est choisie, seuls les lieux de cette ville sont dans le tirage aléatoire.
            *   Bouton "Lancer la recherche" pour démarrer (pas d'auto-start).
        *   **UX** : Close button amélioré avec meilleure visibilité (fond blanc, ombre, bordure).
        *   **Responsive** : Padding optimisé (pt-16) pour éviter que le contenu ne cache le bouton X.
        
*   **[08/02/2026] - Session Mobile, Interactivité & Sécurité**
    *   **Fix Likes sur Mobile (Smart Sync)** :
        *   **Problème** : "Clignotement" du compteur de likes sur mobile (retour en arrière avant de remonter).
        *   **Solution** : Implémentation d'une logique "Smart Sync" dans `BlogArticle.jsx`. Le front ignore les réponses "stale" du serveur tant que la nouvelle valeur n'est pas confirmée.
        *   **UX** : Ajout de styles `touch-manipulation` et `active:scale-95` pour un feedback tactile immédiat.
    
    *   **Réparation Système de Commentaires** :
        *   **Problème** : Commentaires invisibles/non soumis à cause d'une incompatibilité de type (ID string vs number).
        *   **Solution** : Assouplissement des comparaisons dans `PlacesContext.jsx` et ajout de Toast de confirmation (Succès/Erreur).
    
    *   **Refonte Règles de Sécurité (Firestore)** :
        *   **Problème** : Les invités (non connectés) ne pouvaient ni liker ni commenter.
        *   **Solution** : Mise à jour des règles Firestore pour autoriser `create` sur `reviews` et `write` sur `articles` (likes) pour tout le monde (`if true`).
    
    *   **Gestion Avancée des Embeds (Instagram/YouTube)** :
        *   **Problème** : Le code d'intégration était supprimé par l'éditeur ou compté dans le temps de lecture.
        *   **Solution 1** : Ajout du mode "Code Source" dans l'éditeur.
        *   **Solution 2** : "Magic Unwrap" -> Détecte automatiquement les embeds collés dans des blocs de code `<pre>` et les convertit en HTML vivant.
        *   **Solution 3** : Le calcul du temps de lecture ignore désormais tout ce qui est balise `<script>`, `<style>` ou `<pre>`.

*   **[15/02/2026] - Session FAQ Blog & Déploiement**
    *   **FAQ pour Articles de Blog** :
        *   **Ajout** : Intégration d'un éditeur de FAQ dans `EditArticleModal.jsx`.
        *   **Front** : Affichage automatique via `FAQSection` en bas d'article (`BlogArticle.jsx`).
        *   **SEO** : Génération automatique du schéma `FAQPage`.
    *   **Stabilisation Déploiement** :
        *   **Fix Build** : Correction d'erreurs JSX (fermetures de balises) qui bloquaient le build Vercel.
        *   **Script** : Amélioration de `deploy.bat` pour afficher le `git status` et éviter la confusion "rien ne se passe".

*   **[21/02/2026] - Fix Global SEO (Meta Tags Vercel)**
    *   **Problème** : Les articles n'avaient pas de titre précis lors du partage sur les réseaux sociaux (Fallback sur le titre générique "Guide Gastronomique").
    *   **Cause** : Le pré-rendu `prerender.js` (Puppeteer) plante sur Vercel. Googlebot et les réseaux sociaux recevaient un `index.html` non complété par React.
    *   **Solution** : Création de `scripts/inject-seo.js` ajouté au pipeline de build (`postbuild`).
    *   **Fonctionnement** : Le script crée un vrai fichier `index.html` pour chaque article dans `dist/blog/[slug]` et y injecte "en dur" les balises `<title>`, `meta description`, et `og:image` provenant de l'éditeur Firebase (via `articles.json`).

---

## 🛡️ 6. Règles de Création de Contenu (Anti-Amnésie)

Pour éviter les régressions, tout agent doit respecter ces règles impératives :

1.  **Idempotence des Données (Doublons)** :
    *   **Ne jamais** se fier uniquement au LocalStorage pour vérifier si une donnée est déjà injectée.
    *   **TOUJOURS** vérifier l'existence dans Firestore avant d'écrire (`check-before-write`).
    *   Exemple : `where('slug', '==', newSlug)` sur la collection cible.

2.  **Catégories Blog** :
    *   **INTERDICTION** d'inventer des catégories.
    *   Se référer strictement au fichier `src/utils/blogData.js`.
    *   Règle spécifique : Utiliser **"Guide"** et JAMAIS "City Guide".

3.  **Données Réelles Uniquement** :
    *   **INTERDICTION** d'injecter des lieux fictifs ou des données de remplissage ("Lorem Ipsum", "Demo Restaurant").
    *   Si le client demande d'ajouter des lieux, demander les infos réelles ou ne rien faire.
    *   **Vérification Préalable** : Toujours vérifier `public/data/places.json` (ou la DB) pour éviter les doublons avant de créer un script d'ajout.
    *   Les avis (reviews) doivent être à 0 par défaut, sauf si historique réel fourni.
    *   **Tags Officiels** : Utiliser uniquement ces IDs pour peupler le tableau `tags` :
        *   `halal`, `vegetarian`, `gluten-free`, `late-night`, `kids`, `top-rated`
        *   `terrace`, `romantic`, `view`, `cheap`, `wifi`, `pets`, `delivery`

