import { useState } from 'react'
import Sidebar, { SAMPLE_TOOLS } from './Sidebar'
import { Tool } from '../types/tool'

type LayoutProps = {
  children?: React.ReactNode
  tools?: Tool[]
}

export default function Layout({ children, tools = SAMPLE_TOOLS }: LayoutProps) {
  const [activeTool, setActiveTool] = useState(tools[0]?.id || '')

  // Find the active tool component
  const activeToolData = tools.find((tool) => tool.id === activeTool)
  const ToolComponent = activeToolData?.component || (() => <div>Select a tool</div>)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <Sidebar tools={tools} activeTool={activeTool} onSelectTool={setActiveTool} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header/Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 font-semibold text-lg">{activeToolData?.name || 'Select a Tool'}</h2>
            <p className="text-gray-500 text-sm">Use the tools in the sidebar</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {children || <ToolComponent />}
        </div>
      </div>
    </div>
  )
}
