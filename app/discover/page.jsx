"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { baseURL } from "../util/constant";
export default function UserDiscovery() {
	const [users, setUsers] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [currentUser, setCurrentUser] = useState(null); // Start with null
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filters, setFilters] = useState({ role: "", skill: "" });
	const [notifications, setNotifications] = useState();
	const [showNotifications, setShowNotifications] = useState(false);

	const route = useRouter();
	useEffect(() => {
		if (!localStorage.getItem("currentUser")) {
			route.push("/login");
		}
	}, []);

	const getCurrentUser = async () => {
		try {
			const storedUser = localStorage.getItem("currentUser");
			const user = JSON.parse(storedUser);
			const response = await fetch(
				`${baseURL}user/${user.id}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			if (!response.ok) {
				throw new Error("Failed to send request");
			}
			const result = await response.json();

			setCurrentUser(result);
		} catch (error) {
			console.error("Error sending request:", error);
			alert("Failed to get current user");
		}
	};

	useEffect(() => {
		getCurrentUser();
	}, []);

	const handleConnect = async (mentorId) => {
		try {
			const response = await fetch(`${baseURL}connect`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					menteeId: currentUser.id, // Current user (mentee) ID
					mentorId: mentorId, // Target mentor ID
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to send request");
			}

			const result = await response.json();
			alert("Request sent successfully!");
		} catch (error) {
			console.error("Error sending request:", error);
			alert("Failed to send request. Please try again.");
		}
	};

	// Fetch users from the API
	useEffect(() => {
		async function fetchUsers() {
			try {
				const response = await fetch(`${baseURL}user`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (!response.ok) throw new Error("Failed to fetch users");
				const data = await response.json();

				setUsers(data);
				setFilteredUsers(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}
		fetchUsers();
	}, []);

	// Handle filter changes
	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilters((prev) => ({ ...prev, [name]: value }));
	};

	// Apply filters to users
	useEffect(() => {
		let filtered = users;

		// Filter by role
		if (filters.role) {
			filtered = filtered.filter(
				(user) => user.role.toLowerCase() === filters.role.toLowerCase()
			);
		}

		// Filter by skill (ensure skills is a string and not null/undefined)
		if (filters.skill) {
			filtered = filtered.filter((user) => user.skills.includes(filters.skill));
		}

		setFilteredUsers(filtered);
	}, [filters, users]);

	// Reset filters
	const resetFilters = () => {
		setFilters({ role: "", skill: "" });
	};

	const handleAccept = async (currentUserId, requestId) => {
		try {
			const response = await fetch(`${baseURL}notification`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ currentUserId, requestId }), // Pass both parameters
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Error accepting request:", errorText);
				alert("Failed to accept the request. Please try again.");
				return;
			}

			const result = await response.json();
			alert("Request accepted!");

			// Update the notification status in the UI
			setNotifications((prevNotifications) =>
				prevNotifications?.map((notification) =>
					notification.id === requestId
						? { ...notification, status: "accepted" }
						: notification
				)
			);
		} catch (error) {
			console.error("Error accepting request:", error.message);
			alert("An error occurred. Please try again.");
		}
	};

	useEffect(() => {
		if (!currentUser) return;

		async function fetchNotifications() {
			try {
				const response = await fetch(
					`${baseURL}notification?userId=${currentUser.id}`
				);

				const contentType = response.headers.get("content-type");

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(`API Error: ${response.status}`);
				}
				const data = await response.json();
				setNotifications(data);
			} catch (error) {
				console.log("Error fetching notifications:", error.message);
			}
		}

		fetchNotifications();
	}, [currentUser]);
	if (loading) return <p>Loading...</p>;
	if (error) return <p className='text-red-500'>{error}</p>;

	return (
    currentUser && (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Hero Section */}
        <div className="relative h-80 flex items-center justify-center bg-cover bg-center">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url("/image.png")`,
            }}
          ></div>
          <div className="absolute inset-0 bg-black bg-opacity-80"></div>

          {/* Profile and Notification Icons */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative ">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-12 h-12 text-white flex items-center justify-center bg-gray-800 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-bell"
                >
                  <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                  <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                </svg>
                {/* Badge for notification count */}
                {notifications?.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              {/* Notification count below the bell icon */}
              {/* Notification count below the bell icon */}
              {showNotifications && (
                <div
                  className={`absolute ${
                    window.innerWidth < 500
                      ? "left-1/2 transform w-40 ml-5 -translate-x-1/2 top-16"
                      : "right-0 mt-2"
                  } w-96 bg-gray-800 text-white rounded-lg shadow-lg p-4`}
                >
                  <h3 className="text-lg font-semibold mb-2">Notifications</h3>
                  {notifications && notifications.length > 0 ? (
                    notifications?.map((notification, index) => {
                      // Safely access sentRequests and its status
                      return currentUser.role === "mentor" ? (
                        <div
                          key={index}
                          className="mb-2 flex justify-between items-center"
                        >
                          {notification.status === "Follower" ? (
                            <p className="text-sm text-gray-300">
                              You accepted {notification.name}&apos; request
                            </p>
                          ) : (
                            <p className="text-sm text-gray-300">
                              {notification.name} sent you a request
                            </p>
                          )}
                          {notification &&
                            notification.status === "Requested" && (
                              <button
                                onClick={() =>
                                  handleAccept(currentUser.id, notification.id)
                                }
                                className="mt-1 px-3 py-1 text-sm text-white font-semibold rounded bg-green-500 hover:bg-green-600"
                              >
                                Accept
                              </button>
                            )}
                        </div>
                      ) : (
                        <div
                          key={index}
                          className="mb-2 flex justify-between items-center"
                        >
                          {notification.status === "Pending" ? (
                            <p className="text-sm text-gray-300">
                              Request sent to {notification.name}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-300">
                              {notification.name} accepted your follow request
                            </p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">
                      No new notifications
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Profile Icon */}
            <Link
              href={currentUser ? `/profile/${currentUser.id}` : "#"}
              className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border-2 border-white hover:bg-gray-700"
            >
              <img
                src="/profile.png" // Replace with the actual profile image URL
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
            </Link>

            <button
              onClick={() => {
                localStorage.removeItem("currentUser");
                route.push("/login");
              }}
              className="relative w-20 h-12 text-white flex items-center justify-center bg-gray-800  px-2 py-1 rounded-md"
            >
              Logout
            </button>
          </div>

          <div className="relative z-10 text-center flex flex-col items-center w-4/5 md:w-3/5">
            <h1 className="text-5xl font-bold">Discover Users</h1>
            <p className="mt-4 text-gray-300">
              Browse through profiles to find the perfect mentor or mentee.
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="px-8 py-4 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Dropdown Filters */}
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <select
                name="role"
                className="p-3 bg-gray-700 bg-opacity-50 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.role}
                onChange={handleFilterChange}
              >
                <option value="">Filter by Role</option>
                <option value="Mentor">Mentor</option>
                <option value="Mentee">Mentee</option>
              </select>

              <select
                name="skill"
                className="p-3 bg-gray-700 bg-opacity-50 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.skill}
                onChange={handleFilterChange}
              >
                <option value="">Filter by Skills</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="React">React</option>
                <option value="Node.js">Node.js</option>
                <option value="Java">Java</option>
              </select>
            </div>

            {/* Reset Filters Button */}

            <button
              onClick={resetFilters}
              className="mr-4 px-6 py-3 text-white font-semibold rounded-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 shadow-md"
            >
              Reset Filters
            </button>

            {/* Matchmaking Button */}
            {currentUser?.role?.toLowerCase() === "mentee" && (
              <Link href={`/match-make/${currentUser.id}`}>
                <button className="px-6 py-3 text-white font-semibold rounded-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 shadow-md">
                  Go to Matchmaking
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* User Profiles Section */}
        <div className="px-8 py-6">
          <h2 className="text-2xl font-bold mb-4">Available Users</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredUsers?.map((user, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
              >
                <div
                  className="h-40 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${
                      user.profileImage || "/profile.png"
                    }')`,
                  }}
                ></div>
                <div className="p-4">
                  <h3 className="text-xl font-bold">{user.name}</h3>
                  <p className="text-sm text-gray-400">{user.role}</p>
                  <p className="mt-2">
                    <strong>Skills:</strong>{" "}
                    {user.skills && user.skills.length > 0
                      ? user.skills.join(", ")
                      : "N/A"}
                  </p>
                  <p className="mt-2">
                    <strong>Interests:</strong>{" "}
                    {typeof user.interests === "string" && user.interests
                      ? user.interests
                      : "N/A"}
                  </p>
                  {/* Show "Connect" button only for mentors */}
                  {user.role?.toLowerCase() === "mentor" &&
                    user.id !== currentUser.id && (
                      <button
                        onClick={() => {
                          if (
                            !currentUser.followers.includes(user.id) &&
                            !currentUser.requested
                              ?.map((user) => user.userId)
                              .includes(user.id)
                          ) {
                            handleConnect(user.id);
                          }
                        }}
                        className={`mt-4 px-4 py-2 text-white font-semibold rounded ${
                          !currentUser.followers.includes(user.id)
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-green-500 hover:bg-green-500"
                        } bg-blue-500 hover:bg-blue-600`}
                      >
                        {currentUser.followers.includes(user.id)
                          ? "Connected"
                          : currentUser.requested
                              ?.map((user) => user.userId)
                              .includes(user.id)
                          ? "Requested"
                          : "Connect"}
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );
}
