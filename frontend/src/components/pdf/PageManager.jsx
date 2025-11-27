import React, { useState } from 'react';
import { FileText, Trash2, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export const PageManager = ({ files, onDeletePages, disabled }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPages, setSelectedPages] = useState([]);

  const currentFile = files.find(f => f.id === selectedFile);
  
  // Log when files change
  React.useEffect(() => {
    if (currentFile) {
      console.log(`PageManager - Current file updated: ${currentFile.name}, pages: ${currentFile.pages}`);
    }
  }, [files, currentFile]);

  const handlePageToggle = (pageIndex) => {
    setSelectedPages(prev => {
      if (prev.includes(pageIndex)) {
        return prev.filter(p => p !== pageIndex);
      }
      return [...prev, pageIndex];
    });
  };

  const handleSelectAll = () => {
    if (!currentFile) return;
    if (selectedPages.length === currentFile.pages) {
      setSelectedPages([]);
    } else {
      setSelectedPages(Array.from({ length: currentFile.pages }, (_, i) => i));
    }
  };

  const handleDeletePages = () => {
    if (selectedPages.length === 0) {
      toast.error('Please select pages to delete');
      return;
    }

    if (currentFile && selectedPages.length === currentFile.pages) {
      toast.error('Cannot delete all pages. Please keep at least one page.');
      return;
    }

    onDeletePages(selectedFile, selectedPages);
    setSelectedPages([]);
  };

  return (
    <div className="space-y-6">
      {/* File Selector */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-medium min-w-fit">Select PDF:</label>
          <Select value={selectedFile?.toString()} onValueChange={(val) => {
            setSelectedFile(Number(val));
            setSelectedPages([]);
          }}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Choose a PDF file" />
            </SelectTrigger>
            <SelectContent>
              {files.map(file => (
                <SelectItem key={file.id} value={file.id.toString()}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="truncate">{file.name}</span>
                    {file.pages && (
                      <Badge variant="secondary" className="text-xs ml-auto">
                        {file.pages} pages
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Page Grid */}
      {currentFile && currentFile.pages && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Page Selection</h3>
              <p className="text-sm text-muted-foreground">
                {selectedPages.length} of {currentFile.pages} pages selected
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={disabled}
              >
                {selectedPages.length === currentFile.pages ? 'Deselect All' : 'Select All'}
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeletePages}
                disabled={disabled || selectedPages.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {Array.from({ length: currentFile.pages }, (_, i) => (
              <div
                key={i}
                onClick={() => handlePageToggle(i)}
                className={`relative cursor-pointer group ${
                  selectedPages.includes(i)
                    ? 'ring-2 ring-destructive'
                    : 'ring-1 ring-border hover:ring-primary'
                } rounded-lg transition-all hover-lift`}
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 rounded-lg p-3 flex flex-col items-center justify-center">
                  <FileText className={`h-6 w-6 mb-2 ${
                    selectedPages.includes(i) ? 'text-destructive' : 'text-muted-foreground group-hover:text-primary'
                  } transition-colors`} />
                  <span className={`text-xs font-medium ${
                    selectedPages.includes(i) ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {i + 1}
                  </span>
                </div>
                
                <div className="absolute top-2 right-2">
                  <Checkbox
                    checked={selectedPages.includes(i)}
                    className={`bg-card border-2 ${
                      selectedPages.includes(i)
                        ? 'border-destructive data-[state=checked]:bg-destructive'
                        : 'border-border'
                    }`}
                  />
                </div>
                
                {selectedPages.includes(i) && (
                  <div className="absolute inset-0 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!currentFile && (
        <Card className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Select a PDF to manage pages</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Choose a PDF file from the dropdown above to view and delete individual pages
          </p>
        </Card>
      )}
    </div>
  );
};

export default PageManager;