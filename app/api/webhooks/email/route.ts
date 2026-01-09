import { sendWorkflowExecution } from "@/inngest/util/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: "Missing query parameter workflowId" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const emailData = {
      from: body.from,
      to: body.to,
      subject: body.subject,
      body: body.body,
      date: body.date,
      messageId: body.messageId,
    };

    await sendWorkflowExecution({
      workflowId,
      initialData: {
        emailData,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Webhook received successfully",
    });
  } catch (error) {
    console.error("Google Email webhook error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to process Google email" },
      { status: 500 }
    );
  }
}
