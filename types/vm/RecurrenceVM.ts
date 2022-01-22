import { IRecurrence } from '../../models/recurrence.model'

export type RecurrenceVM = {
  type: IRecurrence["type"]
  repeat: IRecurrence['repeat']
  chore: IRecurrence['chore']
  startDate: IRecurrence['startDate']
}
