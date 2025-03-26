import React from 'react';
import { GalleryImage } from '../block-editor/types';

interface GalleryGridProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  gap?: 'small' | 'medium' | 'large';
}

const GalleryGrid: React.FC<GalleryGridProps> = ({
  images,
  columns = 3,
  gap = 'medium',
}) => {
  if (!images.length) return null;

  const getGapClass = () => {
    switch (gap) {
      case 'small': return 'gap-2';
      case 'large': return 'gap-6';
      default: return 'gap-4';
    }
  };

  const getColumnsClass = () => {
    switch (columns) {
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      default: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    }
  };

  return (
    <div className={`grid ${getColumnsClass()} ${getGapClass()}`}>
      {images.map((image, index) => (
        <figure 
          key={index} 
          className="overflow-hidden rounded-md group"
        >
          <div className="relative overflow-hidden rounded-md">
            <img
              src={image.src}
              alt={image.alt || ''}
              className="w-full h-auto aspect-square object-cover transition-transform group-hover:scale-105 duration-300"
            />
          </div>
          {image.caption && (
            <figcaption className="p-2 text-sm text-muted-foreground">
              {image.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
};

export default GalleryGrid;