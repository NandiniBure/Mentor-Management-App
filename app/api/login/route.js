import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../../prisma/prisma"; // Ensure this path is correct
import { NextResponse } from "next/server";

export async function POST(req) {
	try {
		const body = await req.json(); // Parse the request body
		const { email, password } = body;

		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required." },
				{ status: 400 }
			);
		}

		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (user && (await bcrypt.compare(password, user.password))) {
			if (!process.env.JWT_SECRET) {
				throw new Error("JWT_SECRET is not defined in environment variables.");
			}

			const token = jwt.sign(
				{ id: user.id, email: user.email },
				process.env.JWT_SECRET,
				{ expiresIn: "1d" }
			);

			// Return the token and user data
			return NextResponse.json(
				{
					token,
					user: {
						id: user.id,
						email: user.email,
						name: user.name,
						role: user.role,
					},
				},
				{ status: 200 }
			);
		} else {
			return NextResponse.json(
				{ error: "Invalid email or password." },
				{ status: 401 }
			);
		}
	} catch (error) {
		console.error("Error in login handler:", error.message);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
