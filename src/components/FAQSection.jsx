import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
const FAQ_DATA = [
    {
        question: "Comment trouver les meilleurs restaurants à Namur ?",
        answer: "FlavorQuest sélectionne pour vous les meilleures adresses (restaurants, snacks, brunchs) sur base d'avis vérifiés et de visites mystères. Utilisez nos filtres (Terrasse, Vegan, Ouvert tard...) pour trouver la pépite parfaite en quelques clics."
    },
    {
        question: "Est-ce que FlavorQuest est gratuit ?",
        answer: "Oui, totalement ! L'utilisation du site, la recherche de lieux et la consultation des avis sont 100% gratuits pour les utilisateurs. Notre mission est de vous faire découvrir la gastronomie locale sans barrières."
    },
    {
        question: "Comment ajouter mon établissement sur le site ?",
        answer: "C'est très simple ! Cliquez sur le bouton 'Soumettre un lieu' dans le menu ou le pied de page. Remplissez le formulaire avec les infos de votre établissement. Notre équipe validera votre fiche sous 24 à 48h."
    },
    {
        question: "Les avis sont-ils fiables ?",
        answer: "Nous accordons une grande importance à l'authenticité. Nous modérons les avis et privilégions la qualité. De plus, nos recommandations 'Coups de Cœur' sont testées par notre équipe indépendante."
    }
];

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Generate JSON-LD Schema
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ_DATA.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <section className="py-16 bg-white relative overflow-hidden">
            {/* SEO Schema Injection */}
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            </Helmet>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-brand-orange/10 rounded-2xl mb-4 text-brand-orange">
                        <HelpCircle size={32} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">Questions Fréquentes</h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Tout ce que vous devez savoir pour profiter au mieux de l'expérience FlavorQuest.
                    </p>
                </div>

                <div className="space-y-4">
                    {FAQ_DATA.map((item, index) => (
                        <div
                            key={index}
                            className={`border rounded-2xl transition-all duration-300 ${openIndex === index ? 'border-brand-orange bg-orange-50/30' : 'border-gray-100 bg-white hover:border-gray-200'
                                }`}
                        >
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <span className={`font-bold text-lg ${openIndex === index ? 'text-brand-orange' : 'text-gray-800'}`}>
                                    {item.question}
                                </span>
                                <span className={`ml-4 p-1 rounded-full transition-colors ${openIndex === index ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                                </span>
                            </button>

                            <AnimatePresence initial={false}>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-dashed border-gray-200/50 pt-4 mt-2">
                                            {item.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12 text-gray-500">
                    <p>
                        Vous ne trouvez pas votre réponse ?{' '}
                        <NavLink to="/contact" className="text-brand-orange font-bold hover:underline">
                            Contactez-nous
                        </NavLink>
                    </p>
                </div>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" />
        </section>
    );
};

export default FAQSection;
