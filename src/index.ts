import express from 'express'
import { initRepo } from './repositories/cities-repo'
import addRoutes from './controllers/routes'

const app = express()
const host = '127.0.0.1'
const port = 8080


// Bootstrap repository, then routes, then start the api server
initRepo().then( longQueryResults => {
  addRoutes( app, host, port, longQueryResults )
  app.listen(port, () => {
    console.log(`Api listening on port ${port}`)
  })
}).catch( ex => {
  console.error( 'Could not intitialize repository', ex )
  console.error( 'Exiting ...' )
  process.exit( -1 )
})

