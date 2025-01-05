import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function WorkExperienceForm({ data, updateData }) {
  const [experiences, setExperiences] = useState(data)

  const handleChange = (index: number, field: string, value: string) => {
    const updatedExperiences = [...experiences]
    updatedExperiences[index] = { ...updatedExperiences[index], [field]: value }
    setExperiences(updatedExperiences)
    updateData('work_experience', updatedExperiences)
  }

  const addExperience = () => {
    setExperiences([...experiences, { title: '', company: '', location: '', start_date: '', end_date: '', description: [] }])
  }

  const removeExperience = (index: number) => {
    const updatedExperiences = experiences.filter((_, i) => i !== index)
    setExperiences(updatedExperiences)
    updateData('work_experience', updatedExperiences)
  }

  return (
    <div className="space-y-6">
      {experiences.map((exp, index) => (
        <div key={index} className="border p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Experience {index + 1}</h3>
          <div className="space-y-2">
            <div>
              <Label htmlFor={`title-${index}`}>Title</Label>
              <Input
                id={`title-${index}`}
                value={exp.title}
                onChange={(e) => handleChange(index, 'title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`company-${index}`}>Company</Label>
              <Input
                id={`company-${index}`}
                value={exp.company}
                onChange={(e) => handleChange(index, 'company', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`location-${index}`}>Location</Label>
              <Input
                id={`location-${index}`}
                value={exp.location}
                onChange={(e) => handleChange(index, 'location', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`start-date-${index}`}>Start Date</Label>
              <Input
                id={`start-date-${index}`}
                type="date"
                value={exp.start_date}
                onChange={(e) => handleChange(index, 'start_date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`end-date-${index}`}>End Date</Label>
              <Input
                id={`end-date-${index}`}
                type="date"
                value={exp.end_date || ''}
                onChange={(e) => handleChange(index, 'end_date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`description-${index}`}>Description</Label>
              <Textarea
                id={`description-${index}`}
                value={exp.description.join('\n')}
                onChange={(e) => handleChange(index, 'description', e.target.value.split('\n'))}
              />
            </div>
          </div>
          <Button variant="destructive" onClick={() => removeExperience(index)} className="mt-2">
            Remove Experience
          </Button>
        </div>
      ))}
      <Button onClick={addExperience}>Add Experience</Button>
    </div>
  )
}

