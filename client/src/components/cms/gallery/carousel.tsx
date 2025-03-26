import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useEmblaCarousel from 'embla-carousel-react';
import { GalleryImage } from '../block-editor/types';

interface GalleryCarouselProps {
  images: GalleryImage[];
  showDots?: boolean;
  showArrows?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
}

const GalleryCarousel: React.FC<GalleryCarouselProps> = ({
  images,
  showDots = true,
  showArrows = true,
  autoplay = false,
  autoplayInterval = 5000,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || !autoplay) return;

    const autoplayInterval = setInterval(() => {
      emblaApi.scrollNext();
    }, autoplayInterval);

    return () => {
      clearInterval(autoplayInterval);
    };
  }, [emblaApi, autoplay, autoplayInterval]);

  if (!images.length) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div
              className="min-w-full relative"
              key={index}
            >
              <div className="p-2">
                <div className="overflow-hidden rounded-md">
                  <img
                    src={image.src}
                    alt={image.alt || ''}
                    className="w-full h-[300px] object-cover transition-transform hover:scale-105 duration-300"
                  />
                  {image.caption && (
                    <div className="p-2 text-sm text-muted-foreground">
                      {image.caption}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showArrows && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border-none shadow-md"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border-none shadow-md"
            onClick={scrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {showDots && (
        <div className="flex justify-center gap-1 mt-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === selectedIndex
                  ? 'bg-primary'
                  : 'bg-muted-foreground/20'
              }`}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryCarousel;