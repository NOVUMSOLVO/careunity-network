/**
 * Image Optimization Demo Page
 * 
 * This page demonstrates the various image optimization techniques implemented in the CareUnity application.
 * It showcases:
 * - Responsive images with modern format support
 * - Image compression before upload
 * - Performance monitoring for images
 * - Offline image support
 */

import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveImage, generateModernFormats } from '@/components/ui/responsive-image';
import { OptimizedFileUpload } from '@/components/ui/optimized-file-upload';
import { ImagePerformanceMonitor } from '@/components/performance/image-performance-monitor';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { InfoIcon, ImageIcon, UploadIcon, BarChart3Icon, WifiOffIcon } from 'lucide-react';

// Sample image data for demonstration
const sampleImages = [
  {
    id: 'img1',
    title: 'Standard JPEG',
    description: 'Standard JPEG image without optimization',
    src: '/images/sample/photo1.jpg',
    width: 1200,
    height: 800,
    format: 'jpg'
  },
  {
    id: 'img2',
    title: 'WebP Format',
    description: 'Same image converted to WebP format',
    src: '/images/sample/photo1.webp',
    width: 1200,
    height: 800,
    format: 'webp'
  },
  {
    id: 'img3',
    title: 'Optimized JPEG',
    description: 'JPEG with quality reduction and optimization',
    src: '/images/sample/photo1-optimized.jpg',
    width: 1200,
    height: 800,
    format: 'jpg'
  },
  {
    id: 'img4',
    title: 'Responsive Image',
    description: 'Image with multiple sizes for different devices',
    src: '/images/sample/photo2.jpg',
    width: 1200,
    height: 800,
    format: 'jpg',
    srcSet: '/images/sample/photo2-small.jpg 400w, /images/sample/photo2-medium.jpg 800w, /images/sample/photo2.jpg 1200w'
  }
];

// Generate srcsets for modern formats
const responsiveImageSets = generateModernFormats([
  { url: '/images/sample/photo3-small.jpg', width: 400 },
  { url: '/images/sample/photo3-medium.jpg', width: 800 },
  { url: '/images/sample/photo3.jpg', width: 1200 }
], {
  webp: { quality: 80 },
  avif: { quality: 70 }
});

