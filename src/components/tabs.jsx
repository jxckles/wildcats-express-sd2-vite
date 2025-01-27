// src/components/ui/tabs.jsx
import React from 'react';

export function Tabs({ value, onValueChange, children, className }) {
  return (
    <div className={className}>
      {React.Children.map(children, child => {
        return React.cloneElement(child, { value, onValueChange });
      })}
    </div>
  );
}

export function TabsList({ children, className }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className, onClick }) {
  return (
    <button
      className={className}
      onClick={() => onClick?.(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, activeValue, children, className }) {
  if (value !== activeValue) return null;
  
  return (
    <div className={className}>
      {children}
    </div>
  );
}