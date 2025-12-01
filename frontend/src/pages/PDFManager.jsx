import React, { useState } from 'react';
import { FileText, Merge, Minimize2, Trash2, Download } from 'lucide-react';
import Header from '@/components/pdf/Header';
import FileUploadZone from '@/components/pdf/FileUploadZone';
import FileList from '@/components/pdf/FileList';
import ActionPanel from '@/components/pdf/ActionPanel';
import PageManager from '@/components/pdf/PageManager';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

export default function PDFManager() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('files');
  const [processing, setProcessing] = useState(false);

  const handleFilesAdded = (newFiles) => {
    const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      toast.error('Please upload PDF files only');
      return;
    }

    const filesWithId = pdfFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: file.size,
      pages: null,
      selected: false
    }));

    setFiles(prev => [...prev, ...filesWithId]);
    toast.success(`${pdfFiles.length} file(s) added successfully`);

    // Load PDF pages info
    filesWithId.forEach(loadPDFPages);
  };

  const loadPDFPages = async (fileObj) => {
    try {
      // Don't reload if file already has pages (might be modified)
      if (fileObj.pages !== null && fileObj.pages !== undefined) {
        console.log(`Skipping page load for ${fileObj.name} - already loaded with ${fileObj.pages} pages`);
        return;
      }
      
      const arrayBuffer = await fileObj.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id 
          ? { ...f, pages: pageCount }
          : f
      ));
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error(`Failed to load ${fileObj.name}`);
    }
  };

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      }
      return [...prev, fileId];
    });
  };

  const handleFileDelete = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
    toast.success('File removed');
  };

  const handleMergePDFs = async () => {
    console.log('Merge button clicked!');
    console.log('Selected files:', selectedFiles);
    console.log('Total files:', files);
    
    if (selectedFiles.length < 2) {
      toast.error('Please select at least 2 files to merge');
      console.log('Not enough files selected');
      return;
    }

    setProcessing(true);
    const toastId = toast.loading('Merging PDFs...');
    console.log('Starting PDF merge process...');

    try {
      const mergedPdf = await PDFDocument.create();
      console.log('Created new PDF document for merging');
      
      for (const fileId of selectedFiles) {
        const fileObj = files.find(f => f.id === fileId);
        console.log(`Processing file: ${fileObj.name}`);
        
        const arrayBuffer = await fileObj.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        console.log(`Loaded ${fileObj.name}, pages: ${pdf.getPageCount()}`);
        
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        console.log(`Added ${copiedPages.length} pages from ${fileObj.name}`);
      }

      console.log('Saving merged PDF...');
      const mergedPdfBytes = await mergedPdf.save();
      console.log(`Merged PDF size: ${mergedPdfBytes.length} bytes`);
      
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      saveAs(blob, `merged-${Date.now()}.pdf`);
      console.log('Download started');
      
      toast.dismiss(toastId);
      toast.success(`PDFs merged successfully! Total pages: ${mergedPdf.getPageCount()}`);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      console.error('Error details:', error.message, error.stack);
      toast.dismiss(toastId);
      toast.error(`Failed to merge PDFs: ${error.message}`);
    } finally {
      setProcessing(false);
      console.log('Merge process completed');
    }
  };

  const handleCompressPDF = async (fileId, compressionLevel = 'medium') => {
    console.log('Compress button clicked!');
    console.log('File ID:', fileId, 'Level:', compressionLevel);
    
    setProcessing(true);
    const toastId = toast.loading(`Compressing PDF (${compressionLevel.toUpperCase()})...`);
    console.log('Starting compression process...');

    try {
      const fileObj = files.find(f => f.id === fileId);
      const arrayBuffer = await fileObj.file.arrayBuffer();
      
      // Use ghostscript-like compression via pdf-lib with image extraction and recompression
      const originalSize = fileObj.size;
      let compressedPdfBytes;
      
      // Compression settings based on level
      const compressionSettings = {
        lite: { quality: 0.85, scale: 1.0, dpi: 150 },      // ~20-30% reduction
        medium: { quality: 0.70, scale: 0.9, dpi: 120 },    // ~40-60% reduction  
        heavy: { quality: 0.50, scale: 0.75, dpi: 90 }      // ~70-85% reduction
      };
      
      const settings = compressionSettings[compressionLevel] || compressionSettings.medium;
      
      console.log('Compression settings:', settings);
      toast.dismiss(toastId);
      toast.loading(`Analyzing PDF and compressing images (${compressionLevel.toUpperCase()})...`, { id: toastId });
      
      // Load PDF and compress
      compressedPdfBytes = await compressPDFWithImages(arrayBuffer, settings);
      
      const compressedSize = compressedPdfBytes.length;
      const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
      const savedKB = ((originalSize - compressedSize) / 1024).toFixed(1);
      const savedMB = ((originalSize - compressedSize) / (1024 * 1024)).toFixed(2);
      
      console.log(`Original: ${originalSize} bytes, Compressed: ${compressedSize} bytes`);
      console.log(`Savings: ${savings}% (${savedKB} KB / ${savedMB} MB)`);
      
      // Check if actually compressed
      if (compressedSize >= originalSize) {
        toast.dismiss(toastId);
        toast.warning('PDF is already highly optimized. Minimal compression possible.');
        
        // Still offer download
        const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
        saveAs(blob, `optimized-${fileObj.name}`);
      } else {
        const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
        saveAs(blob, `compressed-${compressionLevel}-${fileObj.name}`);
        
        toast.dismiss(toastId);
        
        let sizeDisplay = savedMB > 1 ? `${savedMB} MB` : `${savedKB} KB`;
        toast.success(`PDF compressed! Saved ${savings}% (${sizeDisplay}) - Level: ${compressionLevel.toUpperCase()}`, {
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error compressing PDF:', error);
      toast.dismiss(toastId);
      toast.error(`Failed to compress PDF: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Advanced compression function with image processing using PDF.js
  const compressPDFWithImages = async (arrayBuffer, settings) => {
    // Import pdf.js dynamically
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    // Load the PDF with pdf.js for rendering
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Create new compressed PDF
    const compressedPdf = await PDFDocument.create();
    
    console.log(`Processing ${pdf.numPages} pages with ${settings.quality * 100}% quality...`);
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`Rendering and compressing page ${pageNum}/${pdf.numPages}...`);
      
      try {
        // Get page from pdf.js
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: settings.dpi / 72 });
        
        // Apply scaling
        const scaledViewport = page.getViewport({ 
          scale: (settings.dpi / 72) * settings.scale 
        });
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        
        // Render PDF page to canvas
        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
        }).promise;
        
        // Convert canvas to compressed JPEG
        const imageBlob = await new Promise((resolve) => {
          canvas.toBlob(
            (blob) => resolve(blob),
            'image/jpeg',
            settings.quality
          );
        });
        
        if (imageBlob) {
          const imageBytes = await imageBlob.arrayBuffer();
          const image = await compressedPdf.embedJpg(imageBytes);
          
          // Add page with compressed image
          const newPage = compressedPdf.addPage([
            scaledViewport.width,
            scaledViewport.height
          ]);
          
          newPage.drawImage(image, {
            x: 0,
            y: 0,
            width: scaledViewport.width,
            height: scaledViewport.height,
          });
          
          console.log(`Page ${pageNum} compressed successfully`);
        } else {
          throw new Error('Failed to create image blob');
        }
      } catch (err) {
        console.warn(`Could not compress page ${pageNum}, using fallback:`, err);
        
        // Fallback: copy original page
        const originalPdf = await PDFDocument.load(arrayBuffer);
        const [copiedPage] = await compressedPdf.copyPages(originalPdf, [pageNum - 1]);
        compressedPdf.addPage(copiedPage);
      }
    }
    
    // Save with maximum compression
    const pdfBytes = await compressedPdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    });
    
    console.log(`Compression complete. Final size: ${pdfBytes.length} bytes`);
    return pdfBytes;
  };

  const handleDeletePages = async (fileId, pagesToDelete) => {
    console.log('Delete pages button clicked!');
    console.log('File ID:', fileId);
    console.log('Pages to delete:', pagesToDelete);
    
    setProcessing(true);
    const toastId = toast.loading('Removing pages...');
    console.log('Starting page deletion process...');

    try {
      const fileObj = files.find(f => f.id === fileId);
      console.log(`Processing file: ${fileObj.name}`);
      
      const arrayBuffer = await fileObj.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();
      console.log(`Total pages in PDF: ${totalPages}`);
      console.log(`Deleting ${pagesToDelete.length} pages`);
      
      // Remove pages in reverse order to maintain indices
      const sortedPages = [...pagesToDelete].sort((a, b) => b - a);
      console.log('Sorted pages for deletion:', sortedPages);
      
      sortedPages.forEach((pageIndex, index) => {
        console.log(`Removing page ${pageIndex + 1}...`);
        pdfDoc.removePage(pageIndex);
      });
      
      const remainingPages = pdfDoc.getPageCount();
      console.log(`Remaining pages after deletion: ${remainingPages}`);
      
      console.log('Saving modified PDF...');
      const modifiedPdfBytes = await pdfDoc.save();
      console.log(`Modified PDF size: ${modifiedPdfBytes.length} bytes`);
      
      // Create a new File object from the modified PDF
      const modifiedBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const modifiedFile = new File([modifiedBlob], fileObj.name, { type: 'application/pdf' });
      
      // Update the file in state with modified version
      setFiles(prev => {
        const updated = prev.map(f => {
          if (f.id === fileId) {
            console.log(`Updating file ${f.name}:`);
            console.log(`  Old pages: ${f.pages}`);
            console.log(`  New pages: ${remainingPages}`);
            console.log(`  Old size: ${f.size}`);
            console.log(`  New size: ${modifiedPdfBytes.length}`);
            return {
              ...f,
              file: modifiedFile,
              size: modifiedPdfBytes.length,
              pages: remainingPages,
              modified: true
            };
          }
          return f;
        });
        console.log('Files after update:', updated.map(f => ({ name: f.name, pages: f.pages, modified: f.modified })));
        return updated;
      });
      
      console.log('File updated in app with modified version');
      
      // Also download the modified file
      saveAs(modifiedBlob, `edited-${fileObj.name}`);
      console.log('Download started');
      
      // Switch to Files tab to show updated file
      setTimeout(() => {
        setActiveTab('files');
      }, 500);
      
      toast.dismiss(toastId);
      toast.success(`${pagesToDelete.length} page(s) removed! File updated in app with ${remainingPages} pages. You can now merge it with other files.`, {
        duration: 5000
      });
    } catch (error) {
      console.error('Error deleting pages:', error);
      console.error('Error details:', error.message, error.stack);
      toast.dismiss(toastId);
      toast.error(`Failed to remove pages: ${error.message}`);
    } finally {
      setProcessing(false);
      console.log('Page deletion process completed');
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    setSelectedFiles([]);
    toast.success('All files cleared');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Upload Zone */}
        <FileUploadZone onFilesAdded={handleFilesAdded} disabled={processing} />

        {/* Action Panel */}
        {files.length > 0 && (
          <ActionPanel
            selectedCount={selectedFiles.length}
            totalFiles={files.length}
            onMerge={handleMergePDFs}
            onClearAll={handleClearAll}
            disabled={processing}
          />
        )}

        {/* Tabs */}
        {files.length > 0 && (
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'files' ? 'default' : 'outline'}
              onClick={() => setActiveTab('files')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Files ({files.length})
            </Button>
            <Button
              variant={activeTab === 'pages' ? 'default' : 'outline'}
              onClick={() => setActiveTab('pages')}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Page Manager
            </Button>
          </div>
        )}

        {/* Content Area */}
        {files.length > 0 && (
          <>
            {activeTab === 'files' && (
              <FileList
                files={files}
                selectedFiles={selectedFiles}
                onFileSelect={handleFileSelect}
                onFileDelete={handleFileDelete}
                onCompress={handleCompressPDF}
                disabled={processing}
              />
            )}
            
            {activeTab === 'pages' && (
              <PageManager
                files={files}
                onDeletePages={handleDeletePages}
                disabled={processing}
              />
            )}
          </>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No PDFs uploaded yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload your PDF files to get started with compression, merging, and page management
            </p>
          </div>
        )}
      </main>
    </div>
  );
}