"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MessageSquare } from "lucide-react"

export function FeedbackModal() {
  const [open, setOpen] = useState(false)
  const [difficulty, setDifficulty] = useState("")
  const [featureRequest, setFeatureRequest] = useState("")
  const [willingnessToPay, setWillingnessToPay] = useState("")
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty, featureRequest, willingnessToPay }),
      })
      setSubmitted(true)
    } catch {
      setSubmitted(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" />
        }
      >
        <MessageSquare className="h-4 w-4" />
        Feedback
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajude-nos a melhorar</DialogTitle>
        </DialogHeader>
        {submitted ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Obrigado pelo seu feedback! Isso nos ajuda a construir um produto melhor.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Qual é a maior dificuldade que você ainda tem?
              </label>
              <Textarea
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                placeholder="Compartilhe sua dificuldade..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Qual recurso faria você continuar usando o CanetaOS?
              </label>
              <Textarea
                value={featureRequest}
                onChange={(e) => setFeatureRequest(e.target.value)}
                placeholder="Qual funcionalidade você mais gostaria?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Você pagaria mensalmente por este produto?
              </label>
              <Input
                value={willingnessToPay}
                onChange={(e) => setWillingnessToPay(e.target.value)}
                placeholder="Ex: Sim, até R$ 30/mês"
              />
            </div>
            <Button onClick={handleSubmit} className="w-full">
              Enviar feedback
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
