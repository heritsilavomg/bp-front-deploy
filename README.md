# 🚀 Next.js 15 Pro Boilerplate - Guide d'utilisation

## 📋 Table des matières
- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Structure du projet](#-structure-du-projet)
- [Utilisation](#-utilisation)
- [Composants](#-composants)
- [Configuration](#-configuration)
- [Scripts](#-scripts)
- [Dépannage](#-dépannage)

## 🎯 Présentation

Ce boilerplate Next.js 15 professionnel vous permet de démarrer rapidement vos projets avec une configuration complète incluant l'authentification, les animations, le dark mode et bien plus encore.

## ✨ Fonctionnalités

| Fonctionnalité | Description |
|---------------|-------------|
| ⚡ **Next.js 15** | Dernière version avec App Router et Turbopack |
| 🔒 **Authentification** | NextAuth.js v5 avec protection des routes |
| 🎨 **Animations** | GSAP pour des transitions fluides |
| 🌙 **Dark Mode** | Thème sombre/clair avec persistance |
| 🛠 **TypeScript** | Typage statique pour une meilleure qualité de code |
| 📱 **Responsive** | Design adaptatif avec TailwindCSS |
| 🏗 **Architecture** | Structure modulaire et scalable |
| ✅ **Validation** | Zod + React Hook Form pour les formulaires |
| 🗂 **State Management** | Redux Toolkit pour la gestion d'état |

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone https://github.com/heritsilavo/tsilavo-boilerplate.git
cd tsilavo-boilerplate
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
Le fichier `bp-front/.env` contient la configuration locale du frontend et est ignoré par Git. Son modèle est `bp-front/.env-example`. Le fichier `../.env` reste celui de Docker Compose.

4. **Configurer les variables d'environnement**
Renseignez `SPRING_BOOT_API`, `AUTH_SECRET` et `AUTH_URL` dans `bp-front/.env`. Next.js charge ce fichier automatiquement en développement. Pour Docker Compose, `AUTH_SECRET` et `FRONTEND_PUBLIC_URL` restent dans le fichier racine.

5. **Lancer le projet**
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\run-local.ps1
```

6. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

## 📁 Structure du projet

```
tsilavo-boilerplate/
├── src/
│   ├── app/                    # App Router (Pages)
│   │   ├── api/               # Routes API
│   │   ├── dashboard/         # Page dashboard (protégée)
│   │   ├── login/             # Page de connexion
│   │   ├── register/          # Page d'inscription
│   │   └── layout.tsx         # Layout principal
│   ├── components/            # Composants réutilisables
│   │   ├── animations/        # Composants animés GSAP
│   │   ├── auth/              # Composants d'authentification
│   │   ├── providers/         # Providers React
│   │   └── theme/             # Composants de thème
│   ├── features/              # Fonctionnalités (architecture feature-based)
│   │   └── user/              # Fonctionnalité utilisateur
│   ├── lib/                   # Utilitaires et configurations
│   │   ├── validations/       # Schémas de validation Zod
│   │   └── utils.ts           # Fonctions utilitaires
│   ├── store/                 # Configuration Redux
│   ├── auth.config.ts         # Configuration NextAuth
│   ├── auth.ts                # Instance NextAuth
│   └── middleware.ts          # Middleware de protection
├── public/                    # Fichiers statiques
└── ...
```

## 🎮 Utilisation

### Comptes de test
Pour tester l'authentification, utilisez ces identifiants :

- **Username**: `tsilavo`
- **Password**: `123456`

### Navigation
1. **Page d'accueil** (`/`) - Présentation du projet
2. **Connexion** (`/login`) - Formulaire de connexion
3. **Inscription** (`/register`) - Formulaire d'inscription  
4. **Dashboard** (`/protected`) - Espace membre (protégé)

### Protection des routes
- Les routes `/protected`, `/profile`, `/settings` sont protégées
- Les utilisateurs non connectés sont redirigés vers `/login`
- Les utilisateurs connectés sont redirigés du login vers le dashboard

## 🎨 Composants

### Animations GSAP
```tsx
// FadeIn
<FadeIn delay={0.2} y={30}>
  <VotreContenu />
</FadeIn>

// SlideIn
<SlideIn direction="left" delay={0.3}>
  <VotreContenu />
</SlideIn>

// ScaleIn  
<ScaleIn delay={0.4} scale={0.8}>
  <VotreContenu />
</ScaleIn>

// StaggerChildren
<StaggerChildren stagger={0.1}>
  <Element1 />
  <Element2 />
  <Element3 />
</StaggerChildren>
```

### Thème Dark/Light
```tsx
// Toggle du thème
<ThemeToggle />

// Utilisation dans les composants
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Votre contenu
</div>
```

### Formulaire avec validation
```tsx
const {
  register,
  handleSubmit,
  formState: { errors }
} = useForm<LoginInput>({
  resolver: zodResolver(loginSchema)
});
```

## ⚙️ Configuration

### TailwindCSS
Le fichier `tailwind.config.ts` est configuré avec :
- Mode sombre basé sur les classes
- Design tokens CSS personnalisés
- Couleurs sémantiques

### NextAuth.js v5
- Authentification par credentials
- Sessions JWT
- Callbacks personnalisés
- Pages d'authentification customisées

### Redux Toolkit
- Store configuré avec TypeScript
- Hooks typés (`useAppDispatch`, `useAppSelector`)
- Slice utilisateur avec authentification

## 📜 Scripts disponibles

```bash
# Développement avec Turbopack
npm run dev

# Build de production
npm run build

# Démarrage en production
npm start

# Linting
npm run lint

# Vérification TypeScript
npm run type-check
```

## 🔧 Dépannage

### Problèmes courants

**1. Erreur NextAuth Secret**
```bash
# Générer un nouveau secret
openssl rand -base64 32
```

**2. Erreur TypeScript**
```bash
# Vérifier les types
npm run type-check

# Régénérer les types Next.js
npm run build
```

**3. Animations GSAP non fonctionnelles**
- Vérifier que les composants sont bien en `"use client"`
- S'assurer que GSAP est bien installé

**4. Problème de style Tailwind**
- Vérifier l'ordre des imports dans `globals.css`
- S'assurer que les classes sont bien présentes

### Personnalisation

**Ajouter une nouvelle page protégée**
```tsx
// Dans middleware.ts
const isProtectedRoute = pathname.startsWith("/votre-nouvelle-route");

// Créer le dossier dans app/
src/app/votre-nouvelle-route/page.tsx
```

**Ajouter une nouvelle animation**
```tsx
// Créer un nouveau composant dans src/components/animations/
export default function VotreAnimation({ children, delay = 0 }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, 
        { /* état initial */ }, 
        { /* état final */ }
      );
    }
  }, [delay]);

  return <div ref={ref}>{children}</div>;
}
```

## 🚀 Déploiement

### Vercel (Recommandé)
1. Pousser le code sur GitHub
2. Connecter Vercel au repository
3. Configurer les variables d'environnement
4. Déployer

### Autres plateformes
```bash
# Build
npm run build

# Démarrage
npm start
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Le framework React
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [NextAuth.js](https://next-auth.js.org/) - Authentification
- [GSAP](https://gsap.com/) - Animations
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management

---

**💡 Astuce**: N'oubliez pas de personnaliser les couleurs, le contenu et les fonctionnalités selon les besoins de votre projet !

**🚀 Bon développement !**
