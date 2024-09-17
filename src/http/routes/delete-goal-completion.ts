import { z } from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

import { createGoalCompletion } from '../../functions/create-goal-completion'
import { getWeekPendingsGoals } from '../../functions/get-week-pending-goals'
import { DeleteGoalComplete } from '../../functions/delete-goal-completion'

const paramsSchema = z.object({
  id: z.string(),
})

export const deleteGoalCompletion: FastifyPluginAsyncZod = async app => {
  app.delete('/delete-goal-completion/:id', async request => {
    const { id } = paramsSchema.parse(request.params)
    await DeleteGoalComplete(id)

    return true
  })
}
