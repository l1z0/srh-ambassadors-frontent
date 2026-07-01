export type EventStatus = "register" | "waitlisted" | "registered";

export interface EventItem {
  id: number;
  eventName: string;
  club: string;
  eventDate: string;
  time: string;
  location: string;
  status: EventStatus;
}
