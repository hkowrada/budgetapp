import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const FileUploadZone = ({ onFilesAdded, disabled }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (disabled) return;
    onFilesAdded(acceptedFiles);
  }, [onFilesAdded, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    disabled
  });

  return (
    <Card
      {...getRootProps()}
      className={`mb-8 border-2 border-dashed cursor-pointer hover-lift ${
        isDragActive
          ? 'border-primary bg-primary/5 processing'
          : 'border-border bg-card hover:border-primary/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            {isDragActive ? (
              <div className="p-4 rounded-full bg-primary/10 animate-pulse">
                <FileText className="h-12 w-12 text-primary" />
              </div>
            ) : (
              <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10">
                <Upload className="h-12 w-12 text-primary" />
              </div>
            )}
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">
          {isDragActive ? 'Drop your PDFs here' : 'Upload PDF Files'}
        </h3>
        
        <p className="text-muted-foreground mb-4">
          Drag and drop your PDF files here, or click to browse
        </p>
        
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success"></div>
            <span>PDF files only</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span>Multiple files supported</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FileUploadZone;