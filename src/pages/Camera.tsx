
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { uploadImage, processImage } from "@/services/imageService";
import { ImageItem } from "@/types";
import { 
  ArrowLeft, 
  CameraIcon, 
  Loader2, 
  Recycle, 
  RefreshCw, 
  CameraOff,
  VideoOff,
  Sun,
  Focus,
  Move
} from "lucide-react";

const Camera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<ImageItem | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      // Request access to the user's camera
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      setStream(mediaStream);
      
      // Connect the stream to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Unable to access camera. Please make sure you've granted camera permissions.");
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || !stream) return;
    
    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame on the canvas
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL (image format)
    const imageDataUrl = canvas.toDataURL("image/jpeg");
    setCapturedImage(imageDataUrl);
    setIsCapturing(false);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setUploadedImage(null);
  };

  const handleUpload = async () => {
    if (!capturedImage) return;
    
    try {
      setIsCapturing(true);
      
      // Convert data URL to a File object
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `camera_capture_${new Date().getTime()}.jpg`, { type: "image/jpeg" });
      
      // Upload the image
      const image = await uploadImage(file);
      setUploadedImage(image);
      
      toast({
        title: "Image captured",
        description: "Your image has been successfully captured",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
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
        <h1 className="text-3xl font-bold tracking-tight">Capture Image</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardContent className="p-6">
              {cameraError ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="bg-destructive/10 rounded-full p-4">
                    <VideoOff className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="font-medium text-lg">Camera Access Error</h3>
                  <p className="text-muted-foreground">{cameraError}</p>
                  <Button onClick={startCamera}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              ) : capturedImage ? (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-secondary aspect-video">
                    <img
                      src={capturedImage}
                      alt="Captured photo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex justify-center space-x-2">
                    <Button variant="outline" onClick={retakePhoto}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retake Photo
                    </Button>
                    {!uploadedImage ? (
                      <Button onClick={handleUpload} disabled={isCapturing}>
                        {isCapturing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            Use Photo
                          </>
                        )}
                      </Button>
                    ) : (
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
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    {!stream && !cameraError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      className="rounded-full w-14 h-14 p-0"
                      onClick={captureImage}
                      disabled={!stream || isCapturing}
                    >
                      {isCapturing ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <CameraIcon className="h-6 w-6" />
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
              <h2 className="text-xl font-semibold mb-4">Camera Capture Tips</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-2 text-primary">
                    <Sun className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium">Good Lighting</h3>
                    <p className="text-sm text-muted-foreground">
                      Ensure the waste is well-lit to improve detection accuracy
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-2 text-primary">
                    <Focus className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium">Clear Focus</h3>
                    <p className="text-sm text-muted-foreground">
                      Hold the camera steady and ensure the waste is in focus
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-2 text-primary">
                    <Move className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium">Appropriate Distance</h3>
                    <p className="text-sm text-muted-foreground">
                      Frame the waste so it's clearly visible but not too close
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-primary/5 rounded-lg">
                <p className="text-sm">
                  <strong>Privacy Note:</strong> Images are processed locally and only uploaded to our server for waste detection.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Camera;
