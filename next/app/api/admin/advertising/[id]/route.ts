import { NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/email";
import { prisma } from "@/app/lib/prisma";
import { adRejectionTemplate } from "@/app/lib/email-templates";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { action, reason } = await request.json();
    const adRequest = await prisma.adRequest.findUnique({
      where: { id: params.id },
    });

    if (!adRequest) {
      return NextResponse.json(
        { error: "Ad request not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      await prisma.adRequest.update({
        where: { id: params.id },
        data: { status: "active" },
      });

      // Send approval email
      await sendEmail({
        to: adRequest.contactEmail,
        subject: "Your Ad Request Has Been Approved",
        html: `Your advertisement request for ${adRequest.title} has been approved.`,
      });
    } else {
      await prisma.adRequest.update({
        where: { id: params.id },
        data: {
          status: "rejected",
          rejectionReason: reason,
        },
      });

      // Send rejection email
      await sendEmail({
        to: adRequest.contactEmail,
        subject: "Your Ad Request Status",
        html: adRejectionTemplate(
          adRequest.title || adRequest.companyName,
          reason
        ),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling ad request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
