import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { usePlaces } from '../context/PlacesContext';

const CATEGORIES = [
    {
        id: 'Restaurant',
        label: 'Restaurant',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop',
    },
    {
        id: 'Brasserie',
        label: 'Brasserie',
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop',
    },
    {
        id: 'Snack',
        label: 'Fast Food',
        image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=2070&auto=format&fit=crop',
    },
    {
        id: 'Vegan',
        label: 'Healthy & Vegan',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1740&auto=format&fit=crop',
    },
    {
        id: 'CoffeeShop',
        label: 'Coffee Shop',
        image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071&auto=format&fit=crop',
    },
    {
        id: 'Bar',
        label: 'Bar & Nocturne',
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1974&auto=format&fit=crop',
    },
    {
        id: 'Boulangerie',
        label: 'Boulangerie & Pâtisserie',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072&auto=format&fit=crop',
    }
];

// 3D Parallax Tilt Card Component
const TiltCard = ({ count, label, image, onClick }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Spring physics configuration for snappy yet smooth hover recovery
    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

    // Rotate bounds: max 12 degrees tilt
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

    // Parallax translation for the image and text layers
    const imgX = useTransform(mouseXSpring, [-0.5, 0.5], ["-12px", "12px"]);
    const imgY = useTransform(mouseYSpring, [-0.5, 0.5], ["-12px", "12px"]);
    const textX = useTransform(mouseXSpring, [-0.5, 0.5], ["-6px", "6px"]);
    const textY = useTransform(mouseYSpring, [-0.5, 0.5], ["-6px", "6px"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;

        // Map client coordinates to -0.5 ... 0.5 range
        x.set((clientX / width) - 0.5);
        y.set((clientY / height) - 0.5);
    };

    const handleMouseLeave = () => {
        // Reset springs to center
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                perspective: "1000px"
            }}
            whileTap={{ scale: 0.96 }}
            className="relative w-64 h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg dark:shadow-black/60 hover:shadow-2xl hover:shadow-brand-orange/20 transition-shadow duration-500 transform-gpu will-change-transform bg-gray-900 border border-gray-100/10 dark:border-gray-800/40"
        >
            {/* Background Image with inverse parallax movement to increase 3D effect */}
            <motion.div
                style={{
                    x: imgX,
                    y: imgY,
                    scale: 1.15,
                    transformStyle: "preserve-3d",
                }}
                className="absolute inset-0 w-full h-full"
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
                <img
                    src={image}
                    alt={label}
                    className="w-full h-full object-cover"
                />
            </motion.div>

            {/* Content floating on top with forward parallax movement */}
            <motion.div
                style={{
                    x: textX,
                    y: textY,
                    transformStyle: "preserve-3d",
                }}
                className="absolute bottom-6 left-6 z-20 pointer-events-none"
            >
                <span 
                    className="block text-xs font-bold text-white uppercase tracking-wider mb-2 bg-brand-orange px-2.5 py-1 rounded-full w-fit shadow-sm border border-orange-500/20"
                >
                    {count} {count > 1 ? 'lieux' : 'lieu'}
                </span>
                <h3 
                    className="text-xl font-bold text-white tracking-wide drop-shadow-md"
                >
                    {label}
                </h3>
            </motion.div>
        </motion.div>
    );
};

const VisualCategories = ({ onSelect }) => {
    const { places } = usePlaces();
    const containerRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Calculate counts
    const categoryCounts = places.reduce((acc, place) => {
        if (place.validationStatus === 'approved') {
            acc[place.category] = (acc[place.category] || 0) + 1;
        }
        return acc;
    }, {});

    const activeCategories = CATEGORIES.filter(cat => (categoryCounts[cat.id] || 0) > 0);

    const handleScroll = () => {
        if (containerRef.current) {
            const container = containerRef.current;
            const totalScroll = container.scrollWidth - container.clientWidth;
            if (totalScroll > 0) {
                setScrollProgress(container.scrollLeft / totalScroll);
            }
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [activeCategories]);

    const scroll = (offset) => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

    // Stagger layout animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        show: { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            transition: { 
                type: "spring", 
                stiffness: 100, 
                damping: 15 
            } 
        }
    };

    return (
        <section className="py-8 overflow-hidden">
            <div className="flex items-center justify-between mb-6 px-6 max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Envie de quoi ?</h2>
                <button
                    onClick={() => onSelect(null)}
                    className="text-sm font-bold text-brand-orange hover:text-orange-700 dark:hover:text-orange-500 transition-colors flex items-center gap-1 group/btn"
                >
                    Tout voir <ArrowRight size={16} className="transform group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="relative max-w-7xl mx-auto group/carousel">
                {/* Desktop Scroll Buttons */}
                <motion.button
                    onClick={() => scroll(-320)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="hidden md:flex absolute left-4 top-[136px] z-30 w-12 h-12 bg-white/95 dark:bg-[#1D1D1D]/95 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-full items-center justify-center shadow-lg text-brand-dark dark:text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-brand-orange hover:text-white dark:hover:bg-brand-orange hover:border-brand-orange"
                >
                    <ChevronLeft size={24} />
                </motion.button>
                <motion.button
                    onClick={() => scroll(320)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="hidden md:flex absolute right-4 top-[136px] z-30 w-12 h-12 bg-white/95 dark:bg-[#1D1D1D]/95 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-full items-center justify-center shadow-lg text-brand-dark dark:text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-brand-orange hover:text-white dark:hover:bg-brand-orange hover:border-brand-orange"
                >
                    <ChevronRight size={24} />
                </motion.button>

                <div
                    ref={containerRef}
                    className="overflow-x-auto no-scrollbar pb-6 px-6 md:px-0 scroll-smooth snap-x snap-mandatory"
                >
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-50px" }}
                        className="flex gap-5 min-w-max md:justify-start lg:justify-center"
                    >
                        {activeCategories.map(cat => {
                            const count = categoryCounts[cat.id] || 0;
                            return (
                                <motion.div 
                                    key={cat.id} 
                                    variants={itemVariants}
                                    className="snap-start"
                                >
                                    <TiltCard
                                        count={count}
                                        label={cat.label}
                                        image={cat.image}
                                        onClick={() => onSelect(cat.id)}
                                    />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>

                {/* Smooth Glowing Progress Indicator */}
                {activeCategories.length > 2 && (
                    <div className="w-36 h-1.5 bg-gray-200/60 dark:bg-gray-800/60 rounded-full mx-auto mt-2 overflow-hidden relative shadow-inner">
                        <div 
                            className="h-full bg-gradient-to-r from-brand-orange to-orange-400 rounded-full transition-all duration-200 ease-out shadow-lg" 
                            style={{ 
                                width: `${Math.max(6, scrollProgress * 100)}%`,
                                transform: `translateX(${scrollProgress * (100 - (100 * 0.15))}%)`
                            }}
                        />
                    </div>
                )}
            </div>
        </section>
    );
};

export default VisualCategories;
