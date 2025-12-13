import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';

const ReviewForm = ({ onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) return;

        onSubmit({
            author: name || 'Anonyme',
            rating,
            text: comment
        });

        // Reset
        setRating(0);
        setComment('');
        setName('');
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">Laisser un avis</h3>

            <div className="mb-4">
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Votre note</label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-110"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(rating)}
                        >
                            <Star
                                size={24}
                                className={`${star <= (hover || rating) ? 'fill-brand-yellow text-brand-yellow' : 'text-gray-300'}`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Votre nom (optionnel)</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all"
                    placeholder="Jean Dupont"
                />
            </div>

            <div className="mb-4">
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Votre commentaire</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all resize-none"
                    placeholder="C'était délicieux..."
                    required
                ></textarea>
            </div>

            <button
                type="submit"
                disabled={rating === 0 || !comment.trim()}
                className="w-full py-3 bg-brand-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Send size={18} /> Publier mon avis
            </button>
        </form>
    );
};

export default ReviewForm;
