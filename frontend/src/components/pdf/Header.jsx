import React from 'react';
import { FileText, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-md opacity-50"></div>
            <div className="relative bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PDF Manager Pro
            </h1>
            <p className="text-xs text-muted-foreground">Compress • Merge • Manage</p>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" className="rounded-full" asChild>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <Github className="h-5 w-5" />
          </a>
        </Button>
      </div>
    </header>
  );
};

export default Header;