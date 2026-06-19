import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, FileText, X, AlertCircle } from 'lucide-react';
import apiClient from '../../api/apiClient';

export default function FileUploader({ 
  onUploadSuccess, 
  onUploadError, 
  allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'], 
  maxSizeMb = 10,
  label = "Upload logistics documents (POD, Bills, Inspections)"
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const validateAndUpload = (selectedFile) => {
    if (!selectedFile) return;

    // Check size
    const sizeInMb = selectedFile.size / (1024 * 1024);
    if (sizeInMb > maxSizeMb) {
      setUploadStatus('error');
      setErrorMessage(`File exceeds the limit of ${maxSizeMb}MB.`);
      if (onUploadError) onUploadError(`File exceeds ${maxSizeMb}MB.`);
      return;
    }

    // Check extension
    const extension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(extension)) {
      setUploadStatus('error');
      setErrorMessage(`Format ${extension} not supported. Allowed formats: ${allowedTypes.join(', ')}`);
      if (onUploadError) onUploadError(`Unsupported file format.`);
      return;
    }

    setFile(selectedFile);
    setUploadStatus('uploading');
    setUploadProgress(0);

    // Simulate progress upload for smoother visuals
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 90) {
        clearInterval(interval);
        setUploadProgress(90);
        
        // Trigger actual API call
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        apiClient.post('upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(response => {
          setUploadProgress(100);
          setUploadStatus('success');
          if (onUploadSuccess) {
            onUploadSuccess(response.data.url, selectedFile.name);
          }
        })
        .catch(err => {
          setUploadStatus('error');
          setErrorMessage('API integration upload failed.');
          if (onUploadError) onUploadError(err.message || 'Upload failed');
        });
      } else {
        setUploadProgress(progress);
      }
    }, 150);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2 text-left">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
        {label}
      </label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden ${
          isDragOver 
            ? 'border-brand-500 bg-brand-500/5' 
            : uploadStatus === 'error'
            ? 'border-red-500/50 bg-red-500/5'
            : uploadStatus === 'success'
            ? 'border-green-500/50 bg-green-500/5'
            : 'border-[#23324C] hover:border-brand-500/60 bg-[#111827]/40 hover:bg-[#111827]/80'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={allowedTypes.join(',')}
          className="hidden"
        />

        {uploadStatus === 'idle' && (
          <>
            <div className="p-3.5 bg-brand-500/10 rounded-2xl border border-brand-500/20 text-brand-400">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Drag & drop file or click to select</p>
              <p className="text-[10px] text-slate-400">
                Supports {allowedTypes.join(', ').toUpperCase()} (Max {maxSizeMb}MB)
              </p>
            </div>
          </>
        )}

        {uploadStatus === 'uploading' && (
          <div className="w-full space-y-3 px-4">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-400 animate-pulse" />
                <span className="truncate max-w-[180px]">{file?.name}</span>
              </div>
              <span className="font-mono text-brand-400">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-brand-500 h-full rounded-full transition-all duration-150" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 animate-pulse text-center">Uploading to secured storage node...</p>
          </div>
        )}

        {uploadStatus === 'success' && (
          <>
            <button 
              onClick={handleRemove}
              className="absolute top-3 right-3 p-1.5 hover:bg-[#1F2937] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20 text-green-400">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Upload Complete</p>
              <p className="text-[10px] text-green-400 font-mono truncate max-w-[240px]">{file?.name}</p>
            </div>
          </>
        )}

        {uploadStatus === 'error' && (
          <>
            <button 
              onClick={handleRemove}
              className="absolute top-3 right-3 p-1.5 hover:bg-[#1F2937] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-red-400">Upload Failed</p>
              <p className="text-[10px] text-slate-400">{errorMessage}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
