import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Shield, Flag } from 'lucide-react';

const Hero = () => {
    return (
        <div className="relative min-h-[60vh] flex flex-col items-center justify-center text-center overflow-hidden bg-slate-900 border-b border-slate-800">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/40 via-slate-900 to-transparent"></div>
                <div className="grid grid-cols-12 h-full w-full opacity-10">
                    {[...Array(96)].map((_, i) => (
                        <div key={i} className="border-[0.5px] border-green-500/20"></div>
                    ))}
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10"
            >
                <div className="flex items-center justify-center gap-3 mb-4 text-green-400">
                    <Terminal className="w-6 h-6" />
                    <span className="font-mono text-sm tracking-widest uppercase">System Ready</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tighter">
                    Bypass25 <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">CTF Writeups</span>
                </h1>

                <motion.div
                    className="flex items-center justify-center gap-2 text-xl md:text-2xl text-slate-400 font-mono"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <Shield className="w-5 h-5 text-purple-500" />
                    <span>Team: </span>
                    <span className="text-white font-bold bg-slate-800 px-2 py-1 rounded">TrickedMyAunty</span>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Hero;
