import { NextResponse } from "next/server";
import { isDbConfigured, connectDB } from "@/lib/mongodb";
import { User } from "@/models";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json([
      {
        id: "u_zain",
        name: "Zain Ali",
        email: "zain@practice365.test",
        defaultHourlyRate: 300
      },
      {
        id: "u_sarah",
        name: "Sarah Lee",
        email: "sarah@practice365.test",
        defaultHourlyRate: 350
      },
      {
        id: "u_david",
        name: "David Kim",
        email: "david@practice365.test",
        defaultHourlyRate: 300
      }
    ]);
  }

  try {
    await connectDB();

    // Ensure Zain Ali exists in the database
    let zain = await User.findOne({ name: "Zain Ali" });
    if (!zain) {
      zain = await User.create({
        name: "Zain Ali",
        email: "zain@practice365.test",
        role: "attorney",
        defaultHourlyRate: 300
      });
    }

    const users = await User.find().lean();
    const formatted = users.map((u: any) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      defaultHourlyRate: u.defaultHourlyRate
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json([
      {
        id: "60d5ec4b868e822d64f028b0",
        name: "Zain Ali",
        email: "zain@practice365.test",
        defaultHourlyRate: 300
      }
    ]);
  }
}
