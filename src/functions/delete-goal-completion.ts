import { eq } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'

export async function DeleteGoalComplete(id: string) {
  await db.delete(goalCompletions).where(eq(goalCompletions.id, id))
}
