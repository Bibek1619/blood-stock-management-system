'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCreateOrUpdateBloodTest } from '@/lib/queries/bloodWorkflow';
import { toast } from 'sonner';

interface TestBloodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: any;
}

export function TestBloodDialog({ open, onOpenChange, collection }: TestBloodDialogProps) {
  const { register, handleSubmit, reset } = useForm();
  const testMutation = useCreateOrUpdateBloodTest();
  
  const [testResults, setTestResults] = useState({
    hiv: false,
    hepatitisB: false,
    hepatitisC: false,
    malaria: false,
    syphilis: false,
  });
  
  const [status, setStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');

  const onSubmit = async (data: any) => {
    try {
      await testMutation.mutateAsync({
        collectionId: collection.id,
        data: {
          ...testResults,
          description: data.description,
          status,
        },
      });
      toast.success(`Blood ${status.toLowerCase()} successfully`);
      reset();
      setTestResults({
        hiv: false,
        hepatitisB: false,
        hepatitisC: false,
        malaria: false,
        syphilis: false,
      });
      setStatus('APPROVED');
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Failed to save test results', {
        description: error.response?.data?.message || 'Please try again',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Test Blood Sample</DialogTitle>
        </DialogHeader>
        <div className='overflow-y-auto flex-1 pr-2'>
        <form id="test-blood-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-semibold">Blood Code:</span> {collection?.bloodCode}</div>
              <div><span className="font-semibold">Donor:</span> {collection?.donorName}</div>
              <div><span className="font-semibold">Blood Group:</span> {collection?.bloodGroup}</div>
              <div><span className="font-semibold">Quantity:</span> {collection?.quantityMl} ml</div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Test Results</Label>
            <p className="text-sm text-slate-600">Check if disease detected (leave unchecked if negative)</p>
            
            <div className="space-y-3 pl-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hiv"
                  checked={testResults.hiv}
                  onCheckedChange={(checked) => 
                    setTestResults(prev => ({ ...prev, hiv: checked as boolean }))
                  }
                />
                <label htmlFor="hiv" className="text-sm font-medium">HIV Positive</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hepatitisB"
                  checked={testResults.hepatitisB}
                  onCheckedChange={(checked) => 
                    setTestResults(prev => ({ ...prev, hepatitisB: checked as boolean }))
                  }
                />
                <label htmlFor="hepatitisB" className="text-sm font-medium">Hepatitis B Positive</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hepatitisC"
                  checked={testResults.hepatitisC}
                  onCheckedChange={(checked) => 
                    setTestResults(prev => ({ ...prev, hepatitisC: checked as boolean }))
                  }
                />
                <label htmlFor="hepatitisC" className="text-sm font-medium">Hepatitis C Positive</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="malaria"
                  checked={testResults.malaria}
                  onCheckedChange={(checked) => 
                    setTestResults(prev => ({ ...prev, malaria: checked as boolean }))
                  }
                />
                <label htmlFor="malaria" className="text-sm font-medium">Malaria Positive</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="syphilis"
                  checked={testResults.syphilis}
                  onCheckedChange={(checked) => 
                    setTestResults(prev => ({ ...prev, syphilis: checked as boolean }))
                  }
                />
                <label htmlFor="syphilis" className="text-sm font-medium">Syphilis Positive</label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Final Decision</Label>
            <RadioGroup value={status} onValueChange={(value) => setStatus(value as 'APPROVED' | 'REJECTED')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="APPROVED" id="approved" />
                <label 
                  htmlFor="approved" 
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Approved - Blood is safe for use
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="REJECTED" id="rejected" />
                <label 
                  htmlFor="rejected" 
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  Rejected - Blood is not safe
                </label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="description">Test Description / Notes</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Additional notes about the test"
              rows={4}
            />
          </div>

          {status === 'REJECTED' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ This blood will be REJECTED and moved to rejected blood page
              </p>
            </div>
          )}

          {status === 'APPROVED' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 font-medium">
                ✓ This blood will be APPROVED and ready to move to stock
              </p>
            </div>
          )}

        </form>
        </div>
        <div className="flex justify-end gap-2 pt-4 pb-6 px-6 border-t flex-shrink-0 bg-white">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setTestResults({
                  hiv: false,
                  hepatitisB: false,
                  hepatitisC: false,
                  malaria: false,
                  syphilis: false,
                });
                setStatus('APPROVED');
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="test-blood-form"
              disabled={testMutation.isPending}
              className={status === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {testMutation.isPending ? 'Saving...' : `Submit as ${status}`}
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  );
}
