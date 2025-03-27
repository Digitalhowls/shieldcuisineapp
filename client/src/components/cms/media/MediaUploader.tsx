import React, { useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from "react-dropzone";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  Upload,
  File,
  FileText,
  FileImage,
  FileVideo,
  X,
  Check,
} from "lucide-react";

interface MediaCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

type MediaUploaderProps = {
  onClose: () => void;
  onSuccess?: () => void;
  onUploadComplete?: () => void;
  categories?: MediaCategory[];
  companyId?: number;
};

type FileWithStatus = File & {
  id: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  preview?: string;
  error?: string;
};

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onClose,
  onSuccess,
  onUploadComplete,
  categories = [],
  companyId,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Función para generar un ID único
  const generateId = () => {
    return crypto.randomUUID();
  };

  // Configuración del dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => {
      // Solo crear previsualizaciones para imágenes
      let preview = undefined;
      if (file.type.startsWith("image/")) {
        preview = URL.createObjectURL(file);
      }

      return Object.assign(file, {
        id: generateId(),
        progress: 0,
        status: "pending",
        preview,
      });
    });

    setFiles((current) => [...current, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "video/*": [],
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
      "application/vnd.ms-excel": [],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
      "text/plain": [],
      "text/html": [],
      "text/css": [],
      "text/javascript": [],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  // Función para eliminar un archivo de la lista
  const removeFile = (id: string) => {
    setFiles((current) => {
      const updatedFiles = current.filter((file) => file.id !== id);
      return updatedFiles;
    });
  };

  // Función para subir un archivo
  const uploadFile = async (file: FileWithStatus) => {
    try {
      // Actualizar el estado a "uploading"
      setFiles((current) =>
        current.map((f) =>
          f.id === file.id ? { ...f, status: "uploading" } : f
        )
      );

      const formData = new FormData();
      formData.append("file", file);
      if (selectedCategory) {
        formData.append("categoryId", selectedCategory);
      }
      if (companyId) {
        formData.append("companyId", companyId.toString());
      } else if (user?.companyId) {
        formData.append("companyId", user.companyId.toString());
      }

      const response = await fetch("/api/cms/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al subir el archivo");
      }

      // Actualizar el estado a "success"
      setFiles((current) =>
        current.map((f) =>
          f.id === file.id ? { ...f, status: "success", progress: 100 } : f
        )
      );

      return await response.json();
    } catch (error: any) {
      console.error("Error al subir archivo:", error);
      
      // Actualizar el estado a "error"
      setFiles((current) =>
        current.map((f) =>
          f.id === file.id ? { ...f, status: "error", error: error.message || "Error desconocido" } : f
        )
      );
      
      throw error;
    }
  };

  // Función para subir todos los archivos
  const uploadAllFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const promises = files
        .filter((file) => file.status === "pending")
        .map(async (file) => {
          try {
            await uploadFile(file);
            successCount++;
          } catch (error) {
            errorCount++;
          }
        });

      await Promise.all(promises);

      // Invalidar la caché para actualizar la vista
      queryClient.invalidateQueries({ queryKey: ["/api/cms/media"] });

      if (successCount > 0) {
        toast({
          title: `${successCount} ${successCount === 1 ? "archivo subido" : "archivos subidos"} correctamente`,
          description: errorCount > 0 ? `${errorCount} ${errorCount === 1 ? "archivo falló" : "archivos fallaron"}` : undefined,
        });
      } else if (errorCount > 0) {
        toast({
          title: "Error al subir archivos",
          description: `Ningún archivo se pudo subir correctamente`,
          variant: "destructive",
        });
      }

      // Si todos se subieron con éxito, cerrar el diálogo
      if (errorCount === 0 && successCount > 0) {
        if (onSuccess) onSuccess();
        if (onUploadComplete) onUploadComplete();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al subir los archivos",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Función para obtener un icono según el tipo de archivo
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <FileImage className="h-8 w-8 text-blue-500" />;
    } else if (mimeType.startsWith("video/")) {
      return <FileVideo className="h-8 w-8 text-red-500" />;
    } else if (
      mimeType === "application/pdf" ||
      mimeType.includes("text/") ||
      mimeType.includes("document")
    ) {
      return <FileText className="h-8 w-8 text-orange-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  // Renderizar la lista de archivos
  const renderFiles = () => {
    if (files.length === 0) {
      return null;
    }

    return (
      <div className="mt-4 space-y-2">
        <h3 className="text-sm font-medium">Archivos seleccionados</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center space-x-3 p-2 border rounded-md bg-background"
            >
              <div className="flex-shrink-0">
                {file.preview ? (
                  <div className="h-12 w-12 rounded overflow-hidden">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 flex items-center justify-center">
                    {getFileIcon(file.type)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                {file.status === "uploading" && (
                  <Progress value={file.progress} className="h-1 mt-1" />
                )}
                {file.status === "error" && (
                  <p className="text-xs text-destructive flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {file.error || "Error al subir el archivo"}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                {file.status === "success" ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : file.status === "error" ? (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-1">
          Arrastra archivos aquí o haz clic para seleccionar
        </p>
        <p className="text-xs text-muted-foreground">
          Imágenes, videos, documentos y otros archivos (máx. 100MB)
        </p>
      </div>

      {renderFiles()}

      {files.length > 0 && (
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="category">Categoría (opcional)</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin categoría</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={uploadAllFiles}
              disabled={isUploading || files.length === 0}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              <span>
                {isUploading ? "Subiendo..." : "Subir archivos"}
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;