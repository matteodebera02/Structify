import { projectsApi } from '@/api/projectsApi'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function useExport(projectId: number, projectTitle: string) {
  const exportMarkdown = async () => {
    const res = await projectsApi.exportMarkdown(projectId)
    downloadBlob(res.data, `${projectTitle}.md`)
  }

  const exportJson = async () => {
    const res = await projectsApi.exportJson(projectId)
    downloadBlob(res.data, `${projectTitle}.json`)
  }

  const exportCsv = async () => {
    const res = await projectsApi.exportCsv(projectId)
    downloadBlob(res.data, `${projectTitle}.csv`)
  }

  return { exportMarkdown, exportJson, exportCsv }
}
