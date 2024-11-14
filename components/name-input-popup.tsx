'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface NameInputPopupProps {
  onNameSubmit: (name: string) => void;
}

export function NameInputPopup({ onNameSubmit }: NameInputPopupProps) {
  const [name, setName] = useState('')
  const [isOpen, setIsOpen] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onNameSubmit(name.trim())
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to Rock Paper Scissors!</DialogTitle>
          <DialogDescription>
            Please enter your name to start playing.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Start Playing
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}