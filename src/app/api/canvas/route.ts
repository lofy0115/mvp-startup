import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const canvasDataSchema = z.object({
  problem: z.array(z.string()).default([]),
  solution: z.array(z.string()).default([]),
  uniqueValue: z.string().default(''),
  unfairAdvantage: z.array(z.string()).default([]),
  channels: z.array(z.string()).default([]),
  customerSegments: z.array(z.string()).default([]),
  costStructure: z.array(z.string()).default([]),
  revenueStreams: z.array(z.string()).default([]),
  keyMetrics: z.array(z.string()).default([]),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const personaId = searchParams.get('personaId')

    const canvas = await prisma.canvas.findMany({
      where: {
        projectId: projectId || undefined,
        personaId: personaId || undefined,
      },
      include: {
        persona: true,
      },
    })

    return NextResponse.json({ canvas })
  } catch (error) {
    console.error('Failed to fetch canvas:', error)
    return NextResponse.json(
      { error: '获取画布列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { projectId, personaId, data } = body

    if (!projectId) {
      return NextResponse.json(
        { error: '项目ID不能为空' },
        { status: 400 }
      )
    }

    const canvasData = canvasDataSchema.parse(data || {})

    const completeness = (
      (canvasData.problem.length > 0 ? 11.11 : 0) +
      (canvasData.solution.length > 0 ? 11.11 : 0) +
      (canvasData.uniqueValue ? 11.11 : 0) +
      (canvasData.unfairAdvantage.length > 0 ? 11.11 : 0) +
      (canvasData.channels.length > 0 ? 11.11 : 0) +
      (canvasData.customerSegments.length > 0 ? 11.11 : 0) +
      (canvasData.keyMetrics.length > 0 ? 11.11 : 0) +
      (canvasData.costStructure.length > 0 ? 11.11 : 0) +
      (canvasData.revenueStreams.length > 0 ? 11.11 : 0)
    )

    const canvas = await prisma.canvas.create({
      data: {
        projectId,
        personaId,
        type: 'lean',
        data: JSON.stringify(canvasData),
        completeness,
      },
    })

    return NextResponse.json({ canvas })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Failed to create canvas:', error)
    return NextResponse.json(
      { error: '创建画布失败' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, data } = body

    if (!id) {
      return NextResponse.json(
        { error: '画布ID不能为空' },
        { status: 400 }
      )
    }

    const canvasData = canvasDataSchema.parse(data || {})

    const completeness = (
      (canvasData.problem.length > 0 ? 11.11 : 0) +
      (canvasData.solution.length > 0 ? 11.11 : 0) +
      (canvasData.uniqueValue ? 11.11 : 0) +
      (canvasData.unfairAdvantage.length > 0 ? 11.11 : 0) +
      (canvasData.channels.length > 0 ? 11.11 : 0) +
      (canvasData.customerSegments.length > 0 ? 11.11 : 0) +
      (canvasData.keyMetrics.length > 0 ? 11.11 : 0) +
      (canvasData.costStructure.length > 0 ? 11.11 : 0) +
      (canvasData.revenueStreams.length > 0 ? 11.11 : 0)
    )

    const canvas = await prisma.canvas.update({
      where: { id },
      data: {
        data: JSON.stringify(canvasData),
        completeness,
      },
    })

    return NextResponse.json({ canvas })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Failed to update canvas:', error)
    return NextResponse.json(
      { error: '更新画布失败' },
      { status: 500 }
    )
  }
}
