import dataSource from './data-source.js'

await dataSource.initialize()
await dataSource.runMigrations()
await dataSource.destroy()
