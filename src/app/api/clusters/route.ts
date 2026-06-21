import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const clusterSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1, '聚类名称不能为空'),
  dimension: z.string().optional(),
  complaintIds: z.array(z.string()).optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const clusters = await prisma.cluster.findMany({
      where: projectId ? { projectId } : undefined,
    })

    // 解析complaintIds JSON
    const clustersWithComplaints = clusters.map(cluster => ({
      ...cluster,
      complaints: cluster.complaintIds ? JSON.parse(cluster.complaintIds) : [],
    }))

    return NextResponse.json({ clusters: clustersWithComplaints })
  } catch (error) {
    console.error('Failed to fetch clusters:', error)
    return NextResponse.json(
      { error: '获取聚类列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = clusterSchema.parse(body)

    const cluster = await prisma.cluster.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        dimension: data.dimension || 'pain_point',
        complaintIds: JSON.stringify(data.complaintIds || []),
        count: data.complaintIds?.length || 0,
      },
    })

    return NextResponse.json({ cluster })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Failed to create cluster:', error)
    return NextResponse.json(
      { error: '创建聚类失败' },
      { status: 500 }
    )
  }
}
