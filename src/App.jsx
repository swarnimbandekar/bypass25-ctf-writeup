import React, { useState, useMemo } from 'react';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import ChallengeCard from './components/ChallengeCard';
import { writeups } from './content';
import { Github, Linkedin, ExternalLink } from 'lucide-react';

function App() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredData = useMemo(() => {
    if (selectedCategory === "All") {
      // Flatten all challenges and tag them with their category
      return writeups.flatMap(cat =>
        cat.challenges.map(chall => ({ ...chall, category: cat.category }))
      );
    }
    const categoryData = writeups.find(w => w.category === selectedCategory);
    return categoryData ? categoryData.challenges.map(chall => ({ ...chall, category: selectedCategory })) : [];
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-green-500/30">
      <Hero />

      <main className="max-w-5xl mx-auto pb-20">
        <CategoryFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <div className="px-4 space-y-4">
          {filteredData.map((challenge, index) => (
            <ChallengeCard key={index} challenge={challenge} />
          ))}

          {filteredData.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              No writeups found for this category.
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-800 bg-slate-900 py-12 text-center">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center">
          <p className="text-slate-400 mb-6 font-mono text-sm">
            Team <span className="text-white">TrickedMyAunty</span>
          </p>
          <div className="flex gap-6">
            <a href="https://github.com/swarnimbandekar" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
              <Github size={20} />
            </a>
            <a href="https://www.linkedin.com/in/swarnimbandekar" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors">
              <Linkedin size={20} />
            </a>
            <a href="https://medium.com/@swarnimbandekar" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
              <ExternalLink size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
