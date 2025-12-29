import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Flag, Unlock, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChallengeCard = ({ challenge }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-green-500/30 transition-colors"
        >
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="p-6 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 text-xs font-mono bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                            {challenge.category || "Challenge"}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-mono text-slate-500 border border-slate-700/50 rounded flex items-center gap-1">
                            By {challenge.author || "Swarnim"}
                        </span>
                        {isOpen && <span className="text-xs text-green-500 font-mono flex items-center gap-1"><Unlock size={12} /> SOLVED</span>}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>

                    {/* Render part of description as plain text if possible, or just truncate visually */}
                    <div className="text-slate-400 text-sm line-clamp-2 md:line-clamp-none whitespace-pre-line">
                        {challenge.description}
                    </div>
                </div>

                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className="p-2 bg-slate-900 rounded-lg text-slate-400"
                >
                    <ChevronDown size={20} />
                </motion.div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-slate-700 bg-slate-900/50"
                    >
                        <div className="p-6 space-y-6">
                            {/* Expandable Solution Content using ReactMarkdown */}
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold text-green-400 mb-4 uppercase tracking-wider">
                                    <Terminal size={16} /> Solution Analysis
                                </h4>

                                <div className="text-slate-300 leading-relaxed text-sm markdown-content space-y-4">
                                    <ReactMarkdown
                                        rehypePlugins={[rehypeRaw]}
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '')
                                                return !inline && match ? (
                                                    <div className="rounded-lg overflow-hidden border border-slate-700 my-4">
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-[#252526] border-b border-black">
                                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                            <span className="ml-2 text-xs text-slate-400 font-mono">{match[1]}</span>
                                                        </div>
                                                        <SyntaxHighlighter
                                                            style={vscDarkPlus}
                                                            language={match[1]}
                                                            PreTag="div"
                                                            customStyle={{ margin: 0, padding: '1rem', background: '#1e1e1e' }}
                                                            {...props}
                                                        >
                                                            {String(children).replace(/\n$/, '')}
                                                        </SyntaxHighlighter>
                                                    </div>
                                                ) : (
                                                    <code className="bg-slate-700/50 px-1 py-0.5 rounded text-green-300 font-mono text-xs" {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            },
                                            img({ src, alt }) {
                                                return (
                                                    <div className="my-4 rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                                                        <img
                                                            src={src}
                                                            alt={alt}
                                                            className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-300"
                                                        />
                                                    </div>
                                                );
                                            },
                                            p({ children }) {
                                                return <p className="mb-4">{children}</p>
                                            },
                                            a({ href, children }) {
                                                return <a href={href} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">{children}</a>
                                            }
                                        }}
                                    >
                                        {challenge.solution}
                                    </ReactMarkdown>
                                </div>
                            </div>

                            {/* Flag Display */}
                            <div className="p-4 bg-green-900/10 border border-green-500/20 rounded-lg flex items-start md:items-center gap-4 flex-col md:flex-row group">
                                <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
                                    <Flag className="text-green-500" size={24} />
                                </div>
                                <div className="flex-1 overflow-hidden w-full">
                                    <p className="text-xs text-green-400/70 font-mono mb-1 uppercase tracking-widest">Captured Flag</p>
                                    <code className="block w-full text-green-300 font-mono text-sm md:text-base break-all selection:bg-green-500/30">
                                        {challenge.flag}
                                    </code>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ChallengeCard;
