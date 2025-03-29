
import { ImageItem } from "@/types";

// In a real app, these functions would communicate with your Django backend
export const uploadImage = async (file: File): Promise<ImageItem> => {
  // This is a mock function simulating an API call to Django
  return new Promise((resolve) => {
    // Simulate processing delay
    setTimeout(() => {
      const imageUrl = URL.createObjectURL(file);
      
      const newImage: ImageItem = {
        id: crypto.randomUUID(),
        url: imageUrl,
        name: file.name,
        uploadedAt: new Date().toISOString(),
        processed: false,
      };
      
      // Save to local storage
      const savedImages = getSavedImages();
      localStorage.setItem('images', JSON.stringify([...savedImages, newImage]));
      
      resolve(newImage);
    }, 1500);
  });
};

export const processImage = async (imageId: string): Promise<ImageItem> => {
  // This is a mock function that would actually call your Django backend
  // with the YOLO model in a real application
  return new Promise((resolve) => {
    // Simulate processing delay
    setTimeout(() => {
      const savedImages = getSavedImages();
      const imageIndex = savedImages.findIndex(img => img.id === imageId);
      
      if (imageIndex === -1) {
        throw new Error('Image not found');
      }
      
      // Get the image to be processed
      const image = savedImages[imageIndex];
      
      // Create mock processing results
      const mockResults = {
        annotatedImageUrl: image.url, // In a real app, this would be a new processed image
        detectedObjects: [
          { className: "Plastic", count: Math.floor(Math.random() * 5) + 1, percentage: Math.random() * 40 + 10 },
          { className: "Paper", count: Math.floor(Math.random() * 3) + 1, percentage: Math.random() * 30 + 5 },
          { className: "Glass", count: Math.floor(Math.random() * 2) + 1, percentage: Math.random() * 20 + 5 },
          { className: "Metal", count: Math.floor(Math.random() * 2), percentage: Math.random() * 15 },
          { className: "Organic", count: Math.floor(Math.random() * 3), percentage: Math.random() * 25 },
        ].filter(obj => obj.count > 0), // Only include objects with count > 0
        totalObjects: 0, // Will be calculated below
      };
      
      // Calculate total objects
      mockResults.totalObjects = mockResults.detectedObjects.reduce((sum, obj) => sum + obj.count, 0);
      
      // Recalculate percentages based on the actual total
      if (mockResults.totalObjects > 0) {
        mockResults.detectedObjects.forEach(obj => {
          obj.percentage = (obj.count / mockResults.totalObjects!) * 100;
        });
      }
      
      // Update the image with processing results
      const updatedImage: ImageItem = {
        ...image,
        processed: true,
        results: mockResults,
      };
      
      // Update in localStorage
      savedImages[imageIndex] = updatedImage;
      localStorage.setItem('images', JSON.stringify(savedImages));
      
      resolve(updatedImage);
    }, 3000);
  });
};

export const getSavedImages = (): ImageItem[] => {
  const savedImages = localStorage.getItem('images');
  return savedImages ? JSON.parse(savedImages) : [];
};

export const deleteImage = (imageId: string): void => {
  const savedImages = getSavedImages();
  const updatedImages = savedImages.filter(img => img.id !== imageId);
  localStorage.setItem('images', JSON.stringify(updatedImages));
};
