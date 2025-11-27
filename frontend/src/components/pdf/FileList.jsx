import React from 'react';
import FileCard from '@/components/pdf/FileCard';

export const FileList = ({ files, selectedFiles, onFileSelect, onFileDelete, onCompress, disabled }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          selected={selectedFiles.includes(file.id)}
          onSelect={onFileSelect}
          onDelete={onFileDelete}
          onCompress={onCompress}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default FileList;