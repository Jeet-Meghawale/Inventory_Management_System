import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../config/db.js";

export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.is_active) {
        return res.status(403).json({ message: "User is inactive" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.json({
        token,
        user: { id: user.id, name: user.name, role: user.role },
    });
};

export const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password_hash: hashedPassword,
            role,
        },
    });

    res.status(201).json({
        message: "User  created successfully",
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    });
};