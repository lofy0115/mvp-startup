import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const taskSchema = z.object({
  mvpId: z.string(),
  name: z.string().min(1, '任务名称不能为空'),
  description: z.string().optional(),
  owner: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.number().min(1).max(5).default(3),
  dependencies: z.array(z.string()).default([]),
  dueDate: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mvpId = searchParams.get('mvpId')

    const tasks = await prisma.task.findMany({
      where: {
        mvpId: mvpId || undefined,
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json(
      { error: '获取任务列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = taskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        mvpId: data.mvpId,
        name: data.name,
        description: data.description,
        owner: data.owner,
        status: data.status,
        priority: data.priority,
        dependencies: JSON.stringify(data.dependencies),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    })

    return NextResponse.json({ task })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Failed to create task:', error)
    return NextResponse.json(
      { error: '创建任务失败' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: '任务ID不能为空' },
        { status: 400 }
      )
    }

    const task = await prisma.task.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json(
      { error: '更新任务失败' },
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
        { error: '任务ID不能为空' },
        { status: 400 }
      )
    }

    await prisma.task.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete task:', error)
    return NextResponse.json(
      { error: '删除任务失败' },
      { status: 500 }
    )
  }
}
