'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAppStore()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const registered = searchParams.get('registered')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || '登录失败')
        return
      }

      // 保存到store（实际生产应该用token）
      setUser(result.user)
      router.push('/dashboard')
    } catch (err) {
      setError('登录失败，请重试')
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
          <CardTitle className="text-xl">登录</CardTitle>
          <CardDescription>欢迎回来！</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {registered && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
                注册成功！请登录。
              </div>
            )}

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
              placeholder="输入密码"
              {...register('password')}
              error={errors.password?.message}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '登录中...' : '登录'}
            </Button>

            <p className="text-center text-sm text-gray-600">
              还没有账号？{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
                注册
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p>加载中...</p></div>}>
      <LoginForm />
    </Suspense>
  )
}
