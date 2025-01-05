import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function PersonalInfoForm({ data, updateData }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    updateData('personal_information', { ...data, [name]: value })
  }

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    updateData('personal_information', {
      ...data,
      contact: { ...data.contact, [name]: value },
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" value={data.name} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="headline">Headline</Label>
        <Input id="headline" name="headline" value={data.headline} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" value={data.contact.email} onChange={handleContactChange} />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" value={data.contact.phone} onChange={handleContactChange} />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" value={data.contact.location} onChange={handleContactChange} />
      </div>
    </div>
  )
}

