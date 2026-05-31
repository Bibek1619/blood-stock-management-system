import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../middleware/errorHandler";

// Get daily summary data for charts
export const getDailySummary = async (req: Request, res: Response) => {
  const { bloodGroup, startDate, endDate, days = '30' } = req.query;

  // Calculate date range
  const end = endDate ? new Date(endDate as string) : new Date();
  const start = startDate 
    ? new Date(startDate as string) 
    : new Date(end.getTime() - parseInt(days as string) * 24 * 60 * 60 * 1000);

  const where = {
    date: {
      gte: start,
      lte: end,
    },
    ...(bloodGroup && { bloodGroup: bloodGroup as any }),
  };

  const summaries = await prisma.analyticsDailySummary.findMany({
    where,
    orderBy: { date: 'asc' },
  });

  res.json({ status: "success", data: summaries });
};

// Get donor activity statistics
export const getDonorActivity = async (req: Request, res: Response) => {
  const { activityStatus } = req.query;

  const where = {
    ...(activityStatus && { activityStatus: activityStatus as string }),
  };

  const activities = await prisma.analyticsDonorActivity.findMany({
    where,
    orderBy: { daysSinceLastDonation: 'asc' },
  });

  // Get donor details separately
  const activitiesWithDonors = await Promise.all(
    activities.map(async (activity) => {
      const donor = await prisma.donor.findUnique({
        where: { id: activity.donorId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });
      return {
        ...activity,
        donor,
      };
    })
  );

  // Get summary counts
  const summary = await prisma.analyticsDonorActivity.groupBy({
    by: ['activityStatus'],
    _count: {
      activityStatus: true,
    },
  });

  res.json({ 
    status: "success", 
    data: {
      activities: activitiesWithDonors,
      summary: summary.map(s => ({
        status: s.activityStatus,
        count: s._count.activityStatus,
      })),
    },
  });
};

// Get donor retention metrics
export const getDonorRetention = async (req: Request, res: Response) => {
  // Get activity summary
  const activitySummary = await prisma.analyticsDonorActivity.groupBy({
    by: ['activityStatus'],
    _count: {
      activityStatus: true,
    },
  });

  // Calculate retention rate
  const totalDonors = activitySummary.reduce((sum, s) => sum + s._count.activityStatus, 0);
  const activeDonors = activitySummary.find(s => s.activityStatus === 'ACTIVE')?._count.activityStatus || 0;
  const retentionRate = totalDonors > 0 ? (activeDonors / totalDonors) * 100 : 0;

  // Get average days between donations
  const avgDonationInterval = await prisma.analyticsDonorActivity.aggregate({
    _avg: {
      averageDaysBetweenDonations: true,
    },
    where: {
      averageDaysBetweenDonations: { not: null },
    },
  });

  res.json({
    status: "success",
    data: {
      totalDonors,
      activeDonors,
      retentionRate: Math.round(retentionRate * 100) / 100,
      activityBreakdown: activitySummary.map(s => ({
        status: s.activityStatus,
        count: s._count.activityStatus,
        percentage: Math.round((s._count.activityStatus / totalDonors) * 10000) / 100,
      })),
      averageDaysBetweenDonations: Math.round(avgDonationInterval._avg.averageDaysBetweenDonations || 0),
    },
  });
};

// Get geographic data for heat maps
export const getGeographicData = async (req: Request, res: Response) => {
  const { bloodGroup, city } = req.query;

  const where = {
    ...(bloodGroup && { bloodGroup: bloodGroup as any }),
    ...(city && { city: { contains: city as string, mode: 'insensitive' as const } }),
  };

  const geoData = await prisma.analyticsGeographic.findMany({
    where,
    orderBy: { donorCount: 'desc' },
  });

  // Get city coordinates for mapping
  const citiesWithCoords = await Promise.all(
    geoData.map(async (data) => {
      // Get a sample donor from this city to get coordinates
      const sampleDonor = await prisma.donor.findFirst({
        where: {
          city: data.city,
          latitude: { not: null },
          longitude: { not: null },
        },
        select: {
          latitude: true,
          longitude: true,
        },
      });

      return {
        ...data,
        latitude: sampleDonor?.latitude,
        longitude: sampleDonor?.longitude,
      };
    })
  );

  res.json({ status: "success", data: citiesWithCoords });
};

// Get blood usage trends
export const getUsageTrends = async (req: Request, res: Response) => {
  const { bloodGroup, days = '30' } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days as string));

  const where = {
    issueDate: {
      gte: startDate,
    },
    ...(bloodGroup && { bloodGroup: bloodGroup as any }),
  };

  // Get blood issues grouped by date
  const issues = await prisma.bloodIssue.findMany({
    where,
    select: {
      issueDate: true,
      bloodGroup: true,
      unitsIssued: true,
      recipientType: true,
    },
    orderBy: { issueDate: 'asc' },
  });

  // Group by date and blood group
  const trendsByDate: { [key: string]: any } = {};
  issues.forEach(issue => {
    const dateKey = issue.issueDate.toISOString().split('T')[0];
    if (!trendsByDate[dateKey]) {
      trendsByDate[dateKey] = {
        date: dateKey,
        totalUnits: 0,
        byBloodGroup: {},
        byRecipientType: {},
      };
    }
    trendsByDate[dateKey].totalUnits += issue.unitsIssued;
    
    // By blood group
    if (!trendsByDate[dateKey].byBloodGroup[issue.bloodGroup]) {
      trendsByDate[dateKey].byBloodGroup[issue.bloodGroup] = 0;
    }
    trendsByDate[dateKey].byBloodGroup[issue.bloodGroup] += issue.unitsIssued;
    
    // By recipient type
    if (!trendsByDate[dateKey].byRecipientType[issue.recipientType]) {
      trendsByDate[dateKey].byRecipientType[issue.recipientType] = 0;
    }
    trendsByDate[dateKey].byRecipientType[issue.recipientType] += issue.unitsIssued;
  });

  const trends = Object.values(trendsByDate);

  res.json({ status: "success", data: trends });
};

