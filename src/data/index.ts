import { Matter, Deadline, Invoice, Lead } from "@/types";

export const mockMatters: Matter[] = [
  {
    id: "m1",
    name: "Smith v. Johnson - Divorce",
    clientName: "Alex Smith",
    practiceArea: "Family Law",
    responsibleAttorney: "Sarah Lee",
    status: "Active",
    retainerCollected: false,
    retainerAmount: 2500,
    lastActivityAt: "2026-05-28"
  },
  {
    id: "m2",
    name: "Patel Estate Plan",
    clientName: "Raj Patel",
    practiceArea: "Estate Planning",
    responsibleAttorney: "Sarah Lee",
    status: "Active",
    retainerCollected: true,
    retainerAmount: 1500,
    lastActivityAt: "2026-06-15"
  },
  {
    id: "m3",
    name: "Nguyen Immigration Petition",
    clientName: "Linh Nguyen",
    practiceArea: "Immigration",
    responsibleAttorney: "David Kim",
    status: "Awaiting Client",
    retainerCollected: true,
    retainerAmount: 3000,
    lastActivityAt: "2026-06-01"
  }
];

export const mockDeadlines: Deadline[] = [
  {
    id: "d1",
    matterId: "m1",
    matterName: "Smith v. Johnson - Divorce",
    title: "Response to motion due",
    dueAt: "2026-06-10",
    daysOverdue: 10
  },
  {
    id: "d2",
    matterId: "m3",
    matterName: "Nguyen Immigration Petition",
    title: "Filing deadline",
    dueAt: "2026-06-17",
    daysOverdue: 3
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: "inv1",
    matterId: "m2",
    matterName: "Patel Estate Plan",
    clientName: "Raj Patel",
    total: 1200,
    dueAt: "2026-06-05",
    daysOverdue: 15,
    status: "Overdue"
  }
];

export const mockLeads: Lead[] = [
  {
    id: "l1",
    contactName: "Maria Gomez",
    matterDescription: "Personal injury - car accident",
    referralSource: "Website",
    status: "New",
    receivedAt: "2026-06-18"
  },
  {
    id: "l2",
    contactName: "Tom Becker",
    matterDescription: "Small business formation",
    referralSource: "Referral - Jane Doe",
    status: "New",
    receivedAt: "2026-06-19"
  }
];
