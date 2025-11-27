import React from 'react';
import { FileText, Trash2, Minimize2, FileCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const FileCard = ({ file, selected, onSelect, onDelete, onCompress, disabled }) => {
  return (
    <Card 
      className={`file-card-enter hover-lift overflow-hidden transition-all ${
        selected ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="mt-1">
            <Checkbox
              checked={selected}
              onCheckedChange={() => onSelect(file.id)}
              disabled={disabled}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              {selected && (
                <Badge variant="default" className="text-xs">
                  Selected
                </Badge>
              )}
              {file.modified && (
                <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">
                  Modified
                </Badge>
              )}
            </div>
            
            <h3 className="font-medium text-sm truncate mb-1" title={file.name}>
              {file.name}
            </h3>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{formatFileSize(file.size)}</span>
              {file.pages !== null && (
                <>
                  <span className="text-muted">•</span>
                  <span className="flex items-center gap-1">
                    <FileCheck className="h-3 w-3" />
                    {file.pages} pages
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCompress(file.id)}
            disabled={disabled}
            className="flex-1 hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
          >
            <Minimize2 className="h-4 w-4 mr-1.5" />
            Compress
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(file.id)}
            disabled={disabled}
            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FileCard;