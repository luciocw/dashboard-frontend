import { useState, FormEvent } from 'react'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

interface SearchFormProps {
  onSubmit: (username: string) => void
  isLoading?: boolean
  error?: string
}

export function SearchForm({ onSubmit, isLoading, error }: SearchFormProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit(value.trim())
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">🏈</div>
        <h2 className="text-xl font-semibold mb-2">Bem-vindo!</h2>
        <p className="text-slate-400 text-sm">Digite seu username do Sleeper</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Username do Sleeper"
          disabled={isLoading}
          autoComplete="off"
          error={error}
        />
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!value.trim()}
          className="w-full"
        >
          Entrar
        </Button>
      </form>
    </Card>
  )
}
