import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  name: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已注册' },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Register error:', error)
    return NextResponse.json(
      { error: '注册失败，请重试' },
      { status: 500 }
    )
  }
}
