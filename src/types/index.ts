export type Matter = {
  id: string;
  name: string;
  clientName: string;
  practiceArea: string;
  responsibleAttorney: string;
  status: string;
  retainerCollected: boolean;
  retainerAmount: number;
  lastActivityAt: string;
};

export type Deadline = {
  id: string;
  matterId: string;
  matterName: string;
  title: string;
  dueAt: string;
  daysOverdue: number;
};

export type Invoice = {
  id: string;
  matterId: string;
  matterName: string;
  clientName: string;
  total: number;
  dueAt: string;
  daysOverdue: number;
  status: "Draft" | "Sent" | "Paid" | "Partially Paid" | "Overdue";
};

export type Lead = {
  id: string;
  contactName: string;
  matterDescription: string;
  referralSource: string;
  status:
    | "New"
    | "Contacted"
    | "Engagement Sent"
    | "Converted"
    | "Declined"
    | "Lost";
  receivedAt: string;
};
