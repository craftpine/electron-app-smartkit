import { useState } from 'react'
import Sidebar, { SAMPLE_TOOLS } from './Sidebar'
import Welcome from './Welcome'
import { Tool } from '../types/tool'

type LayoutProps = {
  children?: React.ReactNode
  tools?: Tool[]
}

export default function Layout({ children, tools = SAMPLE_TOOLS }: LayoutProps) {
  const [activeTool, setActiveTool] = useState('')

  // Find the active tool component (search recursively for nested tools)
  const findTool = (toolId: string, toolsList: Tool[] = tools): Tool | undefined => {
    for (const tool of toolsList) {
      if (tool.id === toolId) return tool
      if (tool.children) {
        const found = findTool(toolId, tool.children)
        if (found) return found
      }
    }
    return undefined
  }

  const activeToolData = findTool(activeTool)
  const ToolComponent = activeToolData?.component || (() => <Welcome onSelectTool={setActiveTool} />)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <Sidebar tools={tools} activeTool={activeTool} onSelectTool={setActiveTool} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header/Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 font-semibold text-lg">
              {activeToolData?.name || 'Welcome'}
            </h2>
            <p className="text-gray-500 text-sm">
              {activeToolData ? activeToolData.name : 'Select a tool from the sidebar to get started'}
            </p>
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
