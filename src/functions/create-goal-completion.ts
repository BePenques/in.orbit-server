import dayjs from 'dayjs'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import { and, count, gte, lte, sql, eq, lt } from 'drizzle-orm'

interface CreateGoalCompletionRequest {
  goalId: string
}

export async function createGoalCompletion({
  goalId,
}: CreateGoalCompletionRequest) {
  const lastDayOfWeek = dayjs().endOf('week').toDate()
  const firstDayOfWeek = dayjs().startOf('week').toDate()

  const goalCompletionsCount = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('completionCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek),
          eq(goalCompletions.goalId, goalId)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  const result = await db
    .with(goalCompletionsCount)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount:
        sql`COALESCE(${goalCompletionsCount.completionCount},0)`.mapWith(
          Number
        ), //converte para numero
    })
    .from(goals)
    .leftJoin(goalCompletionsCount, eq(goalCompletionsCount.goalId, goals.id))
    .where(eq(goals.id, goalId))
    .limit(1)

  const { completionCount, desiredWeeklyFrequency } = result[0]

  if (completionCount >= desiredWeeklyFrequency) {
    throw new Error('Goal alredy completed this week!')
  }

  const insertResult = await db
    .insert(goalCompletions)
    .values({
      goalId,
    })
    .returning()

  const goalCompletion = insertResult[0]

  return {
    goalCompletion,
  }
}
