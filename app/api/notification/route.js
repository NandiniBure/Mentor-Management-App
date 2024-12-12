import { NextResponse } from "next/server";
import prisma from "../../../prisma/prisma";

export async function POST(req) {
	try {
		const body = await req.json(); // Parse the JSON body

		const { currentUserId, requestId } = body;
		if (!currentUserId || !requestId) {
			return NextResponse.json(
				{ error: "currentUserId and requestId are required" },
				{ status: 400 }
			);
		}
		// Fetch the current user's receivedRequests
		const user = await prisma.user.findUnique({
			where: { id: currentUserId, role: "mentor" },
			select: { id: true, receivedRequests: true, followers: true },
		});
		const senderUser = await prisma.user.findUnique({
			where: { id: requestId, role: "mentee" },
			select: { id: true, sentRequests: true, followers: true },
		});

		if (!user || !senderUser) {
			return NextResponse.json(
				{ error: "User not found or receivedRequests is invalid" },
				{ status: 404 }
			);
		}

		// Update the status of the matching request
		const updatedMentorRequests = user.receivedRequests.filter(
			(request) => request.userId != requestId
		);
		const updatedFollowerList = user.followers;
		updatedFollowerList.push(requestId);

		const updatedRequesterSentRequestArray = senderUser.sentRequests.filter(
			(request) => request.userId != currentUserId
		);
		// const updatedRequesterSentRequestArray = senderUser.sentRequests.map(
		// 	(request) =>
		// 		request.userId === currentUserId
		// 			? { ...request, status: "Accepted" }
		// 			: request
		// );
		const updatedConnectionList = senderUser.followers;
		updatedConnectionList.push(currentUserId);

		// Save the updated requests back to the database
		const updatedUser = await prisma.user.update({
			where: { id: currentUserId },
			data: {
				receivedRequests: updatedMentorRequests,
				followers: updatedFollowerList,
			},
		});
		const updatedRequestedUser = await prisma.user.update({
			where: { id: requestId },
			data: {
				sentRequests: updatedRequesterSentRequestArray,
				followers: updatedConnectionList,
			},
		});

		return NextResponse.json(
			{ message: "Request accepted successfully", updatedUser },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error updating receivedRequests:", error.message);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			console.error("Error: User ID is missing.");
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}
		// Fetch user data
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				role: true,
				sentRequests: true,
				receivedRequests: true,
				followers: true,
			},
		});

		if (!user) {
			console.error(`Error: User with ID ${userId} not found.`);
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		let usersArray = [];

		if (user.role.toLowerCase() === "mentor") {
			// Check if `receivedRequests` is an object or array
			const receivedRequests = user.receivedRequests || [];

			// Filter pending requests and extract `senderId`
			const pendingRequestIds = receivedRequests.map((req) => req.userId);
			const followersIds = user.followers;

			if (followersIds.length > 0) {
				const followerUsers = await prisma.user.findMany({
					where: { id: { in: followersIds } },
					select: {
						id: true,
						name: true,
						email: true,
						role: true,
					},
				});
				if (followerUsers.length > 0) {
					usersArray.push(
						...followerUsers.map((obj) => ({
							...obj,
							status: "Follower",
						}))
					);
				}
			}
			// Fetch users if there are pending requests
			if (pendingRequestIds.length > 0) {
				const requestedUsers = await prisma.user.findMany({
					where: { id: { in: pendingRequestIds } },
					select: {
						id: true,
						name: true,
						email: true,
						role: true,
					},
				});
				if (requestedUsers.length > 0) {
					usersArray.push(
						...requestedUsers.map((obj) => ({
							...obj,
							status: "Requested",
						}))
					);
				}
			}
		} else if (user.role.toLowerCase() === "mentee") {
			// For mentees, fetch users for whom requests have been "accepted"
			const sentRequests = user.sentRequests || [];

			const pendingRequestIds = sentRequests.map((req) => req.userId);
			const acceptedRequestIds = user.followers;

			const acceptedUsers = await prisma.user.findMany({
				where: { id: { in: acceptedRequestIds } },
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
				},
			});
			if (acceptedUsers.length > 0) {
				usersArray.push(
					...acceptedUsers.map((obj) => ({
						...obj,
						status: "Accepted",
					}))
				);
			}

			const pendingUsers = await prisma.user.findMany({
				where: { id: { in: pendingRequestIds } },
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
				},
			});
			if (pendingUsers.length > 0) {
				usersArray.push(
					...pendingUsers.map((obj) => ({
						...obj,
						status: "Pending",
					}))
				);
			}
		}


		// Return only the array of relevant users
		return NextResponse.json(usersArray, { status: 200 });
	} catch (error) {
		console.error("Error in /api/notifications:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
