import React, { useState, useEffect } from 'react';
import { resolveFileUrl } from '../services/mediaStorage';
import { Image as ImageIcon } from 'lucide-react';

interface MediaImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  onClick?: () => void;
}

export const MediaImage: React.FC<MediaImageProps> = ({
  src,
  alt,
  className = '',
  fallbackIcon,
  onClick,
}) => {
  const [resolvedUrl, setResolvedUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    if (!src) {
      setIsLoading(false);
      return;
    }

    resolveFileUrl(src)
      .then((url) => {
        if (isMounted) {
          setResolvedUrl(url);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (!src || hasError || (!isLoading && !resolvedUrl)) {
    return (
      <div 
        onClick={onClick}
        className={`flex items-center justify-center bg-[#202020] text-gray-500 border border-gray-800 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      >
        {fallbackIcon || <ImageIcon className="h-5 w-5 text-gray-600" />}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#181818] ${className} ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      {isLoading && (
        <div className="absolute inset-0 bg-[#242424] animate-pulse flex items-center justify-center">
          <ImageIcon className="h-4 w-4 text-gray-600" />
        </div>
      )}
      <img
        src={resolvedUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={() => setHasError(true)}
      />
    </div>
  );
};
