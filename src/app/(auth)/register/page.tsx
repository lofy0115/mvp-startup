'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  name: z.string().optional(),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || '注册失败')
        return
      }

      router.push('/login?registered=true')
    } catch (err) {
      setError('注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-lg font-bold text-white">MV</span>
          </div>
          <CardTitle className="text-xl">创建账号</CardTitle>
          <CardDescription>开始你的创业验证之旅</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Input
              label="邮箱"
              type="email"
              placeholder="your@email.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="密码"
              type="password"
              placeholder="至少6位"
              {...register('password')}
              error={errors.password?.message}
            />

            <Input
              label="姓名（选填）"
              type="text"
              placeholder="你怎么称呼"
              {...register('name')}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '注册中...' : '注册'}
            </Button>

            <p className="text-center text-sm text-gray-600">
              已有账号？{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
                登录
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
