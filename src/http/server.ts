import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createGoalRoute } from './routes/create-goals'
import { createCompletionGoalsRoute } from './routes/create-completion'
import { getPendingGoalsRoute } from './routes/get-pendings-route'
import { getWeekSummaryRoute } from './routes/get-week-summary'
import fastifyCors from '@fastify/cors'
import { deleteGoalCompletion } from './routes/delete-goal-completion'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: '*',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(getPendingGoalsRoute)

app.register(createCompletionGoalsRoute)

app.register(createGoalRoute)

app.register(getWeekSummaryRoute)

app.register(deleteGoalCompletion)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP server running')
  })
