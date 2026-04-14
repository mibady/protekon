import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateSignoffSheetPDF } from "@/lib/pdf-training"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: record, error } = await supabase
    .from("training_records")
    .select("employee_name, training_type, due_date, completed_at, client_id")
    .eq("id", id)
    .eq("client_id", user.id)
    .single()

  if (error || !record) {
    return NextResponse.json({ error: "Training record not found" }, { status: 404 })
  }

  const { data: client } = await supabase
    .from("clients")
    .select("business_name")
    .eq("id", user.id)
    .maybeSingle()

  const { buffer, filename } = await generateSignoffSheetPDF({
    employeeName: record.employee_name,
    trainingType: record.training_type,
    completedAt: record.completed_at,
    dueDate: record.due_date,
    businessName: client?.business_name ?? "Your company",
  })

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.length),
    },
  })
}
