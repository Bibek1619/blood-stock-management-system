'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateBloodCollection } from '@/lib/queries/bloodWorkflow';
import { toast } from 'sonner';

interface CollectBloodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BLOOD_GROUPS = [
  { value: 'A_POSITIVE', label: 'A+' },
  { value: 'A_NEGATIVE', label: 'A-' },
  { value: 'B_POSITIVE', label: 'B+' },
  { value: 'B_NEGATIVE', label: 'B-' },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
  { value: 'O_POSITIVE', label: 'O+' },
  { value: 'O_NEGATIVE', label: 'O-' },
];

export function CollectBloodDialog({ open, onOpenChange }: CollectBloodDialogProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const createMutation = useCreateBloodCollection();
  const [bloodGroup, setBloodGroup] = useState('');

  const onSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        bloodGroup,
        quantityMl: parseInt(data.quantityMl) || 450,
      });
      toast.success('Blood collection recorded successfully');
      reset();
      setBloodGroup('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Failed to record blood collection', {
        description: error.response?.data?.message || 'Please try again',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Collect Blood</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bloodCode">Blood Code *</Label>
              <Input
                id="bloodCode"
                {...register('bloodCode', { required: true })}
                placeholder="e.g., BLD-2026-001"
              />
              {errors.bloodCode && <span className="text-xs text-red-500">Required</span>}
            </div>
            <div>
              <Label htmlFor="donorName">Donor Name *</Label>
              <Input
                id="donorName"
                {...register('donorName', { required: true })}
                placeholder="Enter donor name"
              />
              {errors.donorName && <span className="text-xs text-red-500">Required</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Blood Group *</Label>
              <Select value={bloodGroup} onValueChange={setBloodGroup} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((group) => (
                    <SelectItem key={group.value} value={group.value}>
                      {group.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantityMl">Quantity (ml)</Label>
              <Input
                id="quantityMl"
                type="number"
                {...register('quantityMl')}
                defaultValue="450"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="collectionDate">Collection Date</Label>
              <Input
                id="collectionDate"
                type="date"
                {...register('collectionDate')}
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="donorId">Donor ID (Optional)</Label>
              <Input
                id="donorId"
                {...register('donorId')}
                placeholder="If donor is registered"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              {...register('remarks')}
              placeholder="Additional notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setBloodGroup('');
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-[#7F1D1D] hover:bg-[#991B1B]"
            >
              {createMutation.isPending ? 'Saving...' : 'Collect Blood'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
