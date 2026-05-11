import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EventStatus } from "@/lib/queries/events";
import type { EventFormState } from "./types";

const ALL_STATUSES: EventStatus[] = ["UPCOMING", "RUNNING", "COMPLETED", "CANCELLED"];

interface EventCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: EventFormState;
  onFormChange: (nextForm: EventFormState) => void;
  onCreate: () => void;
}

export function EventCreateDialog({ open, onOpenChange, form, onFormChange, onCreate }: EventCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="event-title">Title <span className="text-red-600">*</span></Label>
            <Input
              id="event-title"
              type="text"
              placeholder="Event title"
              value={form.title}
              onChange={(event) => onFormChange({ ...form, title: event.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="event-date">Date <span className="text-red-600">*</span></Label>
              <Input
                id="event-date"
                type="date"
                value={form.eventDate}
                onChange={(event) => onFormChange({ ...form, eventDate: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="event-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => onFormChange({ ...form, status: value as EventStatus })}
              >
                <SelectTrigger id="event-status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="event-location">Location <span className="text-red-600">*</span></Label>
              <Input
                id="event-location"
                type="text"
                placeholder="Venue / Address"
                value={form.location}
                onChange={(event) => onFormChange({ ...form, location: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="event-capacity">Capacity</Label>
              <Input
                id="event-capacity"
                type="number"
                placeholder="Max participants"
                value={form.capacity ?? ""}
                onChange={(event) => onFormChange({ ...form, capacity: event.target.value ? parseInt(event.target.value) : undefined })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              placeholder="Optional details about the event…"
              value={form.description}
              onChange={(event) => onFormChange({ ...form, description: event.target.value })}
            />
          </div>

          <Button type="button" onClick={onCreate} className="w-full bg-red-800 text-white hover:bg-red-900">
            Create Event
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
