import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BrainCircuit, ChevronDown, ChevronUp, BarChart2, Lightbulb } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AnalysisCardProps {
  title: string;
  description: string;
  type: 'appcc' | 'inventory' | 'purchases' | 'general';
  status?: 'loading' | 'ready' | 'error';
  summary?: string;
  insights?: string[];
  metrics?: { label: string; value: string | number; color?: string }[];
  recommendations?: string[];
  onRefresh?: () => void;
  onViewDetails?: () => void;
}

export function AnalysisCard({
  title,
  description,
  type,
  status = 'ready',
  summary,
  insights = [],
  metrics = [],
  recommendations = [],
  onRefresh,
  onViewDetails
}: AnalysisCardProps) {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);

  // Iconos según el tipo de análisis
  const getIcon = () => {
    switch (type) {
      case 'appcc':
        return <BrainCircuit className="h-5 w-5 text-blue-500" />;
      case 'inventory':
        return <BarChart2 className="h-5 w-5 text-green-500" />;
      case 'purchases':
        return <BarChart2 className="h-5 w-5 text-violet-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <Card className="shadow-sm border-opacity-50 h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {status === 'loading' && (
            <Loader2 className="animate-spin h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {status === 'loading' ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <Loader2 className="animate-spin h-8 w-8 text-primary/50 mb-4" />
            <p className="text-sm text-muted-foreground">Generando análisis con IA...</p>
          </div>
        ) : status === 'error' ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
            No se pudo generar el análisis. Por favor, inténtalo de nuevo.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resumen */}
            {summary && (
              <div className="bg-muted/50 p-3 rounded-md text-sm">
                {summary}
              </div>
            )}

            {/* Métricas */}
            {metrics.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {metrics.map((metric, i) => (
                  <div 
                    key={i} 
                    className={`p-3 rounded-lg border ${
                      metric.color === 'green' ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900' :
                      metric.color === 'yellow' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900' :
                      metric.color === 'red' ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900' :
                      'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900'
                    }`}
                  >
                    <div className={`text-xs font-medium ${
                      metric.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      metric.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                      metric.color === 'red' ? 'text-red-600 dark:text-red-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`}>
                      {metric.label}
                    </div>
                    <div className="text-xl font-bold">{metric.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Insights colapsables */}
            {insights.length > 0 && (
              <Collapsible open={insightsOpen} onOpenChange={setInsightsOpen} className="border rounded-md">
                <CollapsibleTrigger className="flex justify-between items-center w-full p-3 text-sm font-medium">
                  <span>Insights</span>
                  {insightsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="p-3 pt-0 border-t">
                  <ul className="space-y-2 text-sm">
                    {insights.map((insight, i) => (
                      <li key={i} className="flex gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Recomendaciones colapsables */}
            {recommendations.length > 0 && (
              <Collapsible open={recommendationsOpen} onOpenChange={setRecommendationsOpen} className="border rounded-md">
                <CollapsibleTrigger className="flex justify-between items-center w-full p-3 text-sm font-medium">
                  <span>Recomendaciones</span>
                  {recommendationsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="p-3 pt-0 border-t">
                  <ul className="space-y-2 text-sm">
                    {recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-primary font-semibold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}
      </CardContent>

      {/* Acciones */}
      {status !== 'loading' && (
        <CardFooter className="pt-2 flex justify-between">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Actualizar
            </Button>
          )}
          {onViewDetails && (
            <Button variant="default" size="sm" onClick={onViewDetails}>
              Ver detalles
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}