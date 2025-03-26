import React from 'react';
import { GalleryImage } from '../block-editor/types';

interface GalleryMasonryProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
}

const GalleryMasonry: React.FC<GalleryMasonryProps> = ({
  images,
  columns = 3,
}) => {
  if (!images.length) return null;

  // Dividir las imágenes en columnas
  const columnsArray: GalleryImage[][] = Array.from({ length: columns }, () => []);
  
  // Distribuir imágenes en columnas para crear el efecto masonry
  images.forEach((image, index) => {
    columnsArray[index % columns].push(image);
  });

  return (
    <div className="flex flex-wrap -mx-2">
      {columnsArray.map((column, columnIndex) => (
        <div 
          key={columnIndex} 
          className={`px-2 ${
            columns === 2 ? 'w-1/2' : 
            columns === 3 ? 'w-1/3' : 
            'w-1/4'
          }`}
        >
          <div className="flex flex-col space-y-4">
            {column.map((image, imageIndex) => (
              <div 
                key={imageIndex} 
                className="overflow-hidden rounded-md"
              >
                <figure className="relative">
                  <img
                    src={image.src}
                    alt={image.alt || ''}
                    className="w-full h-auto object-cover transition-transform hover:scale-105 duration-300"
                  />
                  {image.caption && (
                    <figcaption className="p-2 text-sm text-muted-foreground">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GalleryMasonry;