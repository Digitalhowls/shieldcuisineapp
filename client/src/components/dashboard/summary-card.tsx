import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SummaryCardProps } from "@/types";

export default function SummaryCard({ title, value, icon, color, footer, progressValue }: SummaryCardProps) {
  const colorClasses = {
    primary: {
      border: "border-primary",
      iconBg: "bg-primary-light bg-opacity-10",
      iconText: "text-primary",
      progressBar: "bg-primary"
    },
    warning: {
      border: "border-warning",
      iconBg: "bg-warning bg-opacity-10",
      iconText: "text-warning",
      progressBar: "bg-warning"
    },
    success: {
      border: "border-success",
      iconBg: "bg-success bg-opacity-10",
      iconText: "text-success",
      progressBar: "bg-success"
    },
    error: {
      border: "border-error",
      iconBg: "bg-error bg-opacity-10",
      iconText: "text-error",
      progressBar: "bg-error"
    },
    info: {
      border: "border-info",
      iconBg: "bg-info bg-opacity-10",
      iconText: "text-info", 
      progressBar: "bg-info"
    }
  };
  
  const classes = colorClasses[color];
  
  return (
    <Card className={cn("p-4 border-l-4", classes.border)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="text-2xl font-bold text-neutral-800 mt-1">{value}</p>
        </div>
        <div className={cn("p-2 rounded-md", classes.iconBg)}>
          <i className={cn(icon, classes.iconText)}></i>
        </div>
      </div>
      
      {progressValue !== undefined && (
        <div className="mt-3 flex justify-between items-center">
          <div className="bg-neutral-100 w-full rounded-full h-2">
            <div className={cn("h-2 rounded-full", classes.progressBar)} style={{ width: `${progressValue}%` }}></div>
          </div>
          <span className="ml-3 text-xs font-medium text-neutral-500">{progressValue}%</span>
        </div>
      )}
      
      {footer && (
        <div className="mt-3">
          {footer}
        </div>
      )}
    </Card>
  );
}
