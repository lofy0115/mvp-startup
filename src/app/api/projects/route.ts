import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const projectSchema = z.object({
  name: z.string().min(1, '项目名称不能为空'),
  description: z.string().optional(),
  userId: z.string(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const projects = await prisma.project.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json(
      { error: '获取项目列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, userId } = projectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        name,
        phase: 1,
        userId,
      },
    })

    return NextResponse.json({ project })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Failed to create project:', error)
    return NextResponse.json(
      { error: '创建项目失败' },
      { status: 500 }
    )
  }
}
