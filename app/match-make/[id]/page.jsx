"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function Matchmaking() {
	const [users, setUsers] = useState([]);
	const [matches, setMatches] = useState([]);
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const params = useParams(); // Use `useParams` hook
	const id = params?.id; // Safely extract `id` from params
	const route = useRouter();
	useEffect(() => {
		if (!id) return; // Wait for `id` to be available
		async function fetchUsersAndCurrentUser() {
			try {
				// Fetch all users
				const usersResponse = await fetch(
          "https://mentor-management-app-i5un-plsex674r-nandinibures-projects.vercel.app/api/user"
        );
				if (!usersResponse.ok) {
					throw new Error("Failed to fetch users");
				}
				const usersData = await usersResponse.json();
				setUsers(usersData);

				// Fetch current user based on ID from params
				const currentUserResponse = await fetch(
          `https://mentor-management-app-i5un-plsex674r-nandinibures-projects.vercel.app/api/user/${id}`
        );
				if (!currentUserResponse.ok) {
					throw new Error("Failed to fetch current user");
				}
				const currentUserData = await currentUserResponse.json();
				setCurrentUser(currentUserData);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}
		fetchUsersAndCurrentUser();
	}, [id]);

	// Calculate matches dynamically
	useEffect(() => {
		if (users.length && currentUser) {
			const calculatedMatches = calculateMatches(users, currentUser);
			setMatches(calculatedMatches);
		}
	}, [users, currentUser]);

	// Function to calculate match percentage
	const calculateMatches = (users, currentUser) => {
		return users
			.filter((user) => user.role !== currentUser.role) // Only match Mentor with Mentee
			.map((user) => {
				// Split skills and interests (handle strings or empty objects)
				const userSkills =
					user.skills.length > 0
						? user.skills.map((skill) => skill.trim())
						: [];

				const userInterests =
					typeof user.interests === "string"
						? user.interests
								.toLowerCase()
								.split(",")
								.map((interest) => interest.trim())
						: [];
				// Calculate skill match
				const skillMatch =
					userSkills.length > 0 && currentUser.skills?.length > 0
						? userSkills.filter((skill) => currentUser.skills.includes(skill))
								.length / userSkills.length
						: 0;
				// Calculate interest match
				const interestMatch =
					userInterests.length > 0 && currentUser.interests?.length > 0
						? userInterests.filter((interest) =>
								currentUser.interests.includes(interest)
						  ).length / userInterests.length
						: 0;
				// Overall match percentage (weighted average)
				const matchPercentage = Math.round(
					(skillMatch * 0.7 + interestMatch * 0.3) * 100
				);

				return { ...user, matchPercentage };
			})
			.sort((a, b) => b.matchPercentage - a.matchPercentage); // Sort by highest match
	};

	if (loading) return <p>Loading...</p>;
	if (error) return <p className='text-red-500'>{error}</p>;

	return (
		<div
			className='min-h-screen bg-cover bg-center relative text-white'
			style={{
				backgroundImage: `url('/image.png')`, // Replace with your background image
			}}
		>
			{/* Background Overlay */}
			<div className='absolute inset-0 bg-black bg-opacity-60'></div>

			{/* Grid Section */}
			<div className='relative z-10 px-8 py-12'>
				<h1 className='text-4xl font-bold text-center mb-8'>Matchmaking</h1>
				<div>
					<button
						onClick={() => {
							route.push("/discover");
						}}
					>
						Back
					</button>
				</div>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
					{matches
						.filter((match) => match.matchPercentage > 0) // Filter matches with 70% or higher
						.map((match) => (
							<div
								key={match.id}
								className='bg-gray-800 bg-opacity-80 rounded-lg shadow-lg p-6'
							>
								{/* Profile Image */}
								<div
									className='h-40 w-full rounded-md bg-cover bg-center mb-6'
									style={{
										backgroundImage: `url('${
											match.profileImage || "/profile.png"
										}')`,
									}}
								></div>

								{/* Match Details */}
								<h2 className='text-2xl font-bold'>{match.name}</h2>
								<p className='text-sm text-gray-400'>{match.role}</p>
								<p className='mt-2 text-green-400 font-semibold'>
									Match: {match.matchPercentage}%
								</p>
								<p className='mt-4'>
									<strong>Skills:</strong>{" "}
									{match.skills.length > 0 ? match.skills.join(", ") : "N/A"}
								</p>
								<p className='mt-2'>
									<strong>Interests:</strong>{" "}
									{typeof match.interests === "string"
										? match.interests
										: "N/A"}
								</p>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}
