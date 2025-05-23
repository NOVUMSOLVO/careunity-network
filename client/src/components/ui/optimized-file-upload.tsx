/**
 * Optimized File Upload Component
 * 
 * This component provides an enhanced file upload experience with:
 * - Client-side image compression for images
 * - Preview for images and PDFs
 * - Progress indicator
 * - Drag and drop support
 * - Offline detection
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Progress } from './progress';
import { compressImage, getImageOrientation } from '@/utils/image-compression';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ResponsiveImage } from './responsive-image';

export interface OptimizedFileUploadProps {
  /**
   * Function called when a file is selected and processed
   */
  onFileSelect?: (file: File, originalFile?: File) => void;
  
  /**
   * Function called when a file is removed
   */
  onFileRemove?: () => void;
  
  /**
   * Accepted file types
   * @default "image/*,application/pdf"
   */
  accept?: string;
  
  /**
   * Maximum file size in bytes
   * @default 10485760 (10MB)
   */
  maxSize?: number;
  
  /**
   * Whether to compress images before upload
   * @default true
   */
  compressImages?: boolean;
  
  /**
   * Options for image compression
   */
  compressionOptions?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  };
  
  /**
   * Whether to show a preview of the selected file
   * @default true
   */
  showPreview?: boolean;
  
  /**
   * Whether the component is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * CSS class for the container
   */
  className?: string;
  
  /**
   * Label for the upload button
   * @default "Select File"
   */
  label?: string;
  
  /**
   * Placeholder text when no file is selected
   * @default "Drag and drop a file here, or click to select"
   */
  placeholder?: string;
  
  /**
   * Whether to allow multiple files
   * @default false
   */
  multiple?: boolean;
  
  /**
   * ID for the input element
   */
  id?: string;
  
  /**
   * Name for the input element
   */
  name?: string;
}

export function OptimizedFileUpload({
  onFileSelect,
  onFileRemove,
  accept = "image/*,application/pdf",
  maxSize = 10 * 1024 * 1024, // 10MB
  compressImages = true,
  compressionOptions = {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: 'jpeg'
  },
  showPreview = true,
  disabled = false,
  className,
  label = "Select File",
  placeholder = "Drag and drop a file here, or click to select",
  multiple = false,
  id,
  name,
}: OptimizedFileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  
  // Check if online
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Initial check
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);
  
  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);
  
  // Process the selected file
  const processFile = useCallback(async (selectedFile: File) => {
    if (!selectedFile) return;
    
    // Check file size
    if (selectedFile.size > maxSize) {
      setError(`File is too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(1)}MB.`);
      return;
    }
    
    setIsProcessing(true);
    setProgress(10);
    setError(null);
    
    try {
      // Store the original file
      setOriginalFile(selectedFile);
      
      // If it's an image and compression is enabled, compress it
      if (compressImages && selectedFile.type.startsWith('image/')) {
        setProgress(20);
        
        // Get image orientation for proper rotation
        const orientation = await getImageOrientation(selectedFile);
        setProgress(30);
        
        // Compress the image
        const compressedImage = await compressImage(selectedFile, {
          ...compressionOptions,
          orientation
        });
        setProgress(70);
        
        // Create a new File from the compressed image
        const compressedFile = new File(
          [compressedImage.blob],
          selectedFile.name.replace(/\.[^/.]+$/, '') + '.' + compressedImage.format,
          {
            type: `image/${compressedImage.format}`,
            lastModified: Date.now()
          }
        );
        
        // Set the compressed file and preview
        setFile(compressedFile);
        setPreview(compressedImage.dataUrl || URL.createObjectURL(compressedImage.blob));
        
        // Call the onFileSelect callback with the compressed file
        onFileSelect?.(compressedFile, selectedFile);
        
        setProgress(100);
      } else {
        // For non-images or when compression is disabled, use the original file
        setFile(selectedFile);
        
        // Create preview for images and PDFs
        if (selectedFile.type.startsWith('image/')) {
          setPreview(URL.createObjectURL(selectedFile));
        } else if (selectedFile.type === 'application/pdf') {
          setPreview('pdf');
        } else {
          setPreview('file');
        }
        
        // Call the onFileSelect callback with the original file
        onFileSelect?.(selectedFile);
        
        setProgress(100);
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setFile(null);
      setPreview(null);
    } finally {
      setIsProcessing(false);
    }
  }, [compressImages, compressionOptions, maxSize, onFileSelect]);
  
  // Handle file selection from input
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };
  
  // Handle file drop
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, [processFile]);
  
  // Handle drag events
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setOriginalFile(null);
    setPreview(null);
    setError(null);
    
    // Reset the input value
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    
    // Call the onFileRemove callback
    onFileRemove?.();
  };
  
  // Render file preview
  const renderPreview = () => {
    if (!preview || !showPreview) return null;
    
    if (preview === 'pdf') {
      return (
        <div className="flex items-center justify-center p-4 bg-muted rounded-md">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">PDF Document</span>
        </div>
      );
    } else if (preview === 'file') {
      return (
        <div className="flex items-center justify-center p-4 bg-muted rounded-md">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">File</span>
        </div>
      );
    } else {
      return (
        <div className="relative w-full max-h-48 overflow-hidden rounded-md">
          <ResponsiveImage
            src={preview}
            alt="File preview"
            className="object-contain w-full h-full"
            aspectRatio={16/9}
            fallbackSrc="/images/placeholder.svg"
          />
        </div>
      );
    }
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      {/* Drop area */}
      <div
        ref={dropAreaRef}
        className={cn(
          "border-2 border-dashed rounded-md p-4 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          file ? "border-primary/50" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !file && inputRef.current?.click()}
      >
        {isProcessing ? (
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">Processing file...</p>
            <Progress value={progress} className="h-2 w-full" />
          </div>
        ) : file ? (
          <div className="space-y-2">
            {renderPreview()}
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm truncate max-w-[70%]">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="mb-2">
              {accept.includes('image/') ? (
                <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
              ) : (
                <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{placeholder}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={disabled || !isOnline}
            >
              <Upload className="h-4 w-4 mr-2" />
              {label}
            </Button>
            {!isOnline && (
              <p className="text-xs text-destructive mt-2 flex items-center justify-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                You are offline. File uploads are not available.
              </p>
            )}
          </div>
        )}
        
        {error && (
          <p className="text-xs text-destructive mt-2 flex items-center justify-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {error}
          </p>
        )}
      </div>
      
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || !isOnline}
        multiple={multiple}
        id={id}
        name={name}
      />
    </div>
  );
}
