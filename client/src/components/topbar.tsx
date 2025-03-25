import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title: string;
  onMenuToggle: () => void;
  tabs?: { id: string; label: string; path: string }[];
}

export default function TopBar({ title, onMenuToggle, tabs = [] }: TopBarProps) {
  const [location] = useLocation();
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex justify-between items-center py-3 px-4 border-b border-neutral-100">
        {/* Left: Menu Toggle + Current Module */}
        <div className="flex items-center">
          <button onClick={onMenuToggle} className="lg:hidden mr-4 text-neutral-500">
            <i className="fas fa-bars"></i>
          </button>
          <h1 className="text-lg font-semibold text-neutral-800">{title}</h1>
        </div>
        
        {/* Right: Search, Notifications, User Profile */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:block relative">
            <Input 
              type="text" 
              placeholder="Buscar..." 
              className="pl-9 w-56"
            />
            <i className="fas fa-search absolute left-3 top-2.5 text-neutral-400"></i>
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <i className="fas fa-bell text-neutral-500"></i>
            <span className="absolute top-0 right-0 h-4 w-4 bg-accent rounded-full text-white text-xs flex items-center justify-center">3</span>
          </Button>
          
          {/* Help */}
          <Button variant="ghost" size="icon">
            <i className="fas fa-question-circle text-neutral-500"></i>
          </Button>
        </div>
      </div>
      
      {/* Module Sub-Navigation */}
      {tabs.length > 0 && (
        <div className="px-4 py-2 bg-white border-b border-neutral-100 flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <Link key={tab.id} href={tab.path}>
              <a className={cn(
                "mr-4 py-2 text-sm",
                location === tab.path
                  ? "border-b-2 border-primary text-primary font-medium"
                  : "text-neutral-500 hover:text-neutral-700"
              )}>
                {tab.label}
              </a>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
