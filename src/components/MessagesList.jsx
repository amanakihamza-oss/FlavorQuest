import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { Mail, Trash2, Check, Eye, Clock } from 'lucide-react';

const MessagesList = ({ searchTerm = '' }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'messages'), orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(fetchedMessages);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await updateDoc(doc(db, 'messages', id), {
                read: true,
                status: 'read'
            });
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce message ?')) {
            try {
                await deleteDoc(doc(db, 'messages', id));
            } catch (error) {
                console.error('Error deleting message:', error);
            }
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSubjectLabel = (subject) => {
        const subjects = {
            'suggestion': 'Suggestion de pépite',
            'partnership': 'Partenariat',
            'support': 'Support technique',
            'other': 'Autre'
        };
        return subjects[subject] || subject || 'Non spécifié';
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-400">Chargement...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center">
                            <Mail size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-blue-600 font-bold">Total</p>
                            <p className="text-2xl font-bold text-blue-900">{messages.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 text-white rounded-lg flex items-center justify-center">
                            <Check size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-green-600 font-bold">Lus</p>
                            <p className="text-2xl font-bold text-green-900">{messages.filter(m => m.read).length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 text-white rounded-lg flex items-center justify-center">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-orange-600 font-bold">Non lus</p>
                            <p className="text-2xl font-bold text-orange-900">{messages.filter(m => !m.read).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages List */}
            {filteredMessages.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Mail size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-400 font-medium">Aucun message trouvé</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredMessages.map((message) => (
                        <div
                            key={message.id}
                            className={`bg-white border rounded-2xl p-6 transition-all hover:shadow-md ${!message.read ? 'border-brand-orange bg-orange-50/30' : 'border-gray-200'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        {!message.read && (
                                            <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse"></span>
                                        )}
                                        <h3 className="font-bold text-gray-900">{message.name}</h3>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                                            {getSubjectLabel(message.subject)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                        <a href={`mailto:${message.email}`} className="hover:text-brand-orange transition-colors">
                                            {message.email}
                                        </a>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {new Date(message.date).toLocaleString('fr-FR', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{message.message}</p>

                                    <div className="flex items-center gap-2">
                                        {!message.read && (
                                            <button
                                                onClick={() => handleMarkAsRead(message.id)}
                                                className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center gap-1.5"
                                            >
                                                <Check size={14} /> Marquer comme lu
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(message.id)}
                                            className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-1.5"
                                        >
                                            <Trash2 size={14} /> Supprimer
                                        </button>
                                        <a
                                            href={`mailto:${message.email}?subject=Re: ${getSubjectLabel(message.subject)}`}
                                            className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                                        >
                                            <Mail size={14} /> Répondre
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MessagesList;
