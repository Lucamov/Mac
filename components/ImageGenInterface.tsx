import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Download, Share2 } from 'lucide-react';
import { generateImageFromText } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const ImageGenInterface: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateImageFromText(prompt);
      setGeneratedImage(result);
    } catch (err) {
      setError("Failed to generate image. Please try a different prompt or try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      <div className="p-6 border-b border-slate-800 bg-slate-950/50">
        <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
          <Sparkles className="w-6 h-6" /> Image Studio
        </h2>
        <p className="text-slate-400 text-sm mt-1">Generate stunning visuals using Gemini 2.5 Flash Image.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        
        {/* Input Section */}
        <div className="w-full max-w-2xl space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            Describe your imagination
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., A futuristic city made of crystal on Mars, cinematic lighting, 8k..."
              className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap"
            >
              {isLoading ? 'Creating...' : 'Generate'} <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Display Area */}
        <div className="flex-1 w-full max-w-2xl mt-8 flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/30 relative overflow-hidden">
          
          {isLoading ? (
            <LoadingSpinner text="Dreaming up your image..." />
          ) : generatedImage ? (
            <div className="relative group w-full h-full flex items-center justify-center bg-black">
              <img 
                src={generatedImage} 
                alt="Generated" 
                className="max-w-full max-h-full object-contain shadow-2xl"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                <a 
                  href={generatedImage} 
                  download={`gemini-gen-${Date.now()}.png`}
                  className="p-3 bg-white text-slate-900 rounded-full hover:bg-slate-200 transition-colors"
                  title="Download"
                >
                  <Download className="w-6 h-6" />
                </a>
              </div>
            </div>
          ) : error ? (
            <div className="text-center p-6 text-red-400">
              <p>{error}</p>
            </div>
          ) : (
            <div className="text-center p-6 text-slate-600">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Ready to create</p>
              <p className="text-sm">Enter a prompt above to generate an image.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenInterface;