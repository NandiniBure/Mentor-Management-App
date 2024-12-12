import prisma from "../../../prisma/prisma"; // Ensure this path is correct
import { NextResponse } from "next/server";

export async function POST(req) {
	try {
		const body = await req.json(); // Parse the request body
		const { menteeId, mentorId } = body;
		if (!menteeId || !mentorId) {
			return NextResponse.json(
				{ error: "Mentee ID and Mentor ID are required." },
				{ status: 400 }
			);
		}

		// Fetch the mentee and mentor from the database
		const mentee = await prisma.user.findUnique({
			where: { id: menteeId },
		});

		const mentor = await prisma.user.findUnique({
			where: { id: mentorId },
		});

		if (!mentee || !mentor) {
			return NextResponse.json(
				{ error: "Mentee or Mentor not found." },
				{ status: 404 }
			);
		}

		// Update the mentee's sentRequests
		await prisma.user.update({
			where: { id: menteeId },
			data: {
				sentRequests: {
					push: {					
						userId: mentorId,
						timestamp: new Date().toISOString(),
					},
				},
			},
		});

		// // Update the mentor's receivedRequests
		await prisma.user.update({
			where: { id: mentorId },
			data: {
				receivedRequests: {
					push: {
						userId: menteeId,
						timestamp: new Date().toISOString(),
					},
				},
			},
		});

		// Return a success response
		return NextResponse.json(
			{ message: "Connection request sent successfully." },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error in connect handler:", error.message);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
