import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const mvpFeatureSchema = z.object({
  name: z.string().min(1, '功能名称不能为空'),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).default('P1'),
  description: z.string().optional(),
  acceptanceCriteria: z.string().optional(),
})

const mvpSchema = z.object({
  projectId: z.string(),
  canvasId: z.string().optional(),
  name: z.string().min(1, 'MVP名称不能为空'),
  description: z.string().optional(),
  type: z.enum(['landing_page', 'prototype', 'manual', 'functional']).default('landing_page'),
  cost: z.number().optional(),
  timeline: z.string().optional(),
  features: z.array(mvpFeatureSchema).default([]),
  status: z.enum(['planning', 'developing', 'testing', 'launched']).default('planning'),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const canvasId = searchParams.get('canvasId')

    const mvps = await prisma.mVP.findMany({
      where: {
        projectId: projectId || undefined,
        canvasId: canvasId || undefined,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ mvps })
  } catch (error) {
    console.error('Failed to fetch MVPs:', error)
    return NextResponse.json(
      { error: '获取MVP列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = mvpSchema.parse(body)

    const mvp = await prisma.mVP.create({
      data: {
        projectId: data.projectId,
        canvasId: data.canvasId,
        name: data.name,
        description: data.description,
        type: data.type,
        cost: data.cost,
        timeline: data.timeline,
        features: JSON.stringify(data.features),
        status: data.status,
      },
    })

    return NextResponse.json({ mvp })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Failed to create MVP:', error)
    return NextResponse.json(
      { error: '创建MVP失败' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, features, ...rest } = body

    if (!id) {
      return NextResponse.json(
        { error: 'MVP ID不能为空' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = { ...rest }
    if (features) {
      updateData.features = JSON.stringify(features)
    }

    const mvp = await prisma.mVP.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ mvp })
  } catch (error) {
    console.error('Failed to update MVP:', error)
    return NextResponse.json(
      { error: '更新MVP失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'MVP ID不能为空' },
        { status: 400 }
      )
    }

    await prisma.mVP.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete MVP:', error)
    return NextResponse.json(
      { error: '删除MVP失败' },
      { status: 500 }
    )
  }
}