// Get seasonal patterns
export const getSeasonalPatterns = async (req: Request, res: Response) => {
  const { bloodGroup, months = '12' } = req.query;

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - parseInt(months as string));

  const where = {
    donationDate: {
      gte: startDate,
    },
    ...(bloodGroup && { bloodGroup: bloodGroup as any }),
  };

  const donations = await prisma.donation.findMany({
    where,
    select: {
      donationDate: true,
      bloodGroup: true,
      units: true,
    },
    orderBy: { donationDate: 'asc' },
  });

  // Group by month
  const patternsByMonth: { [key: string]: any } = {};
  donations.forEach(donation => {
    const monthKey = `${donation.donationDate.getFullYear()}-${String(donation.donationDate.getMonth() + 1).padStart(2, '0')}`;
    if (!patternsByMonth[monthKey]) {
      patternsByMonth[monthKey] = {
        month: monthKey,
        totalDonations: 0,
        totalUnits: 0,
        byBloodGroup: {},
      };
    }
    patternsByMonth[monthKey].totalDonations += 1;
    patternsByMonth[monthKey].totalUnits += donation.units;
    
    if (!patternsByMonth[monthKey].byBloodGroup[donation.bloodGroup]) {
      patternsByMonth[monthKey].byBloodGroup[donation.bloodGroup] = 0;
    }
    patternsByMonth[monthKey].byBloodGroup[donation.bloodGroup] += donation.units;
  });

  const patterns = Object.values(patternsByMonth);

  res.json({ status: "success", data: patterns });
};

// Get demand predictions
export const getPredictions = async (req: Request, res: Response) => {
  const { bloodGroup, days = '7' } = req.query;

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + parseInt(days as string));

  const where = {
    predictionDate: {
      gte: new Date(),
      lte: endDate,
    },
    ...(bloodGroup && { bloodGroup: bloodGroup as any }),
  };

  const predictions = await prisma.analyticsPrediction.findMany({
    where,
    orderBy: { predictionDate: 'asc' },
  });

  res.json({ status: "success", data: predictions });
};

