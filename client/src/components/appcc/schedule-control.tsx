import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { format, addDays, addWeeks, addMonths, setHours, setMinutes } from "date-fns";
import { Calendar as CalendarIcon, Clock, Users, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { es } from "date-fns/locale";

interface ControlTemplate {
  id: number;
  name: string;
  description?: string;
  type: "checklist" | "form";
  frequency: string;
  formStructure: string;
  requiredRole?: string;
  locationId?: number;
  companyId: number;
  active: boolean;
}

interface Location {
  id: number;
  name: string;
  address?: string;
}

interface User {
  id: number;
  name: string;
  role: string;
}

interface ScheduleControlProps {
  template: ControlTemplate;
  locations: Location[];
  users: User[];
  onSchedule: (data: ScheduleData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface TimeSlot {
  hour: number;
  minute: number;
  display: string;
}

export interface ScheduleData {
  templateId: number;
  locationId: number;
  assignedToId?: number;
  scheduledFor: string;
  notes?: string;
  recurrence?: {
    type: "none" | "daily" | "weekly" | "monthly";
    interval: number;
    endDate?: string;
    count?: number;
  };
}

// Time slots for scheduling (every 30 minutes)
const TIME_SLOTS: TimeSlot[] = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  return {
    hour,
    minute,
    display: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  };
});

export default function ScheduleControl({
  template,
  locations,
  users,
  onSchedule,
  onCancel,
  isLoading = false
}: ScheduleControlProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [timeSlot, setTimeSlot] = useState<string>(
    `${new Date().getHours().toString().padStart(2, '0')}:${Math.floor(new Date().getMinutes() / 30) * 30}`.padEnd(5, '0')
  );
  const [locationId, setLocationId] = useState<number>(
    template.locationId || (locations.length > 0 ? locations[0].id : 0)
  );
  const [assignedToId, setAssignedToId] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState<string>("");
  const [enableRecurrence, setEnableRecurrence] = useState<boolean>(false);
  const [recurrenceType, setRecurrenceType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1);
  const [recurrenceEndType, setRecurrenceEndType] = useState<"count" | "date">("count");
  const [recurrenceCount, setRecurrenceCount] = useState<number>(5);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(
    addMonths(new Date(), 1)
  );
  
  // Get the location name or "No seleccionado" if no location is selected
  const getLocationName = (id: number) => {
    const location = locations.find(loc => loc.id === id);
    return location ? location.name : "No seleccionado";
  };
  
  // Get the user name or "Sin asignar" if no user is assigned
  const getUserName = (id: number | undefined) => {
    if (!id) return "Sin asignar";
    const user = users.find(u => u.id === id);
    return user ? user.name : "Usuario desconocido";
  };
  
  // Convert hour and minute to a time string (HH:MM)
  const formatTimeSlot = (slot: string): string => {
    return slot;
  };
  
  // Validate schedule data before submitting
  const validateScheduleData = (): boolean => {
    // Validate location
    if (!locationId) {
      toast({
        title: "Error",
        description: "Debe seleccionar una ubicación",
        variant: "destructive"
      });
      return false;
    }
    
    // Make sure date is not in the past
    const now = new Date();
    const selectedDateTime = combineDateTime(date, timeSlot);
    if (selectedDateTime < now) {
      toast({
        title: "Error",
        description: "La fecha y hora seleccionadas no pueden estar en el pasado",
        variant: "destructive"
      });
      return false;
    }
    
    // Validate recurrence settings
    if (enableRecurrence) {
      if (recurrenceInterval <= 0) {
        toast({
          title: "Error",
          description: "El intervalo de repetición debe ser mayor a 0",
          variant: "destructive"
        });
        return false;
      }
      
      if (recurrenceEndType === "count" && (recurrenceCount <= 0 || recurrenceCount > 100)) {
        toast({
          title: "Error",
          description: "El número de repeticiones debe estar entre 1 y 100",
          variant: "destructive"
        });
        return false;
      }
      
      if (recurrenceEndType === "date" && (!recurrenceEndDate || recurrenceEndDate < now)) {
        toast({
          title: "Error",
          description: "La fecha final de recurrencia no puede estar en el pasado",
          variant: "destructive"
        });
        return false;
      }
    }
    
    return true;
  };
  
  // Combine date and time into a single Date object
  const combineDateTime = (date: Date, timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return setMinutes(setHours(new Date(date), hours), minutes);
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!validateScheduleData()) return;
    
    const scheduledDateTime = combineDateTime(date, timeSlot);
    
    const scheduleData: ScheduleData = {
      templateId: template.id,
      locationId,
      assignedToId: assignedToId !== 0 ? assignedToId : undefined,
      scheduledFor: scheduledDateTime.toISOString(),
      notes: notes || undefined
    };
    
    if (enableRecurrence) {
      scheduleData.recurrence = {
        type: recurrenceType,
        interval: recurrenceInterval,
      };
      
      if (recurrenceEndType === "count") {
        scheduleData.recurrence.count = recurrenceCount;
      } else if (recurrenceEndType === "date" && recurrenceEndDate) {
        scheduleData.recurrence.endDate = recurrenceEndDate.toISOString();
      }
    }
    
    onSchedule(scheduleData);
  };
  
  return (
    <Card className="max-w-3xl w-full">
      <CardHeader className="border-b">
        <div className="flex flex-col space-y-1.5">
          <CardTitle>Programar Control</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-primary bg-opacity-10 text-primary border-primary">
              {template.name}
            </Badge>
            <Badge variant="outline" className="bg-secondary bg-opacity-10 text-secondary border-secondary">
              {template.type === "checklist" ? "Checklist" : "Formulario"}
            </Badge>
            <Badge variant="outline" className="bg-neutral-200 text-neutral-600">
              {template.frequency}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        {/* Description if available */}
        {template.description && (
          <Alert variant="default" className="bg-neutral-50 text-neutral-700 border-neutral-200">
            <AlertCircle className="h-4 w-4 text-neutral-500" />
            <AlertDescription>
              {template.description}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="schedule-date" className="text-sm font-medium">
              Fecha <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="schedule-date"
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${!date && "text-neutral-400"}`}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "d 'de' MMMM, yyyy", { locale: es }) : "Seleccione una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => setDate(newDate || new Date())}
                  initialFocus
                  disabled={isLoading}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="schedule-time" className="text-sm font-medium">
              Hora <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={timeSlot} 
              onValueChange={setTimeSlot}
              disabled={isLoading}
            >
              <SelectTrigger id="schedule-time" className="w-full">
                <SelectValue placeholder="Seleccione una hora">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-neutral-500" />
                    {formatTimeSlot(timeSlot)}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot.display} value={slot.display}>
                    {slot.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Location and Assigned To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="schedule-location" className="text-sm font-medium">
              Ubicación <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={locationId.toString()} 
              onValueChange={(value) => setLocationId(parseInt(value))}
              disabled={isLoading || template.locationId !== undefined}
            >
              <SelectTrigger id="schedule-location" className="w-full">
                <SelectValue placeholder="Seleccione una ubicación">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-neutral-500" />
                    {getLocationName(locationId)}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="schedule-assigned" className="text-sm font-medium">
              Asignado a
            </Label>
            <Select 
              value={assignedToId?.toString() || ""} 
              onValueChange={(value) => setAssignedToId(value ? parseInt(value) : undefined)}
              disabled={isLoading}
            >
              <SelectTrigger id="schedule-assigned" className="w-full">
                <SelectValue placeholder="Sin asignar">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-neutral-500" />
                    {getUserName(assignedToId)}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin asignar</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="schedule-notes" className="text-sm font-medium">
            Notas
          </Label>
          <Textarea
            id="schedule-notes"
            placeholder="Añada notas adicionales para este control"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            disabled={isLoading}
          />
        </div>
        
        {/* Recurrence Settings */}
        <div className="space-y-3 border rounded-md p-3 bg-neutral-50">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-recurrence" className="text-sm font-medium">
                Programación recurrente
              </Label>
              <p className="text-xs text-neutral-500">
                Configure este control para repetirse automáticamente
              </p>
            </div>
            <Switch
              id="enable-recurrence"
              checked={enableRecurrence}
              onCheckedChange={setEnableRecurrence}
              disabled={isLoading}
            />
          </div>
          
          {enableRecurrence && (
            <div className="space-y-4 mt-4 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recurrence-type" className="text-sm font-medium">
                    Repetir
                  </Label>
                  <Select 
                    value={recurrenceType} 
                    onValueChange={(value) => setRecurrenceType(value as any)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="recurrence-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diariamente</SelectItem>
                      <SelectItem value="weekly">Semanalmente</SelectItem>
                      <SelectItem value="monthly">Mensualmente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recurrence-interval" className="text-sm font-medium">
                    Cada
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="recurrence-interval"
                      type="number"
                      min={1}
                      max={99}
                      value={recurrenceInterval}
                      onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                      className="w-20"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-neutral-600">
                      {recurrenceType === "daily" ? "día(s)" : 
                       recurrenceType === "weekly" ? "semana(s)" : "mes(es)"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Finalizar
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="end-after"
                      checked={recurrenceEndType === "count"}
                      onChange={() => setRecurrenceEndType("count")}
                      className="h-4 w-4"
                      disabled={isLoading}
                    />
                    <Label htmlFor="end-after" className="text-sm">
                      Después de
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={recurrenceCount}
                      onChange={(e) => setRecurrenceCount(parseInt(e.target.value) || 1)}
                      className="w-20 h-8"
                      disabled={isLoading || recurrenceEndType !== "count"}
                    />
                    <span className="text-sm text-neutral-600">repetición(es)</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="end-on"
                      checked={recurrenceEndType === "date"}
                      onChange={() => setRecurrenceEndType("date")}
                      className="h-4 w-4"
                      disabled={isLoading}
                    />
                    <Label htmlFor="end-on" className="text-sm">
                      El día
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`h-8 ${!recurrenceEndDate && "text-neutral-400"}`}
                          disabled={isLoading || recurrenceEndType !== "date"}
                        >
                          {recurrenceEndDate ? 
                            format(recurrenceEndDate, "d 'de' MMMM, yyyy", { locale: es }) : 
                            "Seleccione una fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={recurrenceEndDate}
                          onSelect={(newDate) => setRecurrenceEndDate(newDate || undefined)}
                          initialFocus
                          disabled={(date) => date < new Date()}
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              
              {/* Preview of recurrence */}
              <div className="bg-white border rounded p-3 text-sm text-neutral-600">
                <p className="font-medium mb-1">Vista previa:</p>
                <p>
                  Este control se programará para el {format(date, "d 'de' MMMM, yyyy", { locale: es })} a las {formatTimeSlot(timeSlot)} 
                  y se repetirá cada {recurrenceInterval} {recurrenceType === "daily" ? "día(s)" : 
                                             recurrenceType === "weekly" ? "semana(s)" : "mes(es)"}
                  {recurrenceEndType === "count" 
                    ? `, ${recurrenceCount} ${recurrenceCount === 1 ? "vez" : "veces"} en total.`
                    : recurrenceEndDate 
                      ? ` hasta el ${format(recurrenceEndDate, "d 'de' MMMM, yyyy", { locale: es })}.`
                      : "."}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t flex justify-end space-x-3 p-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Programando...
            </>
          ) : (
            "Programar Control"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}