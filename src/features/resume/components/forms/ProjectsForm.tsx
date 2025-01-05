import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function ProjectsForm({ data, updateData }) {
  const [projects, setProjects] = useState(data)

  const handleChange = (index: number, field: string, value: string | string[]) => {
    const updatedProjects = [...projects]
    updatedProjects[index] = { ...updatedProjects[index], [field]: value }
    setProjects(updatedProjects)
    updateData('projects', updatedProjects)
  }

  const addProject = () => {
    setProjects([...projects, { title: '', description: '', technologies: [], url: '', start_date: '', end_date: '' }])
  }

  const removeProject = (index: number) => {
    const updatedProjects = projects.filter((_, i) => i !== index)
    setProjects(updatedProjects)
    updateData('projects', updatedProjects)
  }

  return (
    <div className="space-y-6">
      {projects.map((project, index) => (
        <div key={index} className="border p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Project {index + 1}</h3>
          <div className="space-y-2">
            <div>
              <Label htmlFor={`title-${index}`}>Title</Label>
              <Input
                id={`title-${index}`}
                value={project.title}
                onChange={(e) => handleChange(index, 'title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`description-${index}`}>Description</Label>
              <Textarea
                id={`description-${index}`}
                value={project.description}
                onChange={(e) => handleChange(index, 'description', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`technologies-${index}`}>Technologies</Label>
              <Input
                id={`technologies-${index}`}
                value={project.technologies.join(', ')}
                onChange={(e) => handleChange(index, 'technologies', e.target.value.split(', '))}
              />
            </div>
            <div>
              <Label htmlFor={`url-${index}`}>URL</Label>
              <Input
                id={`url-${index}`}
                value={project.url}
                onChange={(e) => handleChange(index, 'url', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`start-date-${index}`}>Start Date</Label>
              <Input
                id={`start-date-${index}`}
                type="date"
                value={project.start_date}
                onChange={(e) => handleChange(index, 'start_date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`end-date-${index}`}>End Date</Label>
              <Input
                id={`end-date-${index}`}
                type="date"
                value={project.end_date || ''}
                onChange={(e) => handleChange(index, 'end_date', e.target.value)}
              />
            </div>
          </div>
          <Button variant="destructive" onClick={() => removeProject(index)} className="mt-2">
            Remove Project
          </Button>
        </div>
      ))}
      <Button onClick={addProject}>Add Project</Button>
    </div>
  )
}

