import z from 'zod'

export const recuItemSchema = z.object({
  id: z.string().optional(),
  _delete: z.boolean().default(false),
  vignetteValueId: z.string().min(1, 'Valeur de vignette est requise'),
  quantity: z.coerce.number().min(1, 'Quantité doit être >= 1')
})

export const recuFormSchema = z.object({
  numeroRecu: z.string(),
  dateRecu: z.coerce.date(),
  note: z.string().default(''),
  items: recuItemSchema.array().min(1, 'Au moins un article est requis')
})

export type RecuForm = z.infer<typeof recuFormSchema>

export const serieSchema = z.object({
  vignetteValueId: z.string().min(1, 'Valeur de vignette est requise'),
  startSerieNum: z.coerce.number().min(0, 'Série début est requis!'),
  endSerieNum: z.coerce.number().min(0, 'Série fin est requis!')
})

export type SerieSchemaData = z.infer<typeof serieSchema>

export const accepteRecuFormSchema = z
  .object({
    series: serieSchema.array().min(1, 'Au moins un série est requis!')
  })
  .superRefine((data, ctx) => {
    data.series.forEach((s, idx) => {
      if (s.startSerieNum >= s.endSerieNum) {
        ctx.addIssue({
          path: ['series', idx, 'endSerieNum'],
          message: `Invalide #${idx + 1} serie number`,
          code: z.ZodIssueCode.custom
        })
      }
    })
  })
export type accepteRecuData = z.infer<typeof accepteRecuFormSchema>
