
import { ImageItem } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Helper function to convert Supabase image data to our ImageItem type
const mapDatabaseImageToImageItem = (dbImage: any): ImageItem => {
  // Fetch detected objects for this image
  const detectedObjects = dbImage.detected_objects || [];
  
  // Calculate total objects
  const totalObjects = detectedObjects.reduce((sum: number, obj: any) => sum + obj.count, 0);
  
  return {
    id: dbImage.id,
    url: dbImage.url,
    name: dbImage.name,
    uploadedAt: dbImage.uploaded_at,
    processed: dbImage.processed,
    results: dbImage.processed ? {
      annotatedImageUrl: dbImage.annotated_image_url || dbImage.url,
      detectedObjects: detectedObjects.map((obj: any) => ({
        className: obj.class_name,
        count: obj.count,
        percentage: obj.percentage
      })),
      totalObjects: totalObjects
    } : undefined
  };
};

export const uploadImage = async (file: File): Promise<ImageItem> => {
  try {
    // First check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    
    // Create object URL for preview while uploading
    const previewUrl = URL.createObjectURL(file);
    
    // Create initial image record in database
    const { data: imageData, error: insertError } = await supabase
      .from('images')
      .insert({
        user_id: user.id,
        name: file.name,
        url: previewUrl, // Temporary URL
        processed: false
      })
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    // At this point we have a database record, return a temporary image item
    const tempImageItem: ImageItem = {
      id: imageData.id,
      url: previewUrl,
      name: file.name,
      uploadedAt: imageData.uploaded_at,
      processed: false
    };
    
    // In a real app, we would upload the file to Supabase storage
    // For this demo, we'll simulate a delay and then use the preview URL
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update the image record with the final URL
    const { error: updateError } = await supabase
      .from('images')
      .update({ url: previewUrl })
      .eq('id', imageData.id);
    
    if (updateError) throw updateError;
    
    return tempImageItem;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const processImage = async (imageId: string): Promise<ImageItem> => {
  try {
    // First check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    
    // Get the image from the database
    const { data: imageData, error: fetchError } = await supabase
      .from('images')
      .select('*')
      .eq('id', imageId)
      .eq('user_id', user.id)
      .single();
    
    if (fetchError) throw fetchError;
    if (!imageData) throw new Error("Image not found");
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate mock detection results
    const mockDetectedObjects = [
      { class_name: "Plastic", count: Math.floor(Math.random() * 5) + 1, percentage: Math.random() * 40 + 10 },
      { class_name: "Paper", count: Math.floor(Math.random() * 3) + 1, percentage: Math.random() * 30 + 5 },
      { class_name: "Glass", count: Math.floor(Math.random() * 2) + 1, percentage: Math.random() * 20 + 5 },
      { class_name: "Metal", count: Math.floor(Math.random() * 2), percentage: Math.random() * 15 },
      { class_name: "Organic", count: Math.floor(Math.random() * 3), percentage: Math.random() * 25 },
    ].filter(obj => obj.count > 0);
    
    // Calculate total objects
    const totalObjects = mockDetectedObjects.reduce((sum, obj) => sum + obj.count, 0);
    
    // Recalculate percentages
    if (totalObjects > 0) {
      mockDetectedObjects.forEach(obj => {
        obj.percentage = (obj.count / totalObjects) * 100;
      });
    }
    
    // Insert detected objects into the database
    for (const obj of mockDetectedObjects) {
      const { error: insertObjectError } = await supabase
        .from('detected_objects')
        .insert({
          image_id: imageId,
          class_name: obj.class_name,
          count: obj.count,
          percentage: obj.percentage
        });
      
      if (insertObjectError) throw insertObjectError;
    }
    
    // Update the image record as processed
    const { error: updateError } = await supabase
      .from('images')
      .update({ 
        processed: true,
        annotated_image_url: imageData.url // In a real app, this would be a new processed image
      })
      .eq('id', imageId);
    
    if (updateError) throw updateError;
    
    // Fetch the updated image with its detected objects
    const { data: updatedImageData, error: fetchUpdatedError } = await supabase
      .from('images')
      .select(`
        *,
        detected_objects (
          class_name,
          count,
          percentage
        )
      `)
      .eq('id', imageId)
      .single();
    
    if (fetchUpdatedError) throw fetchUpdatedError;
    
    return mapDatabaseImageToImageItem(updatedImageData);
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
};

export const getSavedImages = async (): Promise<ImageItem[]> => {
  try {
    // First check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    // Fetch user's images with their detected objects
    const { data: images, error } = await supabase
      .from('images')
      .select(`
        *,
        detected_objects (
          class_name,
          count,
          percentage
        )
      `)
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: true });
    
    if (error) throw error;
    
    // Map database results to our app's ImageItem type
    return images.map(mapDatabaseImageToImageItem);
  } catch (error) {
    console.error("Error fetching images:", error);
    return [];
  }
};

export const deleteImage = async (imageId: string): Promise<void> => {
  try {
    // First check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    
    // Delete the image
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId)
      .eq('user_id', user.id);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};
