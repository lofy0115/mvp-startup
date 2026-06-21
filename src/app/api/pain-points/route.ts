import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const painPointSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1, '痛点名称不能为空'),
  description: z.string().optional(),
  clusterId: z.string().optional(),
  frequencyScore: z.number().min(1).max(10).optional(),
  intensityScore: z.number().min(1).max(10).optional(),
  paymentWillingness: z.number().min(1).max(10).optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const painPoints = await prisma.painPoint.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        cluster: true,
      },
      orderBy: { compositeScore: 'desc' },
    })

    return NextResponse.json({ painPoints })
  } catch (error) {
    console.error('Failed to fetch pain points:', error)
    return NextResponse.json(
      { error: '获取痛点列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = painPointSchema.parse(body)

    const frequency = data.frequencyScore || 5
    const intensity = data.intensityScore || 5
    const payment = data.paymentWillingness || 5
    const compositeScore = (frequency * intensity * payment) / 100

    const painPoint = await prisma.painPoint.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        clusterId: data.clusterId,
        frequencyScore: frequency,
        intensityScore: intensity,
        paymentWillingness: payment,
        compositeScore,
      },
    })

    return NextResponse.json({ painPoint })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Failed to create pain point:', error)
    return NextResponse.json(
      { error: '创建痛点失败' },
      { status: 500 }
    )
  }
}
