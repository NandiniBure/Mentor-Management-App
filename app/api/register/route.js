import { NextResponse } from "next/server";
import prisma from "../../../prisma/prisma"; // Ensure this path is correct
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password, role, skills, interests, bio } = await  req.json();

  

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        skills,
        interests,
        bio,
      },
    });


    // Return a success response
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user:", error);

    return NextResponse.json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
}
