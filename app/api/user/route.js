import { NextResponse } from "next/server";
import prisma from "../../../prisma/prisma"; // Adjust the path if needed

export  async function GET(req) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          role: true,
          skills: true,
          interests: true,
          // Ensure this field exists in your Prisma schema
        },
      });

      return NextResponse.json(users)
    } catch (error) {
      console.error("Error fetching users:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }

