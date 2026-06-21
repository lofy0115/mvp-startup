import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const businessCanvasDataSchema = z.object({
  keyPartners: z.array(z.string()).default([]),
  keyActivities: z.array(z.string()).default([]),
  keyResources: z.array(z.string()).default([]),
  valuePropositions: z.array(z.string()).default([]),
  customerRelationships: z.array(z.string()).default([]),
  channels: z.array(z.string()).default([]),
  customerSegments: z.array(z.string()).default([]),
  costStructure: z.array(z.string()).default([]),
  revenueStreams: z.array(z.string()).default([]),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const personaId = searchParams.get('personaId')

    const businessCanvas = await prisma.canvas.findMany({
      where: {
        projectId: projectId || undefined,
        personaId: personaId || undefined,
      },
      include: {
        persona: true,
      },
    })

    return NextResponse.json({ canvas: businessCanvas })
  } catch (error) {
    console.error('Failed to fetch business canvas:', error)
    return NextResponse.json(
      { error: '获取商业画布列表失败' },
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

    const canvasData = businessCanvasDataSchema.parse(data || {})

    const filledCells = [
      canvasData.keyPartners.length > 0,
      canvasData.keyActivities.length > 0,
      canvasData.keyResources.length > 0,
      canvasData.valuePropositions.length > 0,
      canvasData.customerRelationships.length > 0,
      canvasData.channels.length > 0,
      canvasData.customerSegments.length > 0,
      canvasData.costStructure.length > 0,
      canvasData.revenueStreams.length > 0,
    ].filter(Boolean).length

    const completeness = (filledCells / 9) * 100

    const businessCanvas = await prisma.canvas.create({
      data: {
        projectId,
        personaId,
        type: 'business',
        data: JSON.stringify(canvasData),
        completeness,
      },
    })

    return NextResponse.json({ canvas: businessCanvas })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Failed to create business canvas:', error)
    return NextResponse.json(
      { error: '创建商业画布失败' },
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

    const canvasData = businessCanvasDataSchema.parse(data || {})

    const filledCells = [
      canvasData.keyPartners.length > 0,
      canvasData.keyActivities.length > 0,
      canvasData.keyResources.length > 0,
      canvasData.valuePropositions.length > 0,
      canvasData.customerRelationships.length > 0,
      canvasData.channels.length > 0,
      canvasData.customerSegments.length > 0,
      canvasData.costStructure.length > 0,
      canvasData.revenueStreams.length > 0,
    ].filter(Boolean).length

    const completeness = (filledCells / 9) * 100

    const businessCanvas = await prisma.canvas.update({
      where: { id },
      data: {
        data: JSON.stringify(canvasData),
        completeness,
      },
    })

    return NextResponse.json({ canvas: businessCanvas })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Failed to update business canvas:', error)
    return NextResponse.json(
      { error: '更新商业画布失败' },
      { status: 500 }
    )
  }
}
