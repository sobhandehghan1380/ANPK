'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, CheckCircle2, AlertCircle, Image as ImageIcon, Film } from 'lucide-react';

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  placeholder?: string;
  type?: 'image' | 'video' | 'all';
  className?: string;
}

export default function FileUpload({ 
  value, 
  onChange, 
  accept, 
  label, 
  placeholder = 'فایل را انتخاب کنید یا اینجا بکشید...',
  type = 'image',
  className = ''
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const getAccept = () => {
    if (accept) return accept;
    switch (type) {
      case 'image': return 'image/*';
      case 'video': return 'video/*';
      default: return 'image/*,video/*';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Film className="w-4 h-4" />;
      default: return <UploadCloud className="w-4 h-4" />;
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validate file size (max 10MB for images, 50MB for videos)
    const maxSize = type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`حداکثر حجم فایل ${type === 'video' ? '۵۰' : '۱۰'} مگابایت است`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch(`${API_BASE}/api/v1/admin/upload/`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `خطا در آپلود فایل (${res.status})`);
      }

      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      } else {
        throw new Error('آدرس فایل دریافت نشد');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در آپلود فایل');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const clearFile = () => {
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1.5">
          {getIcon()}
          {label}
        </label>
      )}
      
      {/* Preview */}
      {value && (
        <div className="relative w-full h-32 rounded-xl overflow-hidden border dark:border-slate-700 border-slate-200 group">
          {type === 'video' || value.match(/\.(mp4|webm|ogg)$/i) ? (
            <video src={value} className="w-full h-full object-cover" controls />
          ) : (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={clearFile}
              className="p-2 rounded-lg bg-rose-500/80 text-white hover:bg-rose-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!value && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`relative w-full p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all text-center ${
            dragActive 
              ? 'border-brand-500 bg-brand-500/10' 
              : 'dark:border-slate-700 border-slate-300 hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={getAccept()}
            onChange={handleFileChange}
            className="hidden"
          />
          
          {uploading ? (
            <div className="space-y-2">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">در حال آپلود...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <UploadCloud className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-xs text-slate-400">{placeholder}</p>
              <p className="text-[10px] text-slate-500">
                {type === 'image' ? 'حداکثر ۱۰ مگابایت - JPG, PNG, WebP, SVG' : 
                 type === 'video' ? 'حداکثر ۵۰ مگابایت - MP4, WebM, OGG' :
                 'تصویر یا ویدیو'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* URL Input (optional) */}
      {!value && !uploading && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="یا آدرس URL وارد کنید..."
            className="flex-1 px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>
      )}

      {/* Status */}
      {error && (
        <div className="flex items-center gap-1 text-rose-500 text-[10px]">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}
      {value && !error && (
        <div className="flex items-center gap-1 text-emerald-500 text-[10px]">
          <CheckCircle2 className="w-3 h-3" />
          <span>فایل آپلود شد</span>
        </div>
      )}
    </div>
  );
}
