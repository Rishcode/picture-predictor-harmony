
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ImageItem } from "@/types";
import { getSavedImages, processImage, deleteImage } from "@/services/imageService";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Calendar,
  Download,
  Loader2,
  Recycle,
  Trash2,
  AlertCircle,
  BarChart
} from "lucide-react";

const ImageDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [image, setImage] = useState<ImageItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    
    const loadImage = () => {
      const savedImages = getSavedImages();
      const foundImage = savedImages.find(img => img.id === id);
      
      if (foundImage) {
        setImage(foundImage);
      } else {
        toast({
          title: "Image not found",
          description: "The requested image does not exist",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
      
      setIsLoading(false);
    };
    
    loadImage();
  }, [id, navigate, toast]);

  const handleProcessImage = async () => {
    if (!image) return;
    
    try {
      setIsProcessing(true);
      const processedImage = await processImage(image.id);
      setImage(processedImage);
      toast({
        title: "Processing complete",
        description: "Your image has been successfully analyzed",
      });
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

  const handleDeleteImage = () => {
    if (!image) return;
    
    deleteImage(image.id);
    toast({
      title: "Image deleted",
      description: "Your image has been deleted",
    });
    navigate("/dashboard");
  };

  const handleDownload = () => {
    if (!image) return;
    
    const link = document.createElement("a");
    link.href = image.results?.annotatedImageUrl || image.url;
    link.download = `${image.name.split('.')[0]}_analyzed.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "Your image is being downloaded",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!image) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Image Not Found</h1>
        <p className="text-muted-foreground">The requested image does not exist or has been deleted.</p>
        <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{image.name}</h1>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Uploaded on {new Date(image.uploadedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDeleteImage}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          {image.processed && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="rounded-lg overflow-hidden bg-secondary aspect-video">
                <img
                  src={image.results?.annotatedImageUrl || image.url}
                  alt={image.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {image.processed && image.results ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">Detected Objects</span>
                    <span className="text-sm font-semibold">{image.results.totalObjects}</span>
                  </div>
                  
                  {image.results.detectedObjects && image.results.detectedObjects.length > 0 ? (
                    <div className="space-y-3">
                      {image.results.detectedObjects.map((object, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{object.className}</span>
                            <span className="text-sm">{object.count} ({object.percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={object.percentage} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">No objects were detected in this image.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Recycle className="h-5 w-5" />
                  Waste Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {image.results.detectedObjects && image.results.detectedObjects.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {image.results.detectedObjects.map((object, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="h-24 w-24 rounded-full flex items-center justify-center bg-primary/10">
                            <Recycle className="h-10 w-10 text-primary" />
                          </div>
                          <span className="mt-2 font-semibold">{object.className}</span>
                          <span className="text-sm text-muted-foreground">{object.count} items</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">No waste details available.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Recycle className="h-16 w-16 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">Image Not Processed</h2>
                  <p className="text-center text-muted-foreground max-w-md">
                    This image hasn't been analyzed yet. Process it to see waste detection results.
                  </p>
                  <Button onClick={handleProcessImage} disabled={isProcessing}>
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDetails;
