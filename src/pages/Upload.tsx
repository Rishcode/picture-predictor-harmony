
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { uploadImage, processImage } from "@/services/imageService";
import { ImageItem } from "@/types";
import { Upload as UploadIcon, ArrowLeft, Loader2, Image } from "lucide-react";

const Upload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<ImageItem | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      const image = await uploadImage(file);
      setUploadedImage(image);
      toast({
        title: "Image uploaded",
        description: "Your image has been successfully uploaded",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProcess = async () => {
    if (!uploadedImage) return;
    
    try {
      setIsProcessing(true);
      const processedImage = await processImage(uploadedImage.id);
      toast({
        title: "Processing complete",
        description: "Your image has been successfully analyzed",
      });
      navigate(`/images/${processedImage.id}`);
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "There was an error processing your image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Upload Image</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardContent className="p-6">
              {!uploadedImage ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center ${
                    isDragging ? "border-primary bg-primary/5" : "border-border"
                  } transition-colors`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      <p className="text-muted-foreground">Uploading image...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="bg-secondary h-20 w-20 rounded-full flex items-center justify-center">
                        <UploadIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Drag and drop your image here</h3>
                        <p className="text-sm text-muted-foreground">
                          or click to browse from your device
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supports JPG, PNG, GIF (Max 5MB)
                        </p>
                      </div>
                      <label className="cursor-pointer">
                        <Button>
                          <Image className="mr-2 h-4 w-4" />
                          Select Image
                        </Button>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-secondary aspect-video">
                    <img
                      src={uploadedImage.url}
                      alt={uploadedImage.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{uploadedImage.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded on {new Date(uploadedImage.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <Button variant="outline" onClick={() => setUploadedImage(null)}>
                      Choose Another
                    </Button>
                    <Button onClick={handleProcess} disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Recycle className="mr-2 h-4 w-4" />
                          Process Image
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">How It Works</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-2 text-primary">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium">1. Upload Your Image</h3>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop or browse to upload a waste image
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-2 text-primary">
                    <Recycle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium">2. AI Processing</h3>
                    <p className="text-sm text-muted-foreground">
                      Our YOLO model analyzes your image to identify waste objects
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-2 text-primary">
                    <BarChart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium">3. View Results</h3>
                    <p className="text-sm text-muted-foreground">
                      See detailed analysis including detected waste types and quantities
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-primary/5 rounded-lg">
                <p className="text-sm">
                  <strong>Note:</strong> For best results, ensure good lighting and a clear view of the waste objects.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Upload;
