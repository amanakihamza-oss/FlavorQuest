import React from 'react';

const PrivacyPage = () => {
    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Politique de Confidentialité</h1>

            <div className="prose prose-orange max-w-none text-gray-600 space-y-8">
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">1. Collecte des données</h2>
                    <p>
                        Chez FlavorQuest, la transparence est primordiale. Nous collectons uniquement les données strictement nécessaires au bon fonctionnement du service :
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li>Votre nom et adresse email (si vous créez un compte).</li>
                        <li>Vos lieux favoris (pour les retrouver dans votre espace).</li>
                        <li>Les avis que vous publiez volontairement.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">2. Cookies & Stockage Local</h2>
                    <p>
                        Nous n'utilisons pas de cookies tiers envahissants. Nous utilisons le "LocalStorage" de votre navigateur pour maintenir votre session active et sauvegarder vos préférences (comme votre langue ou vos favoris) sans avoir besoin de vous reconnecter à chaque fois.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">3. Vos Droits</h2>
                    <p>
                        Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez supprimer toutes vos données locales en vous déconnectant ou en nettoyant le cache de votre navigateur. Pour toute demande spécifique, contactez-nous à : <span className="font-bold text-brand-orange">privacy@flavorquest.be</span>.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">4. Hébergement</h2>
                    <p>
                        Ce site est hébergé de manière sécurisée. Aucune donnée personnelle n'est revendue à des tiers.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPage;
