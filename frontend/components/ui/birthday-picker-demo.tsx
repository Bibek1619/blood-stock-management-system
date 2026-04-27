"use client"

import * as React from "react"
import { BirthdayPicker } from "./birthday-picker"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

export function BirthdayPickerDemo() {
  const [birthDate, setBirthDate] = React.useState<string>("")

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null
    
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const age = calculateAge(birthDate)

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Shadcn Birthday Picker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <BirthdayPicker
          id="demo-birthday"
          label="Your Date of Birth"
          value={birthDate}
          onChange={setBirthDate}
          placeholder="Click to select your birthday"
          required
        />
        
        {birthDate && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Selected:</strong> {new Date(birthDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            {age !== null && (
              <p className="text-sm text-green-800 mt-1">
                <strong>Age:</strong> {age} years old
              </p>
            )}
            <p className="text-xs text-green-700 mt-1">
              Eligible for blood donation: {age !== null && age >= 18 && age <= 65 ? "✅ Yes" : "❌ No"}
            </p>
          </div>
        )}
        
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Shadcn Features:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click button to open calendar popover</li>
            <li>Dropdown navigation for year and month</li>
            <li>Defaults to ~30 years ago for better UX</li>
            <li>Prevents future dates and unrealistic past dates</li>
            <li>Beautiful formatted date display</li>
            <li>Full keyboard and accessibility support</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}