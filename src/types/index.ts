
export type User = {
  id: string;
  username: string;
  email: string;
  avatar?: string;
};

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type ImageItem = {
  id: string;
  url: string;
  name: string;
  uploadedAt: string;
  processed: boolean;
  results?: {
    annotatedImageUrl?: string;
    detectedObjects?: {
      className: string;
      count: number;
      percentage: number;
    }[];
    totalObjects?: number;
  };
};