export default function ImageOptimizationDemo() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  } | null>(null);
  
  // Handle file upload with compression
  const handleFileSelect = (file: File, originalFile?: File) => {
    setUploadedFile(file);
    setUploadedPreview(URL.createObjectURL(file));
    
    if (originalFile) {
      setCompressionStats({
        originalSize: originalFile.size,
        compressedSize: file.size,
        compressionRatio: originalFile.size / file.size
      });
    } else {
      setCompressionStats(null);
    }
  };
  
  // Handle file removal
  const handleFileRemove = () => {
    if (uploadedPreview) {
      URL.revokeObjectURL(uploadedPreview);
    }
    setUploadedFile(null);
    setUploadedPreview(null);
    setCompressionStats(null);
  };
  
  // Format bytes to human-readable string
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <PageLayout title="Image Optimization Demo">
      <div className="container mx-auto py-6 space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Image Optimization Techniques</CardTitle>
                <CardDescription>
                  Demonstration of various image optimization techniques implemented in CareUnity
                </CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <InfoIcon className="h-3 w-3" />
                Performance Enhancement
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="formats">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="formats" className="flex items-center gap-1">
                  <ImageIcon className="h-4 w-4" />
                  Image Formats
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-1">
                  <UploadIcon className="h-4 w-4" />
                  Compression
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-1">
                  <BarChart3Icon className="h-4 w-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="offline" className="flex items-center gap-1">
                  <WifiOffIcon className="h-4 w-4" />
                  Offline Support
                </TabsTrigger>
              </TabsList>
              
              {/* Image Formats Tab */}
              <TabsContent value="formats">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sampleImages.map(image => (
                      <Card key={image.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{image.title}</CardTitle>
                          <CardDescription>{image.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="aspect-video overflow-hidden rounded-md">
                            <ResponsiveImage
                              src={image.src}
                              alt={image.title}
                              aspectRatio={image.width / image.height}
                              srcSet={image.srcSet}
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="w-full h-full object-cover"
                              fallbackSrc="/images/placeholder.svg"
                            />
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <div className="text-sm text-muted-foreground">
                            Format: <Badge variant="outline">{image.format}</Badge>
                            <span className="mx-2">•</span>
                            Size: {image.width}×{image.height}
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Modern Format Support with Picture Element</h3>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Responsive Image with Modern Formats</CardTitle>
                        <CardDescription>
                          This image automatically selects the best format (AVIF, WebP, or JPEG) based on browser support
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video overflow-hidden rounded-md">
                          <ResponsiveImage
                            src="/images/sample/photo3.jpg"
                            alt="Responsive image with modern formats"
                            aspectRatio={16/9}
                            srcSet={responsiveImageSets.original}
                            webpSrcSet={responsiveImageSets.webp}
                            avifSrcSet={responsiveImageSets.avif}
                            sizes="(max-width: 768px) 100vw, 800px"
                            className="w-full h-full object-cover"
                            usePicture={true}
                            fallbackSrc="/images/placeholder.svg"
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="text-sm text-muted-foreground space-x-2">
                          <Badge variant="outline">AVIF</Badge>
                          <Badge variant="outline">WebP</Badge>
                          <Badge variant="outline">JPEG</Badge>
                          <span className="ml-2">•</span>
                          Automatically selects the best format for your browser
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              {/* Image Compression Tab */}
              <TabsContent value="upload">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Client-side Image Compression</CardTitle>
                      <CardDescription>
                        Upload an image to see how it's compressed before being sent to the server
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Upload an Image</h3>
                          <OptimizedFileUpload
                            onFileSelect={handleFileSelect}
                            onFileRemove={handleFileRemove}
                            accept="image/*"
                            compressImages={true}
                            compressionOptions={{
                              maxWidth: 1200,
                              maxHeight: 800,
                              quality: 0.8,
                              format: 'webp'
                            }}
                            showPreview={false}
                          />
                          
                          {compressionStats && (
                            <div className="mt-4 p-4 bg-muted rounded-md">
                              <h4 className="font-medium mb-2">Compression Results</h4>
                              <ul className="space-y-1 text-sm">
                                <li>Original size: {formatBytes(compressionStats.originalSize)}</li>
                                <li>Compressed size: {formatBytes(compressionStats.compressedSize)}</li>
                                <li>Compression ratio: {compressionStats.compressionRatio.toFixed(2)}x</li>
                                <li>Space saved: {formatBytes(compressionStats.originalSize - compressionStats.compressedSize)}</li>
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium mb-2">Preview</h3>
                          {uploadedPreview ? (
                            <div className="aspect-video overflow-hidden rounded-md bg-muted">
                              <ResponsiveImage
                                src={uploadedPreview}
                                alt="Uploaded image preview"
                                aspectRatio={16/9}
                                className="w-full h-full object-contain"
                                fallbackSrc="/images/placeholder.svg"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video flex items-center justify-center rounded-md bg-muted">
                              <p className="text-muted-foreground">Upload an image to see the preview</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Performance Monitoring Tab */}
              <TabsContent value="performance">
                <ImagePerformanceMonitor />
              </TabsContent>
              
              {/* Offline Support Tab */}
              <TabsContent value="offline">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Offline Image Support</CardTitle>
                      <CardDescription>
                        Images are cached by the service worker for offline viewing
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p>
                          To test offline support:
                        </p>
                        <ol className="list-decimal list-inside space-y-2">
                          <li>Browse this page to load and cache the images</li>
                          <li>Open your browser's developer tools and go to the Network tab</li>
                          <li>Enable "Offline" mode in the Network conditions</li>
                          <li>Refresh the page - the images should still be visible</li>
                        </ol>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          <div className="aspect-video overflow-hidden rounded-md">
                            <ResponsiveImage
                              src="/images/sample/photo4.jpg"
                              alt="Offline-capable image"
                              aspectRatio={16/9}
                              className="w-full h-full object-cover"
                              fallbackSrc="/images/placeholder.svg"
                            />
                          </div>
                          <div className="aspect-video overflow-hidden rounded-md">
                            <ResponsiveImage
                              src="/images/sample/photo5.jpg"
                              alt="Another offline-capable image"
                              aspectRatio={16/9}
                              className="w-full h-full object-cover"
                              fallbackSrc="/images/placeholder.svg"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" onClick={() => window.location.reload()}>
                        Refresh Page
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
