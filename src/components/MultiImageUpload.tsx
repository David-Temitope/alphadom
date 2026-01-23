import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MultiImageUploadProps {
  onImagesChanged: (urls: string[]) => void;
  currentImages?: string[];
  maxImages?: number;
  maxTotalSizeMB?: number;
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({ 
  onImagesChanged, 
  currentImages = [],
  maxImages = 3,
  maxTotalSizeMB = 8
}) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(currentImages);
  const { toast } = useToast();

  // Sync with parent state when currentImages changes
  useEffect(() => {
    setImages(currentImages);
  }, [currentImages]);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent any form interactions during upload
    event.preventDefault();
    event.stopPropagation();
    
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload');
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      // Check current total size + new file
      if (file.size > maxTotalSizeMB * 1024 * 1024) {
        throw new Error(`Image size must be less than ${maxTotalSizeMB}MB`);
      }

      // Check if we've reached max images
      if (images.length >= maxImages) {
        throw new Error(`Maximum ${maxImages} images allowed`);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      const newImages = [...images, publicUrl];
      setImages(newImages);
      onImagesChanged(newImages);
      
      toast({
        title: "Success",
        description: `Image ${newImages.length} of ${maxImages} uploaded!`,
      });
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error uploading image',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset file input after everything is done
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChanged(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Product Images * <span className="text-muted-foreground font-normal">({images.length}/{maxImages})</span>
        </Label>
        <span className="text-xs text-muted-foreground">Min 1, Max {maxImages} images. Total max {maxTotalSizeMB}MB</span>
      </div>
      
      {/* Image Preview Grid */}
      <div className="grid grid-cols-3 gap-3">
        {images.map((url, index) => (
          <div key={index} className="relative group aspect-square">
            <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm h-full">
              <img 
                src={url} 
                alt={`Product ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
              {index === 0 && (
                <span className="absolute bottom-1 left-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                  Main
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {/* Upload Button */}
        {images.length < maxImages && (
          <div className="relative aspect-square" onClick={(e) => e.stopPropagation()}>
            <div className="border-2 border-dashed border-border hover:border-primary rounded-xl h-full flex flex-col items-center justify-center bg-muted/50 hover:bg-muted transition-all duration-200 cursor-pointer group">
              <div className="flex flex-col items-center space-y-2 p-2">
                <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors duration-200">
                  <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                </div>
                <p className="text-xs text-muted-foreground text-center group-hover:text-primary transition-colors duration-200">
                  Add Image
                </p>
              </div>
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={uploadImage}
              onClick={(e) => e.stopPropagation()}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        )}
      </div>
      
      {uploading && (
        <div className="flex items-center space-x-2 text-sm text-primary">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
          <span>Uploading...</span>
        </div>
      )}

      {images.length === 0 && (
        <p className="text-xs text-destructive">At least 1 image is required</p>
      )}
    </div>
  );
};
