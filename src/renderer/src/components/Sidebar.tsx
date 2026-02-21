import ToolItem from './ToolItem'
import { ScrollArea } from './ui'
import { Tool } from '../types/tool'
import { FileJson, Code, Search, Clock, Lock, Calculator } from 'lucide-react'

type SidebarProps = {
  tools: Tool[]
  activeTool: string
  onSelectTool: (toolId: string) => void
}

export default function Sidebar({ tools, activeTool, onSelectTool }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden h-screen">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 flex-shrink-0">
        <h1 className="text-gray-900 font-bold text-lg">Dev Tools</h1>
        <p className="text-gray-500 text-xs mt-1">Utility Collection</p>
      </div>

      {/* Tools List */}
      <ScrollArea className="flex-1 flex flex-col">
        <div className="px-3 py-4 space-y-1">
          {tools.map((tool) => (
            <ToolItem
              key={tool.id}
              tool={tool}
              isActive={activeTool === tool.id}
              onClick={() => onSelectTool(tool.id)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 text-gray-500 text-xs flex-shrink-0">
        <p>© 2024 Dev Tools</p>
      </div>
    </div>
  )
}

// Sample tools with icons
export const SAMPLE_TOOLS: Tool[] = [
  {
    id: 'json',
    name: 'JSON Formatter',
    icon: FileJson,
    component: () => <div className="p-4">JSON Formatter Tool</div>,
  },
  {
    id: 'base64',
    name: 'Base64 Encode/Decode',
    icon: Code,
    component: () => <div className="p-4">Base64 Tool</div>,
  },
  {
    id: 'regex',
    name: 'Regex Tester',
    icon: Search,
    component: () => <div className="p-4">Regex Tool</div>,
  },
  {
    id: 'timestamp',
    name: 'Timestamp Converter',
    icon: Clock,
    component: () => <div className="p-4">Timestamp Tool</div>,
  },
  {
    id: 'hash',
    name: 'Hash Generator',
    icon: Lock,
    component: () => <div className="p-4">Hash Tool</div>,
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: Calculator,
    component: () => <div className="p-4">Calculator Tool</div>,
  },
]
