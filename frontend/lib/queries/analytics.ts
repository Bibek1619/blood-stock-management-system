import axiosInstance from "@/lib/axiosInstance";

// Dashboard overview
export const getAnalyticsOverview = async () => {
  const response = await axiosInstance.get("/api/analytics/overview");
  return response.data.data;
};

// Daily summary data
export const getDailySummary = async (params?: {
  bloodGroup?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
}) => {
  const response = await axiosInstance.get("/api/analytics/daily-summary", { params });
  return response.data.data;
};

// Donor activity
export const getDonorActivity = async (activityStatus?: string) => {
  const response = await axiosInstance.get("/api/analytics/donor-activity", {
    params: { activityStatus },
  });
  return response.data.data;
};

// Donor retention metrics
export const getDonorRetention = async () => {
  const response = await axiosInstance.get("/api/analytics/donor-retention");
  return response.data.data;
};

// Geographic data
export const getGeographicData = async (params?: {
  bloodGroup?: string;
  city?: string;
}) => {
  const response = await axiosInstance.get("/api/analytics/geographic", { params });
  return response.data.data;
};

// Usage trends
export const getUsageTrends = async (params?: {
  bloodGroup?: string;
  days?: number;
}) => {
  const response = await axiosInstance.get("/api/analytics/usage-trends", { params });
  return response.data.data;
};

// Seasonal patterns
export const getSeasonalPatterns = async (params?: {
  bloodGroup?: string;
  months?: number;
}) => {
  const response = await axiosInstance.get("/api/analytics/seasonal-patterns", { params });
  return response.data.data;
};

// Predictions
export const getPredictions = async (params?: {
  bloodGroup?: string;
  days?: number;
}) => {
  const response = await axiosInstance.get("/api/analytics/predictions", { params });
  return response.data.data;
};

// Campaigns
export const getCampaigns = async (params?: {
  campaignType?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await axiosInstance.get("/api/analytics/campaigns", { params });
  return response.data.data;
};

export const createCampaign = async (data: {
  campaignName: string;
  campaignType: string;
  startDate: string;
  endDate?: string;
  targetDonors?: number;
  targetUnits?: number;
  cost?: number;
  eventId?: string;
}) => {
  const response = await axiosInstance.post("/api/analytics/campaigns", data);
  return response.data.data;
};

export const updateCampaign = async (
  id: string,
  data: {
    actualDonors?: number;
    actualUnits?: number;
    endDate?: string;
  }
) => {
  const response = await axiosInstance.put(`/api/analytics/campaigns/${id}`, data);
  return response.data.data;
};
