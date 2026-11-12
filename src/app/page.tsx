import Link from "next/link";
import {
  BadgeCheck,
  Table2,
  BarChart3,
  Bot,
  ListTree,
} from "lucide-react";
import { auth, signOut } from "@/auth";
import FadeIn from "@/components/animations/FadeIn";
import SlideIn from "@/components/animations/SlideIn";
import ScaleIn from "@/components/animations/ScaleIn";
import { Suspense } from "react";
import LogoutButton from "@/components/auth/LogoutButton";

const NOMAC_REFERENCE_URL = "https://www.instat.mg/documents/upload/main/INSTAT_Nomac_27_11_2013.pdf";

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "Comment démarrer", href: "#commencer" },
];

const FEATURES = [
  {
    icon: ListTree,
    title: "Classification NOMAC 2012",
    description:
      "Identifiez votre activité dans la nomenclature officielle malgache, par recherche directe ou étape par étape, de la section jusqu'à la catégorie.",
  },
  {
    icon: Table2,
    title: "Prévisionnel sur 3 ans",
    description:
      "À partir de vos offres, prix, volumes, charges, investissements et financements, obtenez automatiquement votre compte de résultat : chiffre d'affaires, marge brute, EBE, résultat net, CAF et BFR.",
  },
  {
    icon: BarChart3,
    title: "Score de viabilité",
    description:
      "Une note sur 100 répartie sur cinq dimensions : viabilité financière, structure de financement, rentabilité, préparation commerciale et préparation aux risques, avec des pistes d'amélioration.",
  },
  {
    icon: Bot,
    title: "Assistant IA Contextuel",
    description:
      "Posez vos questions sur votre business plan. L'assistant s'appuie sur vos données et vos résultats, et peut proposer des modifications que vous validez avant leur application.",
  },
];

