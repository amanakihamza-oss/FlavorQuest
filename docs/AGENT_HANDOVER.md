# 📁 Dossier de Transmission (Handover) - FlavorQuest

*Dernière mise à jour : 31 Décembre 2025*

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
- `scripts/generate-sitemap.js` : **CRITIQUE**. S'exécute au build (`npm run build`). Scanne Firebase et génère `sitemap.xml` statique.
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

3.  **Layout & Responsive**
    *   **Pages Villes** : Optimisées pour mobile (`px-4`, `text-3xl`) et Desktop (`px-6`, `text-5xl`).
    *   Le "saut" de header est minimisé grâce à une structure fixe.

3.  **Pipeline de Build**
    *   La commande `npm run build` enchaîne : `vite build` -> `generate-sitemap.js` -> `prerender.js`.
    *   Cela garantit qu'un déploiement a toujours un sitemap à jour.

---

## ⚠️ 3. Historique des Problèmes & Solutions

| Composant | Problème Rencontré | Solution / État Actuel |
| :--- | :--- | :--- |
| **Prerender** | Timeout sur Vercel (Puppeteer trop lent sur les machines gratuites). | Le script a un `try/catch` global. S'il échoue, il ne casse pas le build, on fallback sur le SPA classique. |
| **Search.jsx** | `ReferenceError: searchTerm` et boucles infinies. | Composant réécrit pour séparer l'état local du `query param` URL. |
| **Sitemap** | URLs dupliquées ou accents mal gérés. | Création de la fonction utilitaire `slugifyCity` alignée entre `generate-sitemap.js` et `slugs.js`. |

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
