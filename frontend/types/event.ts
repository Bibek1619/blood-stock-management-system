export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  eventDate: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  capacity: number | null;
  createdAt: string;
  updatedAt: string;
  participants?: EventParticipant[];
  volunteers?: EventVolunteer[];
  _count?: {
    participants: number;
    volunteers: number;
  };
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface EventVolunteer {
  id: string;
  eventId: string;
  userId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  role: string | null;
  registeredAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}
