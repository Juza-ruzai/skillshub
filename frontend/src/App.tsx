function App() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground">
          OpenClaw Skills Hub
        </h1>
        <p className="mt-4 text-muted-foreground">
          AI Skills 共享平台 - 基础设施建设完成
        </p>
        <div className="mt-8 p-6 border rounded-lg bg-card">
          <h2 className="text-lg font-semibold">系统状态</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              前端服务运行中
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              等待后端连接
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              等待数据库连接
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default App
