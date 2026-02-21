export type Tool = {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  component: React.ComponentType
  children?: Tool[]
}
