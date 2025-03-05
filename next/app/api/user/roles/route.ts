import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/authOptions";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { ROLE_OPTIONS } from "@/app/lib/users/constants";

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { roles } = await req.json();

    // Validate that all provided roles are valid UserRole enum values
    const validRoles = ROLE_OPTIONS.map((option) => option.value);
    const areRolesValid = roles.every((role: string) =>
      validRoles.includes(role)
    );

    if (!areRolesValid) {
      return new NextResponse("Invalid roles provided", { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: { roles },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user roles:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
