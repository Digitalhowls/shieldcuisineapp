import React, { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface MediaUploadProps {
  onSuccess?: (mediaItem: any) => void;
  onError?: (error: Error) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // en bytes
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onSuccess,
  onError,
  multiple = false,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB por defecto
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    
    // Validar tamaño de los archivos
    const invalidFiles = fileList.filter(file => file.size > maxSize);
    if (invalidFiles.length > 0) {
      toast({
        title: "Archivos demasiado grandes",
        description: `Algunos archivos exceden el tamaño máximo de ${Math.round(maxSize / (1024 * 1024))}MB`,
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFiles(fileList);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No hay archivos seleccionados",
        description: "Por favor, selecciona al menos un archivo para subir",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadStatus("uploading");

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", file.name);
        formData.append("type", file.type);
        formData.append("size", file.size.toString());

        // Simular progreso
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev < 90) return prev + 10;
            return prev;
          });
        }, 300);

        // Enviar el archivo al servidor
        await apiRequest("POST", "/api/cms/media", formData);

        clearInterval(progressInterval);
        setProgress(100);

        if (onSuccess) {
          onSuccess({
            id: Math.random().toString(36).substr(2, 9), // Simulado
            name: file.name,
            type: file.type,
            size: file.size,
            url: URL.createObjectURL(file), // Temporal, en realidad vendría del servidor
          });
        }
      }

      // Actualizar la caché de consultas
      queryClient.invalidateQueries({ queryKey: ["/api/cms/media"] });

      setUploadStatus("success");
      toast({
        title: "Archivos subidos correctamente",
        description: `${selectedFiles.length} archivo(s) subido(s) con éxito`,
      });

      // Limpiar estado
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error al subir archivos:", error);
      setUploadStatus("error");
      toast({
        title: "Error al subir archivos",
        description: "Ha ocurrido un problema al subir los archivos",
        variant: "destructive",
      });
      if (onError && error instanceof Error) onError(error);
    } finally {
      setUploading(false);
      // Resetear el estado después de unos segundos
      setTimeout(() => {
        setUploadStatus("idle");
        setProgress(0);
      }, 3000);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      
      // Si no es multiple, solo tomamos el primer archivo
      if (!multiple && droppedFiles.length > 1) {
        toast({
          title: "Solo se permite un archivo",
          description: "Por favor, selecciona solo un archivo para subir",
          variant: "destructive",
        });
        return;
      }
      
      // Validar tipos de archivo
      const acceptedTypes = accept.split(",").map(type => type.trim());
      const invalidTypes = droppedFiles.filter(file => {
        // Si accept es "image/*", verificamos que sea una imagen
        if (acceptedTypes.includes("image/*") && file.type.startsWith("image/")) {
          return false;
        }
        // Para otros tipos, verificamos exactamente
        return !acceptedTypes.some(type => file.type === type);
      });
      
      if (invalidTypes.length > 0) {
        toast({
          title: "Tipo de archivo no válido",
          description: `Solo se permiten archivos de tipo: ${accept}`,
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFiles(multiple ? droppedFiles : [droppedFiles[0]]);
    }
  };

  const handleCancel = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSelectedFiles([]);
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors hover:bg-muted/50 ${
          selectedFiles.length > 0 ? "border-primary" : "border-border"
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          multiple={multiple}
          accept={accept}
        />

        {selectedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-medium">Arrastra archivos aquí o haz clic para seleccionar</h3>
            <p className="text-sm text-muted-foreground">
              Soporta {multiple ? "múltiples archivos" : "un archivo"} de tipo {accept}
            </p>
            <p className="text-xs text-muted-foreground">
              Tamaño máximo: {Math.round(maxSize / (1024 * 1024))}MB
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">
              {selectedFiles.length} archivo(s) seleccionado(s)
            </h3>
            <ul className="mt-2 text-sm text-muted-foreground">
              {selectedFiles.map((file, index) => (
                <li key={index}>{file.name} ({Math.round(file.size / 1024)} KB)</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {uploadStatus === "uploading" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Subiendo...</span>
            <span className="text-sm">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="flex items-center justify-end space-x-2">
        {selectedFiles.length > 0 && !uploading && (
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        )}
        
        <Button
          onClick={handleUpload}
          disabled={uploading || selectedFiles.length === 0}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir {selectedFiles.length > 0 ? `${selectedFiles.length} archivo(s)` : "archivos"}
            </>
          )}
        </Button>
      </div>

      {uploadStatus === "success" && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
            <span className="ml-2 text-sm text-green-700 dark:text-green-300">
              Archivos subidos correctamente
            </span>
          </div>
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="ml-2 text-sm text-red-700 dark:text-red-300">
              Error al subir los archivos. Por favor, inténtalo de nuevo.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUpload;