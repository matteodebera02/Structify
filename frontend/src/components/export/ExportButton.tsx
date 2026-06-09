import Button from '@/components/ui/Button'
import { useExport } from '@/hooks/useExport'

interface Props { projectId: number; projectTitle: string }

export default function ExportButton({ projectId, projectTitle }: Props) {
  const { exportMarkdown, exportJson } = useExport(projectId, projectTitle)
  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={exportMarkdown}>↓ MD</Button>
      <Button variant="secondary" size="sm" onClick={exportJson}>↓ JSON</Button>
    </div>
  )
}
