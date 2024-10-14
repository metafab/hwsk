import { Entity, Fields } from 'remult'

@Entity('jobs', {
  allowApiCrud: true,
})
export class Job {
  @Fields.string()
  id!: string

  @Fields.string()
  title: string = ''

  @Fields.string()
  description: string = ''

  @Fields.string()
  url?: string

  @Fields.string()
  city: string = ''

  @Fields.string()
  location: string = ''

  @Fields.string()
  salary: string = ''

  @Fields.string()
  company: string = ''

  @Fields.string()
  contractType: string = ''

  @Fields.date()
  createdAt?: Date

  @Fields.date()
  updatedAt?: Date
}