export interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "primary" | "warning" | "success" | "error" | "info";
  footer?: React.ReactNode;
  progressValue?: number;
}

export interface ControlItem {
  id: number;
  name: string;
  type: "checklist" | "form";
  responsible: string;
  time: string;
  status: "completed" | "pending" | "delayed" | "scheduled";
}

export interface ActivityItem {
  id: number;
  type: "check" | "warning" | "edit" | "create";
  userName: string;
  action: string;
  target: string;
  time: string;
}

export interface TemplateItem {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: "primary" | "secondary" | "accent";
}

export interface CompanyLocation {
  id: number;
  name: string;
}

export interface UserProfile {
  id: number;
  name: string;
  role: string;
}

export interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  isActive: boolean;
  children?: NavigationItem[];
}
