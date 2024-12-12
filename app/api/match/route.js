import prisma from "../../../prisma/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { userId, role } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const matches = await prisma.user.findMany({
      where: {
        AND: [
          { role: role === "mentor" ? "mentee" : "mentor" },
          {
            skills: { hasSome: user.skills },
          },
        ],
      },
    });

    res.status(200).json(matches);
  }
}
