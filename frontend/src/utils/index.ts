export const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text to clipboard:', err);
    return false;
  }
};

export const getCategoryColor = (category: string): string => {
  const colorMap = {
    happy_path: 'bg-[rgba(16,185,129,0.1)] text-accent3 border-[rgba(16,185,129,0.2)]',
    edge_case: 'bg-[rgba(245,158,11,0.1)] text-warn border-[rgba(245,158,11,0.2)]',
    negative: 'bg-[rgba(239,68,68,0.1)] text-[#f87171] border-[rgba(239,68,68,0.2)]',
    boundary: 'bg-[rgba(124,58,237,0.1)] text-[#a78bfa] border-[rgba(124,58,237,0.2)]'
  };
  return colorMap[category as keyof typeof colorMap] || colorMap.happy_path;
};

export const getPriorityColor = (priority: string): string => {
  const colorMap = {
    high: 'bg-[#f87171]',
    medium: 'bg-warn',
    low: 'bg-border'
  };
  return colorMap[priority as keyof typeof colorMap] || colorMap.medium;
};
