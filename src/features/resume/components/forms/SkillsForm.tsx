import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SkillsForm({ data, updateData }) {
  const [skills, setSkills] = useState(data)

  const handleChange = (index: number, field: string, value: string | string[]) => {
    const updatedSkills = [...skills]
    updatedSkills[index] = { ...updatedSkills[index], [field]: value }
    setSkills(updatedSkills)
    updateData('skills', updatedSkills)
  }

  const addSkillCategory = () => {
    setSkills([...skills, { category: '', skills_list: [] }])
  }

  const removeSkillCategory = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index)
    setSkills(updatedSkills)
    updateData('skills', updatedSkills)
  }

  return (
    <div className="space-y-6">
      {skills.map((skillCategory, index) => (
        <div key={index} className="border p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Skill Category {index + 1}</h3>
          <div className="space-y-2">
            <div>
              <Label htmlFor={`category-${index}`}>Category</Label>
              <Input
                id={`category-${index}`}
                value={skillCategory.category}
                onChange={(e) => handleChange(index, 'category', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`skills-list-${index}`}>Skills</Label>
              <Input
                id={`skills-list-${index}`}
                value={skillCategory.skills_list.join(', ')}
                onChange={(e) => handleChange(index, 'skills_list', e.target.value.split(', '))}
              />
            </div>
          </div>
          <Button variant="destructive" onClick={() => removeSkillCategory(index)} className="mt-2">
            Remove Skill Category
          </Button>
        </div>
      ))}
      <Button onClick={addSkillCategory}>Add Skill Category</Button>
    </div>
  )
}

