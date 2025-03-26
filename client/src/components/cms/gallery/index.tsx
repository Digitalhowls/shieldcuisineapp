import GalleryCarousel from './carousel';
import GalleryMasonry from './masonry';
import GalleryGrid from './grid';
import { GalleryImage } from '../block-editor/types';

export type GalleryViewType = 'carousel' | 'masonry' | 'grid';

interface GalleryProps {
  images: GalleryImage[];
  viewType: GalleryViewType;
  
  // Propiedades específicas del carrusel
  showDots?: boolean;
  showArrows?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  
  // Propiedades para masonry y grid
  columns?: 2 | 3 | 4;
  gap?: 'small' | 'medium' | 'large';
}

const Gallery: React.FC<GalleryProps> = ({
  images,
  viewType,
  showDots,
  showArrows,
  autoplay,
  autoplayInterval,
  columns,
  gap,
}) => {
  if (!images || !images.length) return null;
  
  switch (viewType) {
    case 'carousel':
      return (
        <GalleryCarousel
          images={images}
          showDots={showDots}
          showArrows={showArrows}
          autoplay={autoplay}
          autoplayInterval={autoplayInterval}
        />
      );
    case 'masonry':
      return (
        <GalleryMasonry
          images={images}
          columns={columns}
        />
      );
    case 'grid':
      return (
        <GalleryGrid
          images={images}
          columns={columns}
          gap={gap}
        />
      );
    default:
      return <GalleryGrid images={images} />;
  }
};

export { Gallery, GalleryCarousel, GalleryMasonry, GalleryGrid };
export default Gallery;