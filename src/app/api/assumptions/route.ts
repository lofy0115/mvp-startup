import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const assumptionSchema = z.object({
  personaId: z.string().min(1, '用户画像ID不能为空'),
  type: z.enum(['problem', 'solution', 'unique_value', 'advantage', 'channel', 'revenue', 'cost']),
  content: z.string().min(1, '假设内容不能为空'),
  validationMethod: z.string().optional(),
  validationStatus: z.enum(['unvalidated', 'validated', 'invalidated']).default('unvalidated'),
  priority: z.number().min(1).max(3).default(2),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const personaId = searchParams.get('personaId')

    const assumptions = await prisma.assumption.findMany({
      where: {
        personaId: personaId || undefined,
      },
      include: {
        persona: true,
      },
      orderBy: { priority: 'asc' },
    })

    return NextResponse.json({ assumptions })
  } catch (error) {
    console.error('Failed to fetch assumptions:', error)
    return NextResponse.json(
      { error: '获取假设列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = assumptionSchema.parse(body)

    const assumption = await prisma.assumption.create({
      data,
    })

    return NextResponse.json({ assumption })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Failed to create assumption:', error)
    return NextResponse.json(
      { error: '创建假设失败' },
      { status: 500 }
    )
  }
}