export default async function HomePage() {
  const session = await auth();

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <div className="min-h-screen bg-[#080b15] text-slate-100">
        {/* Nav */}
        <nav className="fixed top-0 w-full bg-[#080b15]/80 backdrop-blur-xl border-b border-white/5 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-violet-300">BizPlan AI</h1>

              <div className="hidden md:flex items-center gap-8">
                {NAV_LINKS.map((link, i) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`text-sm transition-colors ${i === 0
                      ? "text-slate-100 border-b-2 border-violet-400 pb-1"
                      : "text-slate-400 hover:text-slate-100"
                      }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                {session ? (
                  <>
                    {(session.user.roles || []).includes("ROLE_ADMIN") && (
                      <Link
                        href="/admin/users"
                        className="hidden items-center gap-1.5 text-sm text-slate-300 hover:text-white sm:inline-flex"
                      >
                        Administration
                      </Link>
                    )}
                    <LogoutButton />
                    <Link
                      href="/protected/profile"
                      className="px-3 sm:px-5 py-1.5 sm:py-2 bg-violet-200 text-[#241b3d] rounded-lg text-xs sm:text-sm font-semibold hover:bg-violet-100 transition-colors"
                    >
                      Mon profil
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="hidden sm:inline text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/register"
                      className="px-3 sm:px-5 py-1.5 sm:py-2 bg-violet-200 text-[#241b3d] rounded-lg text-xs sm:text-sm font-semibold hover:bg-violet-100 transition-colors"
                    >
                      Créer un compte
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="pt-28 sm:pt-32 md:pt-40 pb-16 sm:pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Hero */}
            <FadeIn>
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-[#161227] border border-violet-500/30 text-violet-300 text-[10px] sm:text-xs uppercase tracking-widest rounded-full px-3 sm:px-4 py-1.5 mb-6 sm:mb-8 text-center">
                  <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
                  Conçue pour les entrepreneurs malgaches
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
                  Construisez votre
                  <br />
                  <span className="text-violet-200">
                    business plan pas à pas.
                  </span>
                </h1>

                <p className="text-base sm:text-xl text-slate-400 mb-8 max-w-2xl mx-auto px-2">
                  Décrivez votre projet, renseignez vos prévisions et obtenez
                  automatiquement vos résultats financiers sur trois ans, un score
                  de viabilité et l&apos;aide d&apos;un assistant IA, jusqu&apos;à
                  l&apos;export PDF de votre dossier.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                  <ScaleIn delay={0.3}>
                    <Link
                      href={session ? "/protected" : "/register"}
                      className="block sm:inline-block px-6 sm:px-8 py-3.5 sm:py-4 bg-violet-200 text-[#241b3d] rounded-xl font-semibold hover:bg-violet-100 transition-all transform hover:scale-105 text-sm sm:text-base"
                    >
                      {session ? "Accéder à mon espace" : "Créer un compte"}
                    </Link>
                  </ScaleIn>
                  <ScaleIn delay={0.4}>
                    <a
                      href="#features"
                      className="block sm:inline-block px-6 sm:px-8 py-3.5 sm:py-4 bg-transparent text-white rounded-xl font-semibold border border-white/15 hover:bg-white/5 transition-all transform hover:scale-105 text-sm sm:text-base"
                    >
                      Découvrir les fonctionnalités
                    </a>
                  </ScaleIn>
                </div>

                <div className="flex flex-col items-center mt-12">
                  <div className="flex -space-x-3 mb-3">
                    {[
                      "from-violet-400 to-fuchsia-400",
                      "from-blue-400 to-violet-400",
                      "from-fuchsia-400 to-pink-400",
                    ].map((gradient, i) => (
                      <div
                        key={i}
                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} border-2 border-[#080b15]`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 tracking-wide">
                    Montants en Ariary · Enregistrement automatique · Export PDF
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Section intro */}
            <FadeIn delay={0.1}>
              <div id="features" className="text-center mt-16 sm:mt-20 mb-12 sm:mb-16 px-2">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-violet-200 mb-4 sm:mb-6">
                  Tout votre business plan au même endroit
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
                  Du choix de votre activité jusqu&apos;au document final, chaque
                  étape s&apos;appuie sur les informations que vous saisissez.
                </p>
              </div>
            </FadeIn>

            {/* Feature cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <SlideIn
                    key={feature.title}
                    direction={i % 2 === 0 ? "left" : "right"}
                    delay={0.15 * i}
                  >
                    <div className="h-full bg-[#0d1120] border border-white/10 border-t-2 border-t-violet-400/60 rounded-2xl p-6 sm:p-8">
                      <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-300 flex items-center justify-center mb-5">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </SlideIn>
                );
              })}
            </div>

            {/* CTA */}
            <FadeIn delay={0.6}>
              <div id="commencer" className="mt-16 sm:mt-24 bg-gradient-to-br from-violet-400 to-purple-400 rounded-2xl p-8 sm:p-12 md:p-16 text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1030] mb-4">
                  Prêt à lancer votre projet ?
                </h2>
                <p className="text-[#3d2d5c] text-base sm:text-lg mb-8 max-w-xl mx-auto">
                  Choisissez votre activité, indiquez où en est votre projet, puis
                  complétez votre business plan à votre rythme : vos modifications
                  sont enregistrées automatiquement.
                </p>
                <Link
                  href={session ? "/protected" : "/register"}
                  className="inline-block px-6 sm:px-8 py-3.5 sm:py-4 bg-[#150f24] text-violet-200 rounded-xl font-semibold hover:bg-[#1e1633] transition-all transform hover:scale-105 text-sm sm:text-base"
                >
                  {session ? "Accéder à mon espace" : "Créer un compte"}
                </Link>
              </div>
            </FadeIn>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#080b15] border-t border-white/10 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
              <div>
                <h3 className="text-lg font-bold text-violet-300 mb-3">
                  BizPlan AI
                </h3>
                <p className="text-sm text-slate-400 max-w-xs">
                  La création et l&apos;analyse de business plans pour
                  l&apos;entrepreneuriat à Madagascar.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-4">
                  Produit
                </h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li>
                    <a href="#features" className="hover:text-white transition-colors">
                      Fonctionnalités
                    </a>
                  </li>
                  <li>
                    <a href="#commencer" className="hover:text-white transition-colors">
                      Comment démarrer
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-4">
                  Ressources
                </h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li>
                    <a href={NOMAC_REFERENCE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                      Référentiel NOMAC 2012
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Compte</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  {session ? (
                    <>
                      <li>
                        <Link href="/protected" className="hover:text-white transition-colors">
                          Mon espace
                        </Link>
                      </li>
                      <li>
                        <Link href="/protected/profile" className="hover:text-white transition-colors">
                          Mon profil
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link href="/login" className="hover:text-white transition-colors">
                          Connexion
                        </Link>
                      </li>
                      <li>
                        <Link href="/register" className="hover:text-white transition-colors">
                          Créer un compte
                        </Link>
                      </li>
                      <li>
                        <Link href="/forgot-password" className="hover:text-white transition-colors">
                          Mot de passe oublié
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 text-xs text-slate-500 text-center md:text-right">
              © 2026 BizPlan AI. Tous droits réservés.
            </div>
          </div>
        </footer>
      </div>
    </Suspense>
  );
}
