import React, { useState, useRef } from 'react';
import { Eye, Upload, X, Search, FileImage } from 'lucide-react';
import { analyzeImageWithPrompt } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from './LoadingSpinner';

const VisionInterface: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysis(null); // Reset previous analysis
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!previewUrl || !prompt.trim()) return;

    setIsLoading(true);
    try {
      const result = await analyzeImageWithPrompt(previewUrl, prompt);
      setAnalysis(result);
    } catch (error) {
      setAnalysis("Failed to analyze the image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      <div className="p-6 border-b border-slate-80