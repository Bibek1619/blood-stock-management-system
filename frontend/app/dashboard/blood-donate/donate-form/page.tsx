'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle2, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast as sonnerToast } from "sonner";
import { BLOOD_GROUPS, getDonorById, type BloodGroup, type BloodPack } from "@/lib/data";
import { useData } from "@/lib/data-store";

interface BloodIssueForm {
  donationType: 'person' | 'organization';
  name: string;
  bloodGroup: string;
  units: string;
  contact: string;
}

export default function DonateFormPage() {
  const router = useRouter();
  const { bloodPacks, addDonation, updateBloodPackStatus } = useData();
  
  const [formData, setFormData] = useState<BloodIssueForm>({
    donationType: 'person',
    name: '',
    bloodGroup: '',
    units: '1',
    contact: '',
  });

  const [availablePacks, setAvailablePacks] = useState<BloodPack[]>([]);
  const [selectedPacks, setSelectedPacks] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available blood packs when blood group and units change
  useEffect(() => {
    if (formData.bloodGroup) {
      const unitsNeeded = parseInt(formData.units) || 0;
      
      // Filter ALL available packs for selected blood group
      const packs = bloodPacks
        .filter(pack => 
          pack.bloodGroup === formData.bloodGroup && 
          pack.status === 'Available'
        )
        .sort((a, b) => {
          // Sort by expiry date ASC (FIFO - earliest expiry first)
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        });

      setAvailablePacks(packs);
      
      // Auto-select first N packs based on units needed (FIFO)
      const autoSelected = new Set(packs.slice(0, unitsNeeded).map(p => p.id));
      setSelectedPacks(autoSelected);
    } else {
      setAvailablePacks([]);
      setSelectedPacks(new Set());
    }
  }, [formData.bloodGroup, formData.units, bloodPacks]);

  const handlePackToggle = (packId: string) => {
    const newSelected = new Set(selectedPacks);
    if (newSelected.has(packId)) {
      newSelected.delete(packId);
    } else {
      // Check if we've reached the limit
      const unitsNeeded = parseInt(formData.units) || 0;
      if (newSelected.size < unitsNeeded) {
        newSelected.add(packId);
      } else {
        sonnerToast.error(`You can only select ${unitsNeeded} pack(s)`);
        return;
      }
    }
    setSelectedPacks(newSelected);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.bloodGroup || !formData.units || !formData.contact) {
      sonnerToast.error('Please fill all required fields');
      return;
    }

    const unitsNeeded = parseInt(formData.units) || 0;
    if (selectedPacks.size !== unitsNeeded) {
      sonnerToast.error(`Please select exactly ${unitsNeeded} blood pack(s)`);
      return;
    }

    if (availablePacks.filter(p => p.status === 'Available').length < unitsNeeded) {
      sonnerToast.error('Not enough available blood packs for this blood group');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update selected blood packs to "Used" status
      selectedPacks.forEach(packId => {
        updateBloodPackStatus(packId, 'Used');
      });

      // Add donation record
      addDonation({
        donationType: formData.donationType,
        bloodGroup: formData.bloodGroup,
        units: unitsNeeded,
        donationDate: new Date().toISOString().split('T')[0],
        recipientName: formData.name,
      });

      sonnerToast.success(`Successfully issued ${unitsNeeded} unit(s) of ${formData.bloodGroup} blood to ${formData.name}`);
      
      // Navigate back to blood donate page
      router.push('/dashboard/blood-donate');
    } catch (error) {
      sonnerToast.error('Failed to record blood issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const unitsNeeded = parseInt(formData.units) || 0;
  const availableCount = availablePacks.filter(p => p.status === 'Available').length;
  const hasEnoughStock = availableCount >= unitsNeeded;

  return (
    <div className="w-full p-6 md:p-8 bg-background min-h-[calc(100vh-3.5rem)]" suppressHydrationWarning>
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Donations
      </Button>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Blood Issue Form</h1>
          <p className="text-sm text-slate-500 mt-1">Record blood issuance and select specific blood packs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recipient Information</CardTitle>
              <CardDescription className="text-xs">Enter details of the blood recipient</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="donationType">
                  Donation Type <span className="text-red-600">*</span>
                </Label>
                <Select 
                  value={formData.donationType} 
                  onValueChange={(value: 'person' | 'organization') => 
                    setFormData({ ...formData, donationType: value })
                  }
                >
                  <SelectTrigger id="donationType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="person">Individual</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  {formData.donationType === 'person' ? 'Name' : 'Organization Name'} <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder={formData.donationType === 'person' ? 'Enter recipient name' : 'Enter organization name'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">
                    Blood Group <span className="text-red-600">*</span>
                  </Label>
                  <Select 
                    value={formData.bloodGroup} 
                    onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                  >
                    <SelectTrigger id="bloodGroup">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map((group) => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">
                    Units <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="units"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">
                  Contact <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="contact"
                  placeholder="Phone number or email"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                />
              </div>

              {/* Stock Status Alert */}
              {formData.bloodGroup && formData.units && (
                <div className={`p-3 rounded-lg border ${
                  hasEnoughStock 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {hasEnoughStock ? (
                      <CheckCircle2 size={16} className="text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle size={16} className="text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-xs font-semibold ${
                        hasEnoughStock ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {hasEnoughStock 
                          ? `${availableCount} unit(s) available` 
                          : 'Insufficient stock'
                        }
                      </p>
                      <p className={`text-xs mt-0.5 ${
                        hasEnoughStock ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {hasEnoughStock 
                          ? `You need ${unitsNeeded} unit(s), ${availableCount} available`
                          : `You need ${unitsNeeded} unit(s), only ${availableCount} available`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Available Packs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Blood Packs</CardTitle>
              <CardDescription className="text-xs">
                {formData.bloodGroup 
                  ? `All available ${formData.bloodGroup} packs • Select ${unitsNeeded} • Sorted by expiry (FIFO)`
                  : 'Select blood group to see available packs'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!formData.bloodGroup ? (
                <div className="text-center py-12 text-slate-400">
                  <Package size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select blood group and units to see available packs</p>
                </div>
              ) : availablePacks.length === 0 ? (
                <div className="text-center py-12 text-red-400">
                  <AlertCircle size={48} className="mx-auto mb-3" />
                  <p className="text-sm font-semibold">No available packs for {formData.bloodGroup}</p>
                  <p className="text-xs mt-1">Please check blood stock</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {availablePacks.map((pack, index) => {
                    const isSelected = selectedPacks.has(pack.id);
                    const isExpiringSoon = new Date(pack.expiryDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
                    const donor = getDonorById(pack.donorId);
                    
                    return (
                      <div
                        key={pack.id}
                        onClick={() => handlePackToggle(pack.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-red-500 bg-red-50'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handlePackToggle(pack.id)}
                            className="w-4 h-4 text-red-600 rounded mt-1 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                          
                          <div className="flex-1 min-w-0">
                            {/* Pack Code and Priority Badge */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-sm font-bold text-slate-900">
                                {pack.packCode}
                              </span>
                              {index < unitsNeeded && (
                                <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                                  Priority #{index + 1}
                                </Badge>
                              )}
                              {isExpiringSoon && (
                                <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 border-orange-200">
                                  Expiring Soon
                                </Badge>
                              )}
                            </div>

                            {/* Donor Name */}
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-xs text-slate-500">Donor:</span>
                              <span className="text-xs font-semibold text-slate-700">
                                {donor?.name || 'Unknown'}
                              </span>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Collected</span>
                                <span className="text-xs font-medium text-slate-600">
                                  {new Date(pack.collectionDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Expires</span>
                                <span className={`text-xs font-medium ${
                                  isExpiringSoon ? 'text-orange-600' : 'text-slate-600'
                                }`}>
                                  {new Date(pack.expiryDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Days until expiry */}
                            <div className="mt-1.5">
                              <span className="text-[10px] text-slate-400">
                                {Math.ceil((new Date(pack.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Selection Summary */}
              {availablePacks.length > 0 && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Selected Packs:</span>
                    <span className={`font-bold ${
                      selectedPacks.size === unitsNeeded 
                        ? 'text-green-600' 
                        : 'text-orange-600'
                    }`}>
                      {selectedPacks.size} / {unitsNeeded}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end gap-3">
          <Button 
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            className="bg-[#7F1D1D] hover:bg-[#991B1B]"
            onClick={handleSubmit}
            disabled={
              isSubmitting || 
              !hasEnoughStock || 
              selectedPacks.size !== unitsNeeded ||
              !formData.name ||
              !formData.contact
            }
          >
            {isSubmitting ? 'Recording...' : 'Record Blood Issue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
