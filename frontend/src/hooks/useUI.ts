import { useState, useRef } from 'react';

export const useToast = () => {
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2800);
  };

  return {
    toastMessage,
    showToast,
    triggerToast,
  };
};

export const useFileUpload = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [code, setCode] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setCode(e.target?.result as string);
    reader.readAsText(file);
  };

  const clearFile = () => {
    setUploadedFile(null);
    setCode('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return {
    uploadedFile,
    code,
    setCode,
    fileInputRef,
    handleFileChange,
    processFile,
    clearFile,
  };
};

export const useDragDrop = (onDrop: (file: File) => void) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onDrop(e.dataTransfer.files[0]);
    }
  };

  return {
    dragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};

export const useExpandedCards = () => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (id: string) => {
    const newSet = new Set(expandedCards);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedCards(newSet);
  };

  return {
    expandedCards,
    toggleCard,
  };
};

export const useScrollTo = () => {
  const resultsRef = useRef<HTMLDivElement>(null);

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return {
    resultsRef,
    scrollToResults,
  };
};
