import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const complaintSchema = z.object({
  projectId: z.string(),
  content: z.string().min(1, '抱怨内容不能为空'),
  source: z.string().optional(),
  cleanedText: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const complaints = await prisma.complaint.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ complaints })
  } catch (error) {
    console.error('Failed to fetch complaints:', error)
    return NextResponse.json(
      { error: '获取抱怨列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = complaintSchema.parse(body)

    const complaint = await prisma.complaint.create({
      data: {
        projectId: data.projectId,
        rawText: data.content,
        cleanedText: data.cleanedText,
        source: data.source,
      },
    })

    return NextResponse.json({ complaint })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Failed to create complaint:', error)
    return NextResponse.json(
      { error: '创建抱怨失败' },
      { status: 500 }
    )
  }
}
