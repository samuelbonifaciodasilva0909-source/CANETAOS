import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

export const registerSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  ageConfirmed: z.literal(true, {
    message: "Você precisa confirmar que tem 18 anos ou mais",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

export const onboardingStep1Schema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
})

export const onboardingStep2Schema = z.object({
  medicationName: z.string().min(1, "Selecione uma opção"),
})

export const onboardingStep3Schema = z.object({
  treatmentDuration: z.string().min(1, "Selecione uma opção"),
})

export const onboardingStep4Schema = z.object({
  primaryGoal: z.string().min(1, "Selecione uma opção"),
})

export const onboardingStep5Schema = z.object({
  preferredContentType: z.string().min(1, "Selecione uma opção"),
})

export const trackerEntrySchema = z.object({
  entryDate: z.string().min(1, "Data é obrigatória"),
  weightKg: z.number().positive("Peso deve ser positivo").optional().nullable(),
  waistMeasurement: z.number().positive("Medida deve ser positiva").optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const symptomEntrySchema = z.object({
  entryDate: z.string().min(1, "Data é obrigatória"),
  nausea: z.boolean().default(false),
  constipation: z.boolean().default(false),
  hairLoss: z.boolean().default(false),
  foodAversion: z.boolean().default(false),
  tasteChange: z.boolean().default(false),
  fatigue: z.boolean().default(false),
  headache: z.boolean().default(false),
  otherNotes: z.string().optional().nullable(),
})

export const proteinCalculationSchema = z.object({
  bodyWeightKg: z.number().positive("Peso deve ser positivo"),
  mealsPerDay: z.number().min(1).max(10),
})

export const feedbackSchema = z.object({
  difficulty: z.string().optional().nullable(),
  featureRequest: z.string().optional().nullable(),
  willingnessToPay: z.string().optional().nullable(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type TrackerEntryInput = z.infer<typeof trackerEntrySchema>
export type SymptomEntryInput = z.infer<typeof symptomEntrySchema>
export type ProteinCalculationInput = z.infer<typeof proteinCalculationSchema>
