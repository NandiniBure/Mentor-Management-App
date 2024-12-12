import { NextResponse } from "next/server";
import prisma from "../../../../prisma/prisma"; // Adjust the path to your Prisma client

export async function GET(req, { params }) {
	try {
		// Extract the user ID from the route parameters
		const { id } = await params;

		// Fetch the user by ID
		const user = await prisma.user.findUnique({
			where: {
				id: id, // Assumes `id` is a unique field in your Prisma schema
			},
			select: {
				id: true,
				name: true,
				role: true,
				skills: true,
				interests: true,
				bio: true,
				receivedRequests: true,
				sentRequests: true,
				followers: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Return the user as JSON
		return NextResponse.json(user);
	} catch (error) {
		console.error("Error fetching user by ID:", error.message);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
export async function PUT(req, { params }) {
	try {
		// Extract the user ID from the route parameters
		const { id } = await params;

		// Parse the incoming request body
		const body = await req.json();

		const { name, role, skills, interests, bio } = body;

		// Ensure all fields are logged for debugging

		// Update the user in the database
		const updatedUser = await prisma.user.update({
			where: {
				id: id, // Assumes `id` is a unique field in your Prisma schema
			},
			data: {
				name,
				role,
				skills, // Ensure this matches the data type in your schema (array or string)
				interests, // Ensure this matches the data type in your schema (array or string)
				bio, // Include bio here
			},
			select: {
				id: true,
				name: true,
				role: true,
				skills: true,
				interests: true,
				bio: true, // Ensure bio is selected
			},
		});

		// Return the updated user as JSON
		return NextResponse.json(updatedUser);
	} catch (error) {
		console.error("Error updating user:", error);

		if (error.code === "P2025") {
			// Prisma error for record not found
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
