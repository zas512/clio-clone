import { connectDB } from "@/lib/mongodb";
import { Deadline, Invoice, Lead, Matter } from "@/models";
import type {
  Deadline as DeadlineDTO,
  Invoice as InvoiceDTO,
  Lead as LeadDTO,
  Matter as MatterDTO
} from "@/types";
import { mockDeadlines, mockInvoices, mockLeads, mockMatters } from "@/data";
import { isDbConfigured } from "../mongodb";

const STALE_THRESHOLD_DAYS = 14;

type PopulatedMatter = {
  _id: { toString(): string };
  name: string;
  status: string;
  retainerCollected: boolean;
  retainerAmount?: number;
  lastActivityAt: Date;
  clientId?: { contactName: string } | null;
  practiceAreaId?: { name: string } | null;
  responsibleAttorneyId?: { name: string } | null;
};

type PopulatedDeadline = {
  _id: { toString(): string };
  title: string;
  dueAt: Date;
  matterId?: { _id?: { toString(): string }; name?: string } | null;
};

function daysSince(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function daysOverdue(dueAt: Date | string) {
  const diff = Date.now() - new Date(dueAt).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export type DashboardData = {
  matters: MatterDTO[];
  deadlines: DeadlineDTO[];
  invoices: InvoiceDTO[];
  leads: LeadDTO[];
  source: "mongodb" | "mock";
};

export async function getDashboardData(): Promise<DashboardData> {
  try {
    await connectDB();

    const [matters, deadlines, invoices, leads] = await Promise.all([
      Matter.find()
        .populate("clientId")
        .populate("practiceAreaId")
        .populate("responsibleAttorneyId")
        .lean(),
      Deadline.find({ completedAt: null, isDeadline: true })
        .populate("matterId")
        .lean(),
      Invoice.find({ status: "Overdue" }).lean(),
      Lead.find({ status: "New" }).lean()
    ]);

    const typedMatters = matters as unknown as PopulatedMatter[];

    if (typedMatters.length === 0) {
      return { ...getMockDashboard(), source: "mock" };
    }

    const matterMap = new Map(
      typedMatters.map((m) => [m._id.toString(), m.name])
    );

    const typedDeadlines = deadlines as unknown as PopulatedDeadline[];

    return {
      source: "mongodb",
      matters: typedMatters.map((m) => ({
        id: m._id.toString(),
        name: m.name,
        clientName: m.clientId?.contactName ?? "Unknown",
        practiceArea: m.practiceAreaId?.name ?? "",
        responsibleAttorney: m.responsibleAttorneyId?.name ?? "",
        status: m.status,
        retainerCollected: m.retainerCollected,
        retainerAmount: m.retainerAmount ?? 0,
        lastActivityAt: new Date(m.lastActivityAt).toISOString().slice(0, 10)
      })),
      deadlines: typedDeadlines
        .filter((d) => daysOverdue(d.dueAt) > 0)
        .map((d) => ({
          id: d._id.toString(),
          matterId: d.matterId?._id?.toString() ?? "",
          matterName:
            d.matterId?.name ??
            matterMap.get(d.matterId?._id?.toString() ?? "") ??
            "Unknown",
          title: d.title,
          dueAt: new Date(d.dueAt).toISOString().slice(0, 10),
          daysOverdue: daysOverdue(d.dueAt)
        }))
        .sort((a, b) => b.daysOverdue - a.daysOverdue),
      invoices: await Promise.all(
        invoices.map(async (inv) => {
          const matter = (await Matter.findById(inv.matterId)
            .populate("clientId")
            .lean()) as unknown as PopulatedMatter | null;
          return {
            id: inv._id.toString(),
            matterId: inv.matterId.toString(),
            matterName: matter?.name ?? "",
            clientName: matter?.clientId?.contactName ?? "",
            total: inv.total,
            dueAt: inv.dueAt
              ? new Date(inv.dueAt).toISOString().slice(0, 10)
              : "",
            daysOverdue: inv.dueAt ? daysOverdue(inv.dueAt) : 0,
            status: inv.status as InvoiceDTO["status"]
          };
        })
      ),
      leads: leads.map((l) => ({
        id: l._id.toString(),
        contactName: l.contactName,
        matterDescription: l.matterDescription,
        referralSource: l.referralSource,
        status: l.status as LeadDTO["status"],
        receivedAt: new Date(l.receivedAt).toISOString().slice(0, 10)
      }))
    };
  } catch {
    return { ...getMockDashboard(), source: "mock" };
  }
}

function getMockDashboard(): Omit<DashboardData, "source"> {
  return {
    matters: mockMatters,
    deadlines: mockDeadlines,
    invoices: mockInvoices,
    leads: mockLeads
  };
}

export async function getMattersForTimer(): Promise<MatterDTO[]> {
  if (!isDbConfigured()) return mockMatters;

  try {
    await connectDB();
    const matters = (await Matter.find({ engagementSigned: true })
      .populate("clientId")
      .populate("practiceAreaId")
      .populate("responsibleAttorneyId")
      .lean()) as unknown as PopulatedMatter[];

    // empty result is a real, valid state — return it as-is
    return matters.map((m) => ({
      id: m._id.toString(),
      name: m.name,
      clientName: m.clientId?.contactName ?? "",
      practiceArea: m.practiceAreaId?.name ?? "",
      responsibleAttorney: m.responsibleAttorneyId?.name ?? "",
      status: m.status,
      retainerCollected: m.retainerCollected,
      retainerAmount: m.retainerAmount ?? 0,
      lastActivityAt: new Date(m.lastActivityAt).toISOString().slice(0, 10)
    }));
  } catch {
    // DB connection genuinely failed mid-request — this is the legitimate fallback case
    return mockMatters;
  }
}

export { STALE_THRESHOLD_DAYS, daysSince };
