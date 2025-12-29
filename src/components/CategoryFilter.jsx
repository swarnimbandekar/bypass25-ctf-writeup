import React from 'react';
import { motion } from 'framer-motion';

const categories = ["All", "Cryptography", "Steganography", "Reverse Engineering", "Forensics", "Web", "Miscellaneous", "Other"];

const CategoryFilter = ({ selectedCategory, setSelectedCategory }) => {
    return (
        <div className="flex flex-wrap justify-center gap-4 my-12 px-4">
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors outline-none focus-visible:ring-2"
                >
                    {selectedCategory === category && (
                        <motion.div
                            layoutId="activeCategory"
                            className="absolute inset-0 bg-green-500/10 border border-green-500/50 rounded-full"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className={`relative z-10 ${selectedCategory === category ? 'text-green-400' : 'text-slate-400 hover:text-white'}`}>
                        {category}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;
