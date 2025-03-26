import React from 'react';
import { Block, PageData } from '@/types/cms';
import LivePreview from '../preview/LivePreview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EyeOff, Smartphone, Tablet, Monitor } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface PreviewPanelProps {
  pageData: PageData;
  blocks: Block[];
  onClose: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  pageData, 
  blocks,
  onClose 
}) => {
  const [viewportSize, setViewportSize] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle>Vista Previa en Tiempo Real</CardTitle>
            <CardDescription>
              Visualiza los cambios antes de guardarlos
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <ToggleGroup type="single" value={viewportSize} onValueChange={(value) => value && setViewportSize(value as any)}>
              <ToggleGroupItem value="mobile" aria-label="Móvil">
                <Smartphone className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="tablet" aria-label="Tablet">
                <Tablet className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="desktop" aria-label="Escritorio">
                <Monitor className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="ml-2"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-auto">
          <div className={`
            w-full h-full overflow-auto mx-auto bg-background border-x
            ${viewportSize === 'mobile' ? 'max-w-[375px]' : 
              viewportSize === 'tablet' ? 'max-w-[768px]' : 
              'max-w-full'}
          `}>
            <LivePreview 
              pageData={pageData} 
              blocks={blocks} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreviewPanel;