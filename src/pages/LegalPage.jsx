import React from 'react';

const LegalPage = () => {
    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentions Légales</h1>

            <div className="prose prose-orange max-w-none text-gray-600 space-y-8">
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">1. Éditeur du site</h2>
                    <p>
                        Le site <strong>FlavorQuest</strong> est édité par :<br />
                        <strong>FlavorQuest SRL</strong><br />
                        Siège social : Rue de Fer 1, 5000 Namur, Belgique<br />
                        TVA : BE 0123.456.789<br />
                        Email : <a href="mailto:contact@flavorquest.be" className="text-brand-orange hover:underline">contact@flavorquest.be</a>
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">2. Hébergement</h2>
                    <p>
                        Le site est hébergé par :<br />
                        <strong>Netlify, Inc.</strong><br />
                        44 Montgomery Street, Suite 300<br />
                        San Francisco, California 94104, USA
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">3. Propriété Intellectuelle</h2>
                    <p>
                        L'ensemble de ce site relève de la législation belge et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">4. Responsabilité</h2>
                    <p>
                        FlavorQuest s'efforce d'assurer au mieux de ses possibilités, l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, FlavorQuest décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur le site.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default LegalPage;
