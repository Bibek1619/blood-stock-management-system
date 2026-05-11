import * as XLSX from 'xlsx';

/**
 * Export data to Excel file
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 * @param sheetName - Name of the sheet in Excel
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string = 'export',
  sheetName: string = 'Sheet1'
) {
  try {
 
    const workbook = XLSX.utils.book_new();

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-size columns
    const maxWidth = 50;
    const columnWidths = Object.keys(data[0] || {}).map(key => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, maxWidth) };
    });
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`);

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
}

/**
 * Export blood issues data to Excel with detailed formatting
 */
export function exportBloodIssuesToExcel(bloodIssues: any[]) {
  const formattedData = bloodIssues.map((issue, index) => ({
    'No.': index + 1,
    'Issue Date': new Date(issue.issueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    'Blood Group': issue.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-'),
    'Units Issued': issue.unitsIssued,
    'Recipient Type': issue.recipientType,
    'Recipient Name': issue.recipientName,
    'Recipient Contact': issue.recipientContact || 'N/A',
    'Hospital/Organization': issue.hospitalName || 'N/A',
    'Purpose': issue.purpose || 'N/A',
    'Status': issue.status,
    'Issued By': issue.issuedBy || 'N/A',
    'Notes': issue.notes || 'N/A',
    'Created At': new Date(issue.createdAt).toLocaleString('en-US'),
  }));

  const filename = `Blood_Issues_Report_${new Date().toISOString().split('T')[0]}`;
  return exportToExcel(formattedData, filename, 'Blood Issues');
}

/**
 * Export blood packs data to Excel with donor details
 */
export function exportBloodPacksToExcel(bloodPacks: any[]) {
  const formattedData = bloodPacks.map((pack, index) => ({
    'No.': index + 1,
    'Pack Code': pack.packCode,
    'Blood Group': pack.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-'),
    'Status': pack.status,
    'Collection Date': new Date(pack.collectionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    'Expiry Date': new Date(pack.expiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    'Storage Location': pack.storageLocation || 'N/A',
    'Donor Name': pack.donor?.user?.name || 'N/A',
    'Donor Phone': pack.donor?.user?.phone || 'N/A',
    'Donor Location': pack.donor?.location || 'N/A',
    'Donor City': pack.donor?.city || 'N/A',
    'Donor Total Donations': pack.donor?.totalDonations || 0,
    'Days Until Expiry': Math.ceil(
      (new Date(pack.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    ),
  }));

  const filename = `Blood_Packs_Report_${new Date().toISOString().split('T')[0]}`;
  return exportToExcel(formattedData, filename, 'Blood Packs');
}

/**
 * Export donors data to Excel
 */
export function exportDonorsToExcel(donors: any[]) {
  const formattedData = donors.map((donor, index) => ({
    'No.': index + 1,
    'Name': donor.user?.name || 'N/A',
    'Email': donor.user?.email || 'N/A',
    'Phone': donor.user?.phone || 'N/A',
    'Blood Group': donor.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-'),
    'Donor Type': donor.donorType || 'PERSON',
    'Location': donor.location || 'N/A',
    'City': donor.city || 'N/A',
    'Address': donor.address || 'N/A',
    'Date of Birth': donor.dateOfBirth
      ? new Date(donor.dateOfBirth).toLocaleDateString('en-US')
      : 'N/A',
    'Weight (kg)': donor.weight || 'N/A',
    'Total Donations': donor.totalDonations,
    'Last Donation': donor.lastDonationDate
      ? new Date(donor.lastDonationDate).toLocaleDateString('en-US')
      : 'Never',
    'Eligible': donor.isEligible ? 'Yes' : 'No',
    'Verified': donor.user?.isVerified ? 'Yes' : 'No',
    'Registered Date': new Date(donor.user?.createdAt || donor.createdAt).toLocaleDateString(
      'en-US'
    ),
  }));

  const filename = `Donors_Report_${new Date().toISOString().split('T')[0]}`;
  return exportToExcel(formattedData, filename, 'Donors');
}

/**
 * Export donations data to Excel
 */
export function exportDonationsToExcel(donations: any[]) {
  const formattedData = donations.map((donation, index) => ({
    'No.': index + 1,
    'Donation Date': new Date(donation.donationDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    'Donor Name': donation.user?.name || 'N/A',
    'Donor Phone': donation.user?.phone || 'N/A',
    'Blood Group': donation.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-'),
    'Units': donation.units,
    'Donation Type': donation.donationType,
    'Location': donation.location || 'N/A',
    'Storage Location': donation.storageLocation || 'N/A',
    'Status': donation.status,
    'Contact': donation.contact || 'N/A',
    'Notes': donation.notes || 'N/A',
    'Blood Packs': donation.bloodPacks?.map((p: any) => p.packCode).join(', ') || 'N/A',
  }));

  const filename = `Donations_Report_${new Date().toISOString().split('T')[0]}`;
  return exportToExcel(formattedData, filename, 'Donations');
}
