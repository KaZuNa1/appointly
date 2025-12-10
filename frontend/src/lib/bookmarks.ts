import api from "./api";

export interface Bookmark {
  id: string;
  userId: string;
  providerId: string;
  createdAt: string;
  provider?: {
    id: string;
    businessName: string;
    nickname: string;
    phone: string;
    address: string;
    latitude: number;
    longitude: number;
    user: {
      fullName: string;
      avatarUrl: string | null;
    };
    services: {
      id: string;
      name: string;
      price: number;
    }[];
  };
}

export interface BookmarkResponse {
  bookmarks: Bookmark[];
}

export interface BookmarkCheckResponse {
  isBookmarked: boolean;
}

export interface BookmarkCountResponse {
  count: number;
}

// Add bookmark
export const addBookmark = async (providerId: string) => {
  const response = await api.post("/bookmarks", { providerId });
  return response.data;
};

// Remove bookmark
export const removeBookmark = async (providerId: string) => {
  const response = await api.delete(`/bookmarks/${providerId}`);
  return response.data;
};

// Get user's bookmarks
export const getBookmarks = async () => {
  const response = await api.get<BookmarkResponse>("/bookmarks");
  return response.data.bookmarks;
};

// Check if provider is bookmarked
export const checkBookmark = async (providerId: string) => {
  const response = await api.get<BookmarkCheckResponse>(`/bookmarks/check/${providerId}`);
  return response.data.isBookmarked;
};

// Get bookmark count for provider (public)
export const getBookmarkCount = async (providerId: string) => {
  const response = await api.get<BookmarkCountResponse>(`/bookmarks/count/${providerId}`);
  return response.data.count;
};