// Get campaign effectiveness
export const getCampaigns = async (req: Request, res: Response) => {
  const { campaignType, startDate, endDate } = req.query;

  const where = {
    ...(campaignType && { campaignType: campaignType as string }),
    ...(startDate && {
      startDate: {
        gte: new Date(startDate as string),
      },
    }),
    ...(endDate && {
      endDate: {
        lte: new Date(endDate as string),
      },
    }),
  };

  const campaigns = await prisma.analyticsCampaign.findMany({
    where,
    orderBy: { startDate: 'desc' },
  });

  // Calculate effectiveness metrics
  const campaignsWithMetrics = campaigns.map(campaign => {
    const donorEffectiveness = campaign.targetDonors > 0 
      ? (campaign.actualDonors / campaign.targetDonors) * 100 
      : 0;
    const unitEffectiveness = campaign.targetUnits > 0 
      ? (campaign.actualUnits / campaign.targetUnits) * 100 
      : 0;
    const costPerDonor = campaign.cost && campaign.actualDonors > 0 
      ? campaign.cost / campaign.actualDonors 
      : null;
    const costPerUnit = campaign.cost && campaign.actualUnits > 0 
      ? campaign.cost / campaign.actualUnits 
      : null;

    return {
      ...campaign,
      metrics: {
        donorEffectiveness: Math.round(donorEffectiveness * 100) / 100,
        unitEffectiveness: Math.round(unitEffectiveness * 100) / 100,
        costPerDonor: costPerDonor ? Math.round(costPerDonor * 100) / 100 : null,
        costPerUnit: costPerUnit ? Math.round(costPerUnit * 100) / 100 : null,
      },
    };
  });

  res.json({ status: "success", data: campaignsWithMetrics });
};

// Create a new campaign
export const createCampaign = async (req: Request, res: Response) => {
  const {
    campaignName,
    campaignType,
    startDate,
    endDate,
    targetDonors,
    targetUnits,
    cost,
    eventId,
  } = req.body;

  if (!campaignName || !campaignType || !startDate) {
    throw new AppError("Missing required fields", 400);
  }

  const campaign = await prisma.analyticsCampaign.create({
    data: {
      campaignName,
      campaignType,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      targetDonors: targetDonors || 0,
      targetUnits: targetUnits || 0,
      cost: cost ? parseFloat(cost) : null,
      eventId,
    },
  });

  res.status(201).json({ status: "success", data: campaign });
};

// Update campaign with actual results
export const updateCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { actualDonors, actualUnits, endDate } = req.body;

  const campaign = await prisma.analyticsCampaign.update({
    where: { id: id as string },
    data: {
      ...(actualDonors !== undefined && { actualDonors: parseInt(actualDonors) }),
      ...(actualUnits !== undefined && { actualUnits: parseInt(actualUnits) }),
      ...(endDate && { endDate: new Date(endDate) }),
    },
  });

  res.json({ status: "success", data: campaign });
};

// Get dashboard overview
export const getDashboardOverview = async (req: Request, res: Response) => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get recent daily summaries
  const recentSummaries = await prisma.analyticsDailySummary.findMany({
    where: {
      date: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: { date: 'desc' },
  });

  // Calculate totals
  const totalDonations = recentSummaries.reduce((sum, s) => sum + s.donationsCount, 0);
  const totalIssues = recentSummaries.reduce((sum, s) => sum + s.issuesCount, 0);
  const totalExpired = recentSummaries.reduce((sum, s) => sum + s.expiredCount, 0);

  // Get donor activity summary
  const activitySummary = await prisma.analyticsDonorActivity.groupBy({
    by: ['activityStatus'],
    _count: {
      activityStatus: true,
    },
  });

  // Get current stock levels
  const stockLevels = await prisma.bloodStockSummary.findMany({
    orderBy: { bloodGroup: 'asc' },
  });

  // Get upcoming predictions
  const predictions = await prisma.analyticsPrediction.findMany({
    where: {
      predictionDate: {
        gte: today,
      },
    },
    orderBy: { predictionDate: 'asc' },
    take: 7,
  });

  res.json({
    status: "success",
    data: {
      summary: {
        totalDonations,
        totalIssues,
        totalExpired,
        period: '30 days',
      },
      donorActivity: activitySummary.map(s => ({
        status: s.activityStatus,
        count: s._count.activityStatus,
      })),
      stockLevels,
      predictions,
    },
  });
};
