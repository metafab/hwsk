import { remultSveltekit } from 'remult/remult-sveltekit'
import { Job } from '../../../shared/Job'
// import { SqlDatabase } from 'remult'
// import sqlite3 from 'sqlite3'
// import { Sqlite3DataProvider } from 'remult/remult-sqlite3'
import { JsonDataProvider } from "remult"
import { JsonEntityFileStorage } from "remult/server"

export const _api = remultSveltekit({
  entities: [Job],
  admin: true,
  // dataProvider: new SqlDatabase(
  //   new Sqlite3DataProvider(new sqlite3.Database('./jobs.sqlite')),
  // ),
  dataProvider: async () =>
    new JsonDataProvider(new JsonEntityFileStorage("/tmp"))
})

export const GET = _api.GET
export const POST = _api.POST
export const PUT = _api.PUT
export const DELETE = _api.DELETE