"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Select from "react-select"
import { baseURL } from "../../util/constant";

export default function Profile() {
	const router = useRouter();

	const { id: userId } = useParams(); // Extract userId from the URL
	const [formData, setFormData] = useState({
		role: "",
		skills: [],
		interests: [],
		bio: "",
		name: "",
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const skillOptions = [
		{ value: "JavaScript", label: "JavaScript" },
		{ value: "React", label: "React" },
		{ value: "Node.js", label: "Node.js" },
		{ value: "Python", label: "Python" },
		{ value: "Java", label: "Java" },
	];
	// Fetch user data
	useEffect(() => {
		if (!userId) return; // Wait until userId is available
		async function fetchUser() {
			try {
				const response = await fetch(`${baseURL}user/${userId}`);
				if (!response.ok) {
					throw new Error("Failed to fetch user data");
				}
				const data = await response.json();
				const preselectedSkills = data.skills.map((skill) =>
					skillOptions.find((option) => option.value === skill)
				);
				setFormData({
					role: data.role || "",
					skills: preselectedSkills || [],
					interests: data.interests || "",
					bio: data.bio || "",
					name: data.name || "",
				});
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}

		fetchUser();
	}, [userId]);

	// Handle form input change
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		setSuccess("");
		setError("");
		try {
			let finalData = formData;
			finalData.skills = formData.skills.map((option) => option.value);
            
			

			const response = await fetch(`${baseURL}user/${userId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(finalData),
			});
			if (!response.ok) {
				throw new Error("Failed to update profile");
			}
			setSuccess("Profile updated successfully!");
			setTimeout(() => router.push("/discover"), 2000); // Redirect after success
		} catch (err) {
			setError(err.message);
		}
	};

	if (loading) {
		return <p className='text-white text-center'>Loading profile...</p>;
	}

	if (error) {
		return <p className='text-red-500 text-center'>Error: {error}</p>;
	}

	// Handle changes for the multi-select dropdown
	const handleSkillsChange = (selectedOptions) => {
		setFormData((prevState) => ({
			...prevState,
			skills: selectedOptions,
		}));
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-900 relative py-4'>
			{/* Background Image */}
			<div
				className='absolute inset-0 bg-cover bg-center opacity-30'
				style={{
					backgroundImage: `url('/image.png')`,
				}}
			></div>

			{/* Profile Setup Form */}
			<div className='relative z-10 bg-gray-800 bg-opacity-80 p-4 rounded-lg shadow-lg w-full max-w-2xl'>
				{/* Profile Image */}
				<div className='flex flex-col items-center mb-4'>
					<div className='w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700'>
						<img
							src='/profile.png' // Replace with the actual user profile image URL
							alt='Profile'
							className='w-full h-full object-cover'
						/>
					</div>
					<h1 className='text-2xl font-bold text-white mt-4'>
						{formData.name}
					</h1>
					<p className='text-gray-400 text-center mt-1'>{formData.bio}</p>
				</div>

				<form onSubmit={handleSubmit} className='space-y-6'>
					{/* Role */}
					<div>
						<label
							htmlFor='role'
							className='block text-sm font-medium text-gray-300'
						>
							Role
						</label>
						<select
							id='role'
							name='role'
							value={formData.role}
							onChange={handleChange}
							className='w-full mt-1 p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
						>
							<option value='mentor'>Mentor</option>
							<option value='mentee'>Mentee</option>
						</select>
					</div>

					{/* Skills */}
					<div>
						<label
							htmlFor='skills'
							className='block text-sm font-medium text-gray-300'
						>
							Skills
						</label>
						<Select
							id='skills'
							options={skillOptions}
							isMulti
							value={formData.skills}
							onChange={handleSkillsChange}
							className='basic-multi-select'
							classNamePrefix='select'
							placeholder='Select your skills'
						/>
					</div>

					{/* Interests */}
					<div>
						<label
							value={formData.interests}
							htmlFor='interests'
							className='block text-sm font-medium text-gray-300'
						>
							Interests
						</label>
						<input
							type='text'
							id='interests'
							name='interests'
							value={formData.interests}
							onChange={handleChange}
							placeholder='Enter your interests (e.g., Web Development, AI, Design)'
							className='w-full mt-1 p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
						/>
					</div>

					{/* Bio */}
					<div>
						<label
							htmlFor='bio'
							className='block text-sm font-medium text-gray-300'
						>
							Bio
						</label>
						<textarea
							id='bio'
							name='bio'
							value={formData.bio}
							onChange={handleChange}
							placeholder='Write a brief bio about yourself'
							rows='4'
							className='w-full mt-1 p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
						></textarea>
					</div>

					{/* Submit Button */}
					<button
						type='submit'
						className='w-full bg-blue-500 text-white py-3 rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
					>
						Save Profile
					</button>
				</form>

				{/* Success or Error Messages */}
				{success && (
					<p className='text-green-400 text-center mt-4'>{success}</p>
				)}
				{error && <p className='text-red-400 text-center mt-4'>{error}</p>}
			</div>
		</div>
	);
}
