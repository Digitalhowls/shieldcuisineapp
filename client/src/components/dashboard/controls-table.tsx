import { Button } from "@/components/ui/button";
import { ControlItem } from "@/types";
import { cn } from "@/lib/utils";

interface ControlsTableProps {
  controls: ControlItem[];
  onView: (id: number) => void;
  onPerform: (id: number) => void;
}

export default function ControlsTable({ controls, onView, onPerform }: ControlsTableProps) {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-success bg-opacity-10 text-success";
      case 'pending':
        return "bg-warning bg-opacity-10 text-warning";
      case 'delayed':
        return "bg-error bg-opacity-10 text-error";
      case 'scheduled':
        return "bg-neutral-100 text-neutral-600";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return "Completado";
      case 'pending':
        return "Pendiente";
      case 'delayed':
        return "Retrasado";
      case 'scheduled':
        return "Programado";
      default:
        return "Desconocido";
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-100">
        <thead className="bg-neutral-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Control</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Tipo</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Responsable</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Hora</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Estado</th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-100">
          {controls.map((control) => (
            <tr key={control.id} className="hover:bg-neutral-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm font-medium text-neutral-800">{control.name}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm text-neutral-600">{control.type === 'checklist' ? 'Checklist' : 'Formulario'}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm text-neutral-600">{control.responsible}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm text-neutral-600">{control.time}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={cn(
                  "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                  getStatusBadgeClass(control.status)
                )}>
                  {getStatusLabel(control.status)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                {control.status === 'completed' ? (
                  <Button variant="link" onClick={() => onView(control.id)}>Ver</Button>
                ) : (
                  <Button 
                    variant="link" 
                    onClick={() => onPerform(control.id)}
                    disabled={control.status === 'scheduled'}
                    className={control.status === 'scheduled' ? "text-neutral-400 cursor-not-allowed" : ""}
                  >
                    Realizar
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
