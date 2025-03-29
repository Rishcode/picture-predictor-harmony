
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageItem } from "@/types";
import { getSavedImages } from "@/services/imageService";
import { Calendar, Camera, ChevronRight, Image, Upload } from "lucide-react";

const Dashboard = () => {
  const { authState } = useAuth();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [stats, setStats] = useState({
    totalImages: 0,
    imagesProcessed: 0,
    lastUpload: "",
  });

  useEffect(() => {
    const loadImages = () => {
      const savedImages = getSavedImages();
      setImages(savedImages);
      
      // Calculate stats
      const processed = savedImages.filter(img => img.processed).length;
      const lastUpload = savedImages.length > 0 
        ? new Date(savedImages[savedImages.length - 1].uploadedAt).toLocaleDateString()
        : "Never";
        
      setStats({
        totalImages: savedImages.length,
        imagesProcessed: processed,
        lastUpload,
      });
    };
    
    loadImages();
    
    // Set up interval to check for new images
    const interval = setInterval(loadImages, 5000);
    return () => clearInterval(interval);
  }, []);

  const recentImages = images.slice(-3).reverse(); // Get last 3 in reverse order

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex space-x-2">
          <Button asChild>
            <Link to="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/camera">
              <Camera className="mr-2 h-4 w-4" />
              Capture Image
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Images</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalImages}</div>
            <p className="text-xs text-muted-foreground">
              Images uploaded by you
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Images</CardTitle>
            <Recycle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.imagesProcessed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.imagesProcessed > 0 
                ? `${Math.round((stats.imagesProcessed / stats.totalImages) * 100)}% of your images`
                : 'No images processed yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Upload</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lastUpload}</div>
            <p className="text-xs text-muted-foreground">
              Date of your last upload
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
            <CardDescription>
              Your most recently uploaded images
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentImages.length > 0 ? (
              <div className="space-y-4">
                {recentImages.map((image) => (
                  <div key={image.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-secondary">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{image.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(image.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/images/${image.id}`}>
                        <span className="sr-only">View image</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No images uploaded yet</p>
                <Button asChild className="mt-4">
                  <Link to="/upload">Upload your first image</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
