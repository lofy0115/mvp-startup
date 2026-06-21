import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const valuePropositionSchema = z.object({
  projectId: z.string(),
  personaId: z.string(),
  jobs: z.array(z.string()).default([]),
  pains: z.array(z.string()).default([]),
  gains: z.array(z.string()).default([]),
  painRelievers: z.array(z.string()).default([]),
  gainsCreators: z.array(z.string()).default([]),
  statement: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const personaId = searchParams.get('personaId')

    const valuePropositions = await prisma.valueProposition.findMany({
      where: {
        projectId: projectId || undefined,
        personaId: personaId || undefined,
      },
    })

    return NextResponse.json({ valuePropositions })
  } catch (error) {
    console.error('Failed to fetch value propositions:', error)
    return NextResponse.json(
      { error: '获取价值主张列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = valuePropositionSchema.parse(body)

    const valueProposition = await prisma.valueProposition.create({
      data: {
        projectId: data.projectId,
        personaId: data.personaId,
        jobs: JSON.stringify(data.jobs),
        pains: JSON.stringify(data.pains),
        gains: JSON.stringify(data.gains),
        painRelievers: JSON.stringify(data.painRelievers),
        gainsCreators: JSON.stringify(data.gainsCreators),
        statement: data.statement,
      },
    })

    return NextResponse.json({ valueProposition })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Failed to create value proposition:', error)
    return NextResponse.json(
      { error: '创建价值主张失败' },
      { status: 500 }
    )
  }
}
