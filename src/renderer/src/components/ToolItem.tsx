import { Tool } from '../types/tool'
import { Button } from './ui'

type ToolItemProps = {
  tool: Tool
  isActive: boolean
  onClick: () => void
}

export default function ToolItem({ tool, isActive, onClick }: ToolItemProps) {
  const IconComponent = tool.icon

  return (
    <Button
      onClick={onClick}
      variant={isActive ? "default" : "ghost"}
      size="default"
      className={`
        w-full justify-start gap-3 h-10 px-4 transition-colors duration-200 rounded-md
        ${isActive ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}
      `}
    >
      <IconComponent className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm truncate">{tool.name}</span>
    </Button>
  )
}

