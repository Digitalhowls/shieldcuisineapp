import React, { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UploadCloud,
  X,
  AlertCircle,
  Check,
  Loader2,
  Image,
  FileVideo,
  FileText,
  File
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

interface MediaUploaderProps {
  onUploadComplete: () => void;
  categories?: MediaCategory[];
  maxFiles?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  progress: number;
  error?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onUploadComplete,
  categories = [],
  maxFiles = 10,
  maxSizeMB = 10,
  allowedTypes = ["image/*", "video/*", "application/pdf", "application/zip", "text/plain"],
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > maxFiles) {
      toast({
        title: "Demasiados archivos",
        description: `No puedes subir más de ${maxFiles} archivos a la vez`,
        variant: "destructive",
      });
      return;
    }

    const validatedFiles = newFiles.map((file) => {
      // Validar tipo de archivo
      const isValidType = allowedTypes.some((type) => {
        if (type.endsWith('/*')) {
          const mainType = type.split('/')[0];
          return file.type.startsWith(`${mainType}/`);
        }
        return file.type === type;
      });

      // Validar tamaño
      const isValidSize = file.size <= maxSizeBytes;

      const fileWithPreview = {
        ...file,
        id: crypto.randomUUID(),
        progress: 0,
        status: 'pending' as const,
      };

      if (!isValidType) {
        fileWithPreview.error = "Tipo de archivo no permitido";
        fileWithPreview.status = "error";
      } else if (!isValidSize) {
        fileWithPreview.error = `El archivo excede el tamaño máximo de ${maxSizeMB}MB`;
        fileWithPreview.status = "error";
      }

      // Generar vista previa para imágenes
      if (file.type.startsWith("image/")) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }

      return fileWithPreview;
    });

    setFiles((prev) => [...prev, ...validatedFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const newFiles = prev.filter((f) => f.id !== id);
      const fileToRemove = prev.find((f) => f.id === id);
      
      // Revocar URL de vista previa
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    const filesToUpload = files.filter((f) => f.status === "pending");
    if (filesToUpload.length === 0) return;
    
    setUploading(true);
    
    let hasError = false;
    
    // Crear una copia para actualizar el progreso
    const updatedFiles = [...files];
    
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("companyId", user?.companyId?.toString() || "");
      
      if (selectedCategories.length > 0) {
        selectedCategories.forEach(categoryId => {
          formData.append("categories[]", categoryId.toString());
        });
      }
      
      try {
        // Actualizar estado a 'uploading'
        const fileIndex = updatedFiles.findIndex((f) => f.id === file.id);
        updatedFiles[fileIndex].status = "uploading";
        setFiles([...updatedFiles]);
        
        const response = await fetch("/api/cms/media/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error("Error al subir el archivo");
        }
        
        // Actualizar estado a 'success'
        updatedFiles[fileIndex].status = "success";
        updatedFiles[fileIndex].progress = 100;
        setFiles([...updatedFiles]);
        
      } catch (error) {
        hasError = true;
        
        // Actualizar estado a 'error'
        const fileIndex = updatedFiles.findIndex((f) => f.id === file.id);
        updatedFiles[fileIndex].status = "error";
        updatedFiles[fileIndex].error = error instanceof Error ? error.message : "Error desconocido";
        setFiles([...updatedFiles]);
        
        toast({
          title: "Error",
          description: `No se pudo subir el archivo ${file.name}`,
          variant: "destructive",
        });
      }
    }
    
    setUploading(false);
    
    if (!hasError) {
      toast({
        title: "Subida completada",
        description: `Se han subido ${filesToUpload.length} archivo(s) correctamente`,
      });
      onUploadComplete();
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    const id = parseInt(categoryId);
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter(c => c !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Renderizar estado de cada archivo
  const renderFileStatus = (file: FileWithPreview) => {
    switch (file.status) {
      case "uploading":
        return (
          <div className="flex items-center text-primary">
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
            <span className="text-xs">Subiendo</span>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center text-green-600">
            <Check className="h-4 w-4 mr-1" />
            <span className="text-xs">Completado</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="text-xs">Error</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-muted-foreground">
            <span className="text-xs">Pendiente</span>
          </div>
        );
    }
  };

  // Renderizar icono según tipo de archivo
  const renderFileIcon = (file: FileWithPreview) => {
    if (file.type.startsWith("image/")) {
      return file.preview ? (
        <img
          src={file.preview}
          alt={file.name}
          className="h-10 w-10 object-cover rounded"
        />
      ) : (
        <Image className="h-8 w-8 text-blue-500" />
      );
    } else if (file.type.startsWith("video/")) {
      return <FileVideo className="h-8 w-8 text-red-500" />;
    } else if (file.type === "application/pdf" || file.type.includes("text/")) {
      return <FileText className="h-8 w-8 text-orange-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Área de arrastrar y soltar */}
      <div
        className={`border-2 border-dashed rounded-md ${
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        } transition-colors duration-200 py-8 flex flex-col items-center justify-center`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <UploadCloud
          className={`h-10 w-10 mb-2 ${
            dragActive ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <p className="text-sm font-medium mb-1">
          Arrastra archivos aquí o haz clic para seleccionar
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Subir hasta {maxFiles} archivos (máx. {maxSizeMB}MB cada uno)
        </p>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="sm"
          disabled={uploading}
        >
          Seleccionar archivos
        </Button>
        <Input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          onClick={clearFileInput}
          className="hidden"
          disabled={uploading}
          accept={allowedTypes.join(",")}
        />
      </div>

      {/* Lista de archivos seleccionados */}
      {files.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Archivos seleccionados ({files.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {files.map((file) => (
                <li key={file.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    {renderFileIcon(file)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate" title={file.name}>
                        {file.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        {renderFileStatus(file)}
                      </div>
                      {file.status === "uploading" && (
                        <Progress
                          value={file.progress}
                          className="h-1 mt-1"
                        />
                      )}
                      {file.error && (
                        <p className="text-xs text-red-600 mt-1">
                          {file.error}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={file.status === "uploading"}
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex justify-between pt-4">
            <div className="flex flex-col space-y-2">
              {categories.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="categories">Categorías</Label>
                  <Select onValueChange={handleSelectCategory}>
                    <SelectTrigger className="w-60">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedCategories.map((categoryId) => {
                        const category = categories.find(c => c.id === categoryId);
                        return category ? (
                          <Badge key={category.id} variant="secondary" className="flex items-center gap-1">
                            {category.name}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0"
                              onClick={() => setSelectedCategories(selectedCategories.filter(id => id !== categoryId))}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiles([])}
                disabled={uploading}
              >
                Limpiar todo
              </Button>
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={uploading || files.every(f => f.status !== "pending")}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Subir {files.filter(f => f.status === "pending").length} archivo(s)
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default MediaUploader;