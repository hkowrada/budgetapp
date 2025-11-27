import React from 'react';
import { Merge, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ActionPanel = ({ selectedCount, totalFiles, onMerge, onClearAll, disabled }) => {
  return (
    <Card className="mb-6 bg-gradient-to-r from-card to-card/50 border-primary/20">
      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-base px-3 py-1.5">
            {selectedCount} / {totalFiles} selected
          </Badge>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Select files to merge them together
          </p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={onMerge}
            disabled={selectedCount < 2 || disabled}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
          >
            <Merge className="h-4 w-4 mr-2" />
            Merge Selected
          </Button>
          
          <Button
            onClick={onClearAll}
            variant="outline"
            disabled={disabled}
            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ActionPanel;