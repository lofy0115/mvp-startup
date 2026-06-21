import Link from 'next/link'
import { ArrowRight, Layers, Target, Zap, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold text-white">MV</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">MVP创业工具</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                开始使用
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            从创业想法到<span className="text-blue-600">可验证的MVP</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            一款面向小规模创业者的辅助工具，帮助你在资源有限、时间碎片化的条件下，
            完成从用户洞察到MVP验证的完整流程。
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
            >
              立即开始
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              已有账号
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">用户洞察</h3>
            <p className="mt-2 text-sm text-gray-600">
              从客户抱怨中提炼真实痛点，构建精准用户画像
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">假设验证</h3>
            <p className="mt-2 text-sm text-gray-600">
              用精益画布梳理核心假设，用数据验证商业模式
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Layers className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">商业设计</h3>
            <p className="mt-2 text-sm text-gray-600">
              从价值主张到利润模式，设计完整商业画布
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">快速落地</h3>
            <p className="mt-2 text-sm text-gray-600">
              MVP设计方案 + 落地步骤，快速验证市场反应
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24">
          <h2 className="text-center text-2xl font-bold text-gray-900">四阶段完整路径</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                title: '理解用户',
                desc: '抱怨收集 → 聚类分析 → 痛点提炼 → 用户画像',
                color: 'blue',
              },
              {
                step: '02',
                title: '验证机会',
                desc: '用户画像 → 假设建立 → 精益画布 → 关键假设清单',
                color: 'green',
              },
              {
                step: '03',
                title: '设计商业',
                desc: '价值主张 → 商业画布 → 利润模式 → 单位经济',
                color: 'purple',
              },
              {
                step: '04',
                title: '落地执行',
                desc: '关键指标 → MVP设计 → 落地步骤 → 反馈迭代',
                color: 'orange',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-xl border border-gray-200 bg-white p-6"
              >
                <div className={`absolute -top-3 left-4 rounded-lg bg-${item.color}-600 px-2 py-1 text-xs font-bold text-white`}>
                  {item.step}
                </div>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
