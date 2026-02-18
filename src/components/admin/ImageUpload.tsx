
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUploaded, currentImage }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const { toast } = useToast();

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log('Uploading file:', fileName, 'Size:', file.size, 'Type:', file.type);

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

      console.log('Upload successful, public URL:', publicUrl);

      setPreview(publicUrl);
      onImageUploaded(publicUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
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
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageUploaded('');
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="image" className="text-sm font-medium">Product Image</Label>
      
      {preview ? (
        <div className="relative group">
          <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
            <img 
              src={preview}
              alt="Preview" 
              className="w-32 h-32 object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 shadow-md"
            onClick={removeImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="border-2 border-dashed border-border hover:border-primary rounded-xl p-8 text-center bg-muted/50 hover:bg-muted transition-all duration-200 cursor-pointer group">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors duration-200">
                <Image className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                  Upload product image
                </p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 5MB</p>
              </div>
            </div>
          </div>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={uploadImage}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      )}
      
      {uploading && (
        <div className="flex items-center space-x-2 text-sm text-primary">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
          <span>Uploading...</span>
        </div>
      )}
    </div>
  );
};
