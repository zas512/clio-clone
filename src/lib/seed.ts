import { connectDB } from "@/lib/mongodb";
import {
  Client,
  Deadline,
  Invoice,
  Lead,
  Matter,
  PracticeArea,
  User
} from "@/models";

export async function seedDatabase() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    PracticeArea.deleteMany({}),
    Client.deleteMany({}),
    Lead.deleteMany({}),
    Matter.deleteMany({}),
    Deadline.deleteMany({}),
    Invoice.deleteMany({})
  ]);

  const sarah = await User.create({
    name: "Sarah Lee",
    email: "sarah@practice365.test",
    role: "attorney",
    defaultHourlyRate: 350
  });

  const david = await User.create({
    name: "David Kim",
    email: "david@practice365.test",
    role: "attorney",
    defaultHourlyRate: 300
  });

  const familyLaw = await PracticeArea.create({
    name: "Family Law",
    defaultHourlyRate: 350,
    statuses: ["Intake", "Active", "Awaiting Client", "Closed"]
  });

  const estatePlanning = await PracticeArea.create({
    name: "Estate Planning",
    defaultHourlyRate: 325
  });

  const immigration = await PracticeArea.create({
    name: "Immigration",
    defaultHourlyRate: 300
  });

  const alex = await Client.create({
    contactName: "Alex Smith",
    email: "alex@example.com",
    portalEnabled: true
  });

  const raj = await Client.create({
    contactName: "Raj Patel",
    email: "raj@example.com",
    portalEnabled: true
  });

  const linh = await Client.create({
    contactName: "Linh Nguyen",
    email: "linh@example.com",
    portalEnabled: true
  });

  const m1 = await Matter.create({
    name: "Smith v. Johnson - Divorce",
    clientId: alex._id,
    practiceAreaId: familyLaw._id,
    responsibleAttorneyId: sarah._id,
    status: "Active",
    retainerCollected: false,
    retainerAmount: 2500,
    lastActivityAt: new Date("2026-05-28"),
    engagementSigned: true
  });

  const m2 = await Matter.create({
    name: "Patel Estate Plan",
    clientId: raj._id,
    practiceAreaId: estatePlanning._id,
    responsibleAttorneyId: sarah._id,
    status: "Active",
    retainerCollected: true,
    retainerAmount: 1500,
    retainerCollectedAmount: 1500,
    retainerCollectedAt: new Date("2026-06-01"),
    lastActivityAt: new Date("2026-06-15"),
    engagementSigned: true
  });

  const m3 = await Matter.create({
    name: "Nguyen Immigration Petition",
    clientId: linh._id,
    practiceAreaId: immigration._id,
    responsibleAttorneyId: david._id,
    status: "Awaiting Client",
    retainerCollected: true,
    retainerAmount: 3000,
    retainerCollectedAmount: 3000,
    lastActivityAt: new Date("2026-06-01"),
    engagementSigned: true
  });

  await Deadline.create([
    {
      matterId: m1._id,
      title: "Response to motion due",
      dueAt: new Date("2026-06-10"),
      assignedToId: sarah._id
    },
    {
      matterId: m3._id,
      title: "Filing deadline",
      dueAt: new Date("2026-06-17"),
      assignedToId: david._id
    }
  ]);

  await Invoice.create({
    matterId: m2._id,
    clientId: raj._id,
    status: "Overdue",
    total: 1200,
    dueAt: new Date("2026-06-05")
  });

  await Lead.create([
    {
      contactName: "Maria Gomez",
      matterDescription: "Personal injury - car accident",
      referralSource: "Website",
      status: "New",
      receivedAt: new Date("2026-06-18")
    },
    {
      contactName: "Tom Becker",
      matterDescription: "Small business formation",
      referralSource: "Referral - Jane Doe",
      status: "New",
      receivedAt: new Date("2026-06-19")
    }
  ]);

  return {
    users: 2,
    matters: 3,
    leads: 2,
    message: "Database seeded with demo data"
  };
}
