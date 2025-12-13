import React, { useState } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose, onSend, placeName }) => {
    const [message, setMessage] = useState('');
    const [preset, setPreset] = useState('');

    if (!isOpen) return null;

    const PRESETS = [
        "Description trop courte, merci d'ajouter des détails.",
        "Les photos sont floues ou trop sombres.",
        "L'adresse semble incorrecte.",
        "Ce lieu ne correspond pas à nos critères de sélection."
    ];

    const handlePresetClick = (text) => {
        setPreset(text);
        setMessage(text);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSend(message);
        setMessage('');
        setPreset('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <MessageSquare size={18} className="text-brand-orange" />
                        Message à l'auteur
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4">
                        Concerne le lieu : <span className="font-bold text-gray-800">{placeName}</span>
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {PRESETS.map((text, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handlePresetClick(text)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${preset === text ? 'bg-brand-orange text-white border-brand-orange' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-orange hover:text-brand-orange'}`}
                            >
                                {text.substring(0, 20)}...
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Écrivez votre message ici..."
                        className="w-full h-32 p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none resize-none text-sm"
                        autoFocus
                    ></textarea>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors text-sm"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!message.trim()}
                        className="px-6 py-2 rounded-lg bg-brand-dark text-white font-bold text-sm hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={16} /> Envoyer
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out; }
                .animate-scale-in { animation: scale-in 0.2s ease-out; }
            `}</style>
        </div>
    );
};

export default FeedbackModal;
