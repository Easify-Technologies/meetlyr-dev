'use server';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "All fields are required", isLoggedIn: false },
                { status: 400 }
            )
        }

        const admin = await prisma.admin.findUnique({ 
            where: {
                email,
            }
        });
        if (!admin) {
            return NextResponse.json(
                { error: "Invalid Credentials", isLoggedIn: false },
                { status: 400 }
            );
        }

        await prisma.admin.update({
            where: { id: admin.id },
            data: { isLoggedIn: true },
        });

        const token = jwt.sign(
            { adminId: admin.id, email: admin.email, isAdmin: true },
            process.env.NEXTAUTH_SECRET!,
            { expiresIn: "7d" }
        );

        return NextResponse.json({
            message: "Admin Logged in Successfully",
            admin: { id: admin.id, email: admin.email, isLoggedIn: true },
            token
        }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Something went wrong", isLoggedIn: false },
            { status: 500 }
        );
    }
}