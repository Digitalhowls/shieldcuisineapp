import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BarChart4, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AIAnalysisProps {
  controlId: number;
  controlName: string;
}

type AnalysisType = 'summary' | 'recommendations' | 'compliance' | 'trends';

interface AIAnalysisResponse {
  analysis: string;
  recommendations?: string[];
  complianceScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

export default function AIAnalysis({ controlId, controlName }: AIAnalysisProps) {
  const { toast } = useToast();
  const [analysisType, setAnalysisType] = useState<AnalysisType>('summary');
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AIAnalysisResponse | null>(null);
  
  const handleAnalyze = async () => {
    setIsLoading(true);
    
    try {
      const res = await apiRequest('POST', `/api/analyze/appcc/${controlId}`, {
        requestType: analysisType,
        language
      });
      
      if (!res.ok) {
        throw new Error(`Error al solicitar análisis: ${res.status}`);
      }
      
      const data = await res.json();
      setAnalysisData(data);
      
      toast({
        title: "Análisis completado",
        description: "El análisis de IA se ha completado correctamente.",
        variant: "default",
      });
      
    } catch (error) {
      console.error('Error al analizar control:', error);
      toast({
        title: "Error al realizar análisis",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al procesar el análisis.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para formatear las recomendaciones como lista
  const formatRecommendations = (recommendations: string[] = []) => {
    if (recommendations.length === 0) return null;
    
    return (
      <ul className="mt-4 space-y-2 list-disc list-inside">
        {recommendations.map((rec, index) => (
          <li key={index} className="text-sm">{rec}</li>
        ))}
      </ul>
    );
  };
  
  // Función para mostrar el nivel de riesgo con color adecuado
  const getRiskBadge = (level?: 'low' | 'medium' | 'high') => {
    if (!level) return null;
    
    const colors = {
      low: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-red-100 text-red-800 border-red-200"
    };
    
    const icons = {
      low: <CheckCircle className="h-4 w-4 mr-1" />,
      medium: <AlertTriangle className="h-4 w-4 mr-1" />,
      high: <AlertTriangle className="h-4 w-4 mr-1" />
    };
    
    const labels = {
      low: language === 'es' ? "Bajo" : "Low",
      medium: language === 'es' ? "Medio" : "Medium",
      high: language === 'es' ? "Alto" : "High"
    };
    
    return (
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[level]} border`}>
        {icons[level]}
        {labels[level]}
      </div>
    );
  };
  
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart4 className="h-5 w-5" />
          {language === 'es' ? 'Análisis Inteligente' : 'AI Analysis'}
        </CardTitle>
        <CardDescription>
          {language === 'es' 
            ? 'Obtenga información y recomendaciones basadas en los datos del control'
            : 'Get insights and recommendations based on control data'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">
                {language === 'es' ? 'Tipo de análisis' : 'Analysis type'}
              </label>
              <Select
                value={analysisType}
                onValueChange={(value) => setAnalysisType(value as AnalysisType)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">
                    {language === 'es' ? 'Resumen' : 'Summary'}
                  </SelectItem>
                  <SelectItem value="recommendations">
                    {language === 'es' ? 'Recomendaciones' : 'Recommendations'}
                  </SelectItem>
                  <SelectItem value="compliance">
                    {language === 'es' ? 'Evaluación de cumplimiento' : 'Compliance assessment'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">
                {language === 'es' ? 'Idioma' : 'Language'}
              </label>
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value as 'es' | 'en')}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleAnalyze} 
            disabled={isLoading}
            className="self-start mt-2"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {language === 'es' ? 'Analizar control' : 'Analyze control'}
          </Button>
          
          {analysisData && (
            <div className="mt-4 border rounded-md p-4">
              <Tabs defaultValue="analysis" className="w-full">
                <TabsList>
                  <TabsTrigger value="analysis">
                    <FileText className="h-4 w-4 mr-2" />
                    {language === 'es' ? 'Análisis' : 'Analysis'}
                  </TabsTrigger>
                  {analysisData.recommendations && analysisData.recommendations.length > 0 && (
                    <TabsTrigger value="recommendations">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {language === 'es' ? 'Recomendaciones' : 'Recommendations'}
                    </TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="analysis" className="mt-4">
                  <div className="space-y-4">
                    {analysisData.complianceScore !== undefined && (
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-medium">
                          {language === 'es' ? 'Puntuación de cumplimiento' : 'Compliance score'}:
                        </span>
                        <div className="flex items-center">
                          <span className="text-lg font-bold mr-2">
                            {analysisData.complianceScore}%
                          </span>
                          {getRiskBadge(analysisData.riskLevel)}
                        </div>
                      </div>
                    )}
                    
                    <div className="whitespace-pre-line">
                      {analysisData.analysis}
                    </div>
                  </div>
                </TabsContent>
                
                {analysisData.recommendations && analysisData.recommendations.length > 0 && (
                  <TabsContent value="recommendations">
                    {formatRecommendations(analysisData.recommendations)}
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between text-xs text-gray-500">
        <div>
          {language === 'es' 
            ? 'Análisis generado por IA basado en los datos del control'
            : 'AI-generated analysis based on control data'}
        </div>
      </CardFooter>
    </Card>
  );
}