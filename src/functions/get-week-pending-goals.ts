import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { db } from '../db/index'
import { goalCompletions, goals } from '../db/schema'
import { and, count, gte, lte, sql, eq } from 'drizzle-orm'
import { number } from 'zod'
//lte - less than or equal

dayjs.extend(weekOfYear)

export async function getWeekPendingsGoals() {
  const lastDayOfWeek = dayjs().endOf('week').toDate()
  const firstDayOfWeek = dayjs().startOf('week').toDate()

  const goalsCreateUptToWeek = db.$with('goal_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(
        lte(goals.createdAt, lastDayOfWeek)
        /*todas as metas que a data de criação for 
        menor ou igual a semana atual */
      )
  )

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
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  const pendingGoals = await db
    .with(goalsCreateUptToWeek, goalCompletionsCount)
    .select({
      id: goalsCreateUptToWeek.id,
      title: goalsCreateUptToWeek.title,
      desiredWeeklyFrequency: goalsCreateUptToWeek.desiredWeeklyFrequency,
      completionCount:
        sql`COALESCE(${goalCompletionsCount.completionCount},0)`.mapWith(
          Number
        ), //converte para numero
    })
    .from(goalsCreateUptToWeek)
    .leftJoin(
      goalCompletionsCount,
      eq(goalCompletionsCount.goalId, goalsCreateUptToWeek.id)
    )

  return {
    pendingGoals,
  }
}
