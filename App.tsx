import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Button } from './components/Button';
import { UploadedImage, AnalysisResult, AnalysisStyle, LoadingState } from './types';
import { analyzeImage } from './services/geminiService';
import { Wand2, Zap, Settings2, MessageSquarePlus, Microscope, Edit3, Palette } from 'lucide-react';

const AESTHETIC_PRESETS = [
  { id: 'none', label: 'Match Original Style', icon: '🖼️' },
  { id: '90s-anime', label: '90s Retro Anime', icon: '🎌' },
  { id: 'pixar', label: 'Disney/Pixar 3D', icon: '🎬' },
  { id: 'realistic', label: 'Photorealistic', icon: '📸' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon', icon: '🏙️' },
  { id: 'oil-painting', label: 'Classic Oil Painting', icon: '🎨' },
  { id: 'sketch', label: 'Rough Charcoal Sketch', icon: '✏️' },
];

const App: React.FC = () => {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<AnalysisStyle>(AnalysisStyle.DESCRIPTIVE);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [targetAesthetic, setTargetAesthetic] = useState<string>('none');
  const [customAesthetic, setCustomAesthetic] = useState<string>('');
  const [extraDetail, setExtraDetail] = useState<boolean>(false);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false, message: '' });

  const handleImageSelected = (img: UploadedImage) => {
    setImage(img);
    setResult(null);
  };

  const handleClear = () => {
    setImage(null);
    setResult(null);
    setUserPrompt('');
    setEditPrompt('');
    setTargetAesthetic('none');
    setCustomAesthetic('');
    setExtraDetail(false);
  };

  const handleAnalyze = async () => {
    if (!image) return;

    const aesthetic = targetAesthetic === 'custom' ? customAesthetic : 
                     targetAesthetic === 'none' ? '' : targetAesthetic;

    setLoading({ 
      isLoading: true, 
      message: aesthetic 
        ? `Reimagining as ${aesthetic}...` 
        : (editPrompt ? 'Processing modifications...' : 'Analyzing visual elements...') 
    });
    
    try {
      await new Promise(r => setTimeout(r, 100));
      
      const analysisData = await analyzeImage(
        image.base64, 
        image.mimeType, 
        selectedStyle,
        userPrompt,
        extraDetail,
        editPrompt,
        aesthetic
      );
      
      setResult(analysisData);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setLoading({ isLoading: false, message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col font-sans">
      <header className="border-b border-zinc-800 bg-surface/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Prompt Vision
            </h1>
          </div>
          <div className="text-xs text-zinc-500 font-mono hidden sm:block tracking-widest uppercase">
            AI Image Analyst
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                Input Image
              </h2>
              <p className="text-zinc-400 text-sm mb-4">
                Upload a visual reference to analyze or transform.
              </p>
              <ImageUploader 
                currentImage={image} 
                onImageSelected={handleImageSelected} 
                onClear={handleClear} 
              />
            </section>

            {image && (
              <div className="bg-surface rounded-2xl border border-zinc-800 p-6 space-y-6 shadow-2xl animate-fade-in-up">
                
                {/* Aesthetic Transformation Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Palette size={20} />
                    <h3 className="font-bold text-sm tracking-wide uppercase">Style Transformation</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {AESTHETIC_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setTargetAesthetic(preset.id)}
                        className={`
                          text-xs p-3 rounded-xl border flex items-center gap-2 transition-all
                          ${targetAesthetic === preset.id 
                            ? 'bg-purple-500/10 border-purple-500 text-purple-300 ring-1 ring-purple-500/50' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }
                        `}
                      >
                        <span>{preset.icon}</span>
                        <span className="truncate">{preset.label}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setTargetAesthetic('custom')}
                      className={`
                        text-xs p-3 rounded-xl border flex items-center gap-2 transition-all
                        ${targetAesthetic === 'custom' 
                          ? 'bg-purple-500/10 border-purple-500 text-purple-300' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }
                      `}
                    >
                      <span>✨</span>
                      <span>Custom Style</span>
                    </button>
                  </div>

                  {targetAesthetic === 'custom' && (
                    <input
                      type="text"
                      value={customAesthetic}
                      onChange={(e) => setCustomAesthetic(e.target.value)}
                      placeholder="e.g. Victorian Steampunk, Ghibli, 1950s Technicolor"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:ring-2 focus:ring-purple-500/50 outline-none"
                    />
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                  <div className="flex items-center gap-2 text-zinc-200">
                    <Settings2 size={18} />
                    <h3 className="font-bold text-sm tracking-wide uppercase">Output Logic</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(AnalysisStyle).map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={`
                          text-[11px] px-3 py-2.5 rounded-xl border transition-all
                          ${selectedStyle === style 
                            ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                          }
                        `}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-4 cursor-pointer group bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
                    <div className={`
                      w-11 h-6 rounded-full p-1 transition-colors relative
                      ${extraDetail ? 'bg-indigo-500' : 'bg-zinc-700'}
                    `}>
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={extraDetail} 
                        onChange={() => setExtraDetail(!extraDetail)}
                      />
                      <div className={`
                        w-4 h-4 bg-white rounded-full transition-transform shadow-sm
                        ${extraDetail ? 'translate-x-5' : 'translate-x-0'}
                      `} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold flex items-center gap-1.5 text-zinc-200">
                        <Microscope size={14} />
                        Forensic Detail
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">Deep-scan textures & patterns</span>
                    </div>
                  </label>
                </div>

                <div className="space-y-3 pt-2 border-t border-zinc-800/50">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
                    <Edit3 size={14} />
                    Modifications
                  </div>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Add a blue cap, change to forest, etc."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none h-16"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-zinc-500 font-bold text-xs uppercase tracking-widest">
                    <MessageSquarePlus size={14} />
                    Context
                  </div>
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Provide context Gemini might miss..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-600 focus:ring-2 focus:ring-zinc-700 outline-none resize-none h-16"
                  />
                </div>

                <Button 
                  onClick={handleAnalyze} 
                  isLoading={loading.isLoading}
                  className="w-full rounded-xl py-6 text-base font-bold tracking-tight shadow-xl"
                  size="lg"
                  icon={<Wand2 size={22} />}
                >
                  {loading.isLoading ? loading.message : 'Analyze & Revisit'}
                </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            {result ? (
               <ResultDisplay result={result} />
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/50 rounded-3xl bg-zinc-900/10 text-zinc-500 p-12 text-center">
                <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 mb-6 flex items-center justify-center shadow-inner">
                  <Wand2 size={40} className="opacity-20 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-300 mb-2">Visual Insight Engine</h3>
                <p className="text-sm max-w-sm text-zinc-500 leading-relaxed">
                  Upload an image to extract high-fidelity prompts, analyzed motion, or completely reimagined aesthetics.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800 py-8 bg-zinc-950/50">
        <div className="container mx-auto px-4 text-center text-zinc-600 text-xs font-medium tracking-widest uppercase">
          <p>© {new Date().getFullYear()} Prompt Vision • Forensic Image Reimagining</p>
        </div>
      </footer>
    </div>
  );
};

export default App;