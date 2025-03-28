import React, { useState, useRef, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
} from "lucide-react";
import { FixedSizeList as List } from "react-window";

// Umbral para activar la virtualización
const VIRTUALIZATION_THRESHOLD = 50; 
// Altura por defecto de cada fila
const ROW_HEIGHT = 48; 

interface DataTableProps<TData> {
  columns: {
    header: string;
    accessorKey: string;
    cell?: (props: { row: { original: TData } }) => React.ReactNode;
  }[];
  data: TData[];
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  virtualizationThreshold?: number;
  rowHeight?: number;
}

export function DataTable<TData>({
  columns,
  data,
  pageSize = 10,
  onRowClick,
  virtualizationThreshold = VIRTUALIZATION_THRESHOLD,
  rowHeight = ROW_HEIGHT,
}: DataTableProps<TData>) {
  const [currentPage, setCurrentPage] = useState(0);
  const [tableHeight, setTableHeight] = useState(400);
  const tableBodyRef = useRef<HTMLDivElement>(null);
  
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);
  const currentData = data.slice(startIndex, endIndex);
  
  const canPreviousPage = currentPage > 0;
  const canNextPage = currentPage < totalPages - 1;
  
  // Determinar si debemos usar virtualización
  const useVirtualization = data.length > virtualizationThreshold;

  // Medir el contenedor para ajustar la altura de la lista virtualizada
  useEffect(() => {
    if (tableBodyRef.current && useVirtualization) {
      const updateHeight = () => {
        const tableBounds = tableBodyRef.current?.getBoundingClientRect();
        if (tableBounds) {
          // Limitar la altura máxima para evitar que se extienda demasiado
          // y usar al menos suficiente espacio para mostrar 10 filas
          const calculatedHeight = Math.min(
            Math.max(rowHeight * 10, window.innerHeight * 0.5),
            currentData.length * rowHeight
          );
          setTableHeight(calculatedHeight);
        }
      };
      
      updateHeight();
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }
  }, [currentData.length, rowHeight, useVirtualization]);
  
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  };
  
  const previousPage = () => {
    if (canPreviousPage) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const nextPage = () => {
    if (canNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Renderizador de filas para la lista virtualizada
  const VirtualRow = React.memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = currentData[index];
    return (
      <div 
        style={style} 
        className={`flex ${onRowClick ? "cursor-pointer hover:bg-muted" : ""} border-b border-border`}
        onClick={onRowClick ? () => onRowClick(row) : undefined}
      >
        {columns.map((column, cellIndex) => (
          <div 
            key={cellIndex} 
            className="p-4 flex-1 truncate"
            style={{ flex: `1 1 ${100 / columns.length}%` }}
          >
            {column.cell 
              ? column.cell({ row: { original: row } }) 
              : (row as any)[column.accessorKey]}
          </div>
        ))}
      </div>
    );
  });

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          
          {/* Contenedor del cuerpo de la tabla */}
          <div ref={tableBodyRef}>
            {!useVirtualization ? (
              <TableBody>
                {currentData.length > 0 ? (
                  currentData.map((row, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      className={onRowClick ? "cursor-pointer hover:bg-muted" : undefined}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                    >
                      {columns.map((column, cellIndex) => (
                        <TableCell key={cellIndex}>
                          {column.cell 
                            ? column.cell({ row: { original: row } }) 
                            : (row as any)[column.accessorKey]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No hay resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            ) : (
              <div className="virtualizedTableBody">
                {currentData.length > 0 ? (
                  <List
                    height={tableHeight}
                    width="100%"
                    itemCount={currentData.length}
                    itemSize={rowHeight}
                    overscanCount={5}
                  >
                    {VirtualRow}
                  </List>
                ) : (
                  <div className="h-24 text-center flex items-center justify-center">
                    No hay resultados.
                  </div>
                )}
              </div>
            )}
          </div>
        </Table>
      </div>

      {data.length > pageSize && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {endIndex} de {data.length} resultados
          </div>
          <div className="space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(0)}
              disabled={!canPreviousPage}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={!canPreviousPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={!canNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(totalPages - 1)}
              disabled={!canNextPage}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}