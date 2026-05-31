import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

// Get all pending donor requests
export const getPendingDonorRequests = async (req: Request, res: Response) => {
  try {
    const pendingDonors = await prisma.donor.findMany({
      where: {
        verificationStatus: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: pendingDonors,
    });
  } catch (error) {
    console.error('Error fetching pending donor requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending donor requests',
    });
  }
};

// Get donor request details by ID
export const getDonorRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const donor = await prisma.donor.findUnique({
      where: { id: id as string },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor request not found',
      });
    }

    res.json({
      success: true,
      data: donor,
    });
  } catch (error) {
    console.error('Error fetching donor request details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donor request details',
    });
  }
};

// Approve donor request
export const approveDonorRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const verifiedBy = req.user?.id; // Assuming auth middleware adds user to request

    const donor = await prisma.donor.findUnique({
      where: { id: id as string },
      include: { user: true },
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor request not found',
      });
    }

    if (donor.verificationStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Donor request has already been processed',
      });
    }

    // Update donor status to VERIFIED
    const updatedDonor = await prisma.donor.update({
      where: { id: id as string },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy: verifiedBy || 'ADMIN',
        rejectionReason: null,
      },
      include: {
        user: true,
      },
    });

    // Create notification for the donor
    try {
      await prisma.notification.create({
        data: {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: donor.userId,
          type: 'VERIFICATION_APPROVED',
          title: 'Donor Registration Approved',
          message: 'Congratulations! Your donor registration has been approved. You can now participate in blood donation events.',
          link: '/dashboard',
          isRead: false,
        },
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
      // Continue even if notification fails
    }

    res.json({
      success: true,
      message: 'Donor request approved successfully',
      data: updatedDonor,
    });
  } catch (error) {
    console.error('Error approving donor request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve donor request',
    });
  }
};

// Reject donor request
export const rejectDonorRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const donor = await prisma.donor.findUnique({
      where: { id: id as string },
      include: { user: true },
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor request not found',
      });
    }

    if (donor.verificationStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Donor request has already been processed',
      });
    }

    // Update donor status to REJECTED
    const updatedDonor = await prisma.donor.update({
      where: { id: id as string },
      data: {
        verificationStatus: 'REJECTED',
        rejectionReason: reason,
        verifiedAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    // Create notification for the donor
    try {
      await prisma.notification.create({
        data: {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: donor.userId,
          type: 'VERIFICATION_REJECTED',
          title: 'Donor Registration Rejected',
          message: `Your donor registration has been rejected. Reason: ${reason}`,
          link: '/become-donor',
          isRead: false,
        },
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
      // Continue even if notification fails
    }

    res.json({
      success: true,
      message: 'Donor request rejected successfully',
      data: updatedDonor,
    });
  } catch (error) {
    console.error('Error rejecting donor request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject donor request',
    });
  }
};
