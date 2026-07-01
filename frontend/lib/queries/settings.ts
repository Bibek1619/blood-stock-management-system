import axiosInstance from "@/lib/axiosInstance";

export interface SystemSettings {
  organizationName?: string;
  organizationLogo?: string | null;
  dashboardTitle?: string;
  shortName?: string;
  contactEmail?: string;
  contactPhone?: string;
  updatedAt?: string;
}

// Get system settings
export const getSettings = async (): Promise<SystemSettings> => {
  const response = await axiosInstance.get('/api/settings');
  return response.data;
};

// Update system settings
export const updateSettings = async (settings: Partial<SystemSettings>) => {
  const response = await axiosInstance.put('/api/settings', settings);
  return response.data;
};

// Upload logo
export const uploadLogo = async (file: File) => {
  const formData = new FormData();
  formData.append('logo', file);
  
  const response = await axiosInstance.post('/api/settings/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete logo
export const deleteLogo = async () => {
  const response = await axiosInstance.delete('/api/settings/logo');
  return response.data;
};
