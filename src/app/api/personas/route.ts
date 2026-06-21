import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const personaSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1, '画像名称不能为空'),
  ageRange: z.string().optional(),
  occupation: z.string().optional(),
  goals: z.array(z.string()).optional(),
  frustrations: z.array(z.string()).optional(),
  behaviors: z.array(z.string()).optional(),
  description: z.string().optional(),
  painPointIds: z.array(z.string()).optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const personas = await prisma.persona.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        painPoints: {
          include: {
            painPoint: true,
          },
        },
      },
    })

    // 解析JSON字段
    const personasWithParsed = personas.map(persona => ({
      ...persona,
      demographics: JSON.parse(persona.demographics || '{}'),
      behaviors: JSON.parse(persona.behaviors || '{}'),
      painPoints: persona.painPoints.map(pp => pp.painPoint),
    }))

    return NextResponse.json({ personas: personasWithParsed })
  } catch (error) {
    console.error('Failed to fetch personas:', error)
    return NextResponse.json(
      { error: '获取用户画像列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = personaSchema.parse(body)

    const demographics = JSON.stringify({
      ageRange: data.ageRange,
      occupation: data.occupation,
    })

    const behaviors = JSON.stringify({
      goals: data.goals || [],
      frustrations: data.frustrations || [],
      behaviors: data.behaviors || [],
    })

    const persona = await prisma.persona.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        demographics,
        behaviors,
        description: data.description,
        painPoints: data.painPointIds ? {
          create: data.painPointIds.map(painPointId => ({
            painPointId,
          })),
        } : undefined,
      },
      include: {
        painPoints: {
          include: {
            painPoint: true,
          },
        },
      },
    })

    return NextResponse.json({ persona })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Failed to create persona:', error)
    return NextResponse.json(
      { error: '创建用户画像失败' },
      { status: 500 }
    )
  }
}
