import { dev } from '$app/environment'
import { JsonDataProvider, SqlDatabase } from 'remult'
import { Sqlite3DataProvider } from 'remult/remult-sqlite3'
import { remultSveltekit } from 'remult/remult-sveltekit'
import { JsonEntityFileStorage } from "remult/server"
import sqlite3 from 'sqlite3'
import { Job } from '../../../shared/Job'

export const _api = remultSveltekit({
  entities: [Job],
  admin: true,
  dataProvider: dev ? new SqlDatabase(
    new Sqlite3DataProvider(new sqlite3.Database('./jobs.sqlite')),
  ) : new JsonDataProvider(new JsonEntityFileStorage("/tmp"))
})

export const GET = _api.GET
export const POST = _api.POST
export const PUT = _api.PUT
export const DELETE = _api.DELETE