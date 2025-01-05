import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function EducationForm({ data, updateData }) {
  const [education, setEducation] = useState(data)

  const handleChange = (index: number, field: string, value: string) => {
    const updatedEducation = [...education]
    updatedEducation[index] = { ...updatedEducation[index], [field]: value }
    setEducation(updatedEducation)
    updateData('education', updatedEducation)
  }

  const addEducation = () => {
    setEducation([...education, { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', grade: '', description: [] }])
  }

  const removeEducation = (index: number) => {
    const updatedEducation = education.filter((_, i) => i !== index)
    setEducation(updatedEducation)
    updateData('education', updatedEducation)
  }

  return (
    <div className="space-y-6">
      {education.map((edu, index) => (
        <div key={index} className="border p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Education {index + 1}</h3>
          <div className="space-y-2">
            <div>
              <Label htmlFor={`institution-${index}`}>Institution</Label>
              <Input
                id={`institution-${index}`}
                value={edu.institution}
                onChange={(e) => handleChange(index, 'institution', e.target.value)}
              />
            </div>
            {/* Add similar input fields for other education properties */}
          </div>
          <Button variant="destructive" onClick={() => removeEducation(index)} className="mt-2">
            Remove Education
          </Button>
        </div>
      ))}
      <Button onClick={addEducation}>Add Education</Button>
    </div>
  )
}

