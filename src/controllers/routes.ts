import { Readable } from 'stream'
import type { Express } from 'express'

import { checkSecurity } from '../authetication'
import {
  getRecordsByTagAndActive,
  getRecordsByDistance,
  startCitiesByAreaSearch,
  getAllCities,
} from '../repositories/cities-repo'
import type { CityRecord, LongQueryResult } from '../repositories/cities-repo'


type CityByTagParams = {
  tag?: string | null;
  isActive?: string | null;
}

type DistanceParams = {
  from?: string | null;
  to?: string | null;
}

type AreaParams = {
  from?: string | null;
  distance?: string | null;
}

type ApiResponse =
  | { status: 'success', cities: CityRecord[] }
  | { status: 'success', from: CityRecord, to: CityRecord, unit: string, distance: number }
  | { status: 'success', resultsUrl: string }
  | { status: 'failed', reason: string }


// This structure is used to store long running query results in memory.
// Consider this a hack for the test purposes. In real life I would use something more robust
let longQueryResults: LongQueryResult = {}


const addRoutes = ( app: Express, host: string, port: number, longQueryResultsBag: LongQueryResult ) => {

  longQueryResults = longQueryResultsBag

  app.get<{}, ApiResponse, CityByTagParams>('/cities-by-tag', checkSecurity, (req, res) => {
    const { tag, isActive } = req.query as CityByTagParams

    if ( !tag || !isActive || !( isActive === 'true' || isActive === 'false' ) ) {
      res.status( 400 )
      res.send( { status: 'failed', reason: 'bad request' } )
      return
    }
    // console.log( 'tag:', tag )
    // console.log( 'isActive:', isActive )

    const cities = getRecordsByTagAndActive( tag, isActive === 'true' )

    res.status( 200 )
    res.send( { status: 'success', cities } )
  })


  app.get<{}, ApiResponse, DistanceParams>('/distance', checkSecurity, (req, res) => {
    const { from, to }= req.query as DistanceParams

    if ( !from || !to ) {
      res.status( 400 )
      res.send( { status: 'failed', reason: 'bad request' } )
      return
    }
    // console.log( 'from:', from )
    // console.log( 'to:', to )

    try {
      const { cityFrom, cityTo, unit, distance } = getRecordsByDistance( from, to )
      res.status( 200 )
      res.send( {
        status: 'success',
        from: cityFrom,
        to: cityTo,
        unit: 'km',
        distance,
      })
    } catch ( ex: any ) {
      res.status( 400 )
      res.send( { status: 'failed', reason: `bad request: ${ex}` } )
    }
  })


  app.get<{}, ApiResponse, AreaParams>('/area', checkSecurity, (req, res) => {
    const { from, distance }= req.query as AreaParams

    // res.status( 203 )
    // res.send( { status: 'success', resultsUrl: `:http:127.0.0.1:8080/area-result/coco1234guid` } )
    // return
    if ( !from || !distance || isNaN( Number( distance ) ) ) {
      res.status( 400 )
      res.send( { status: 'failed', reason: 'bad request' } )
      return
    }

    const uuid = startCitiesByAreaSearch( from, Number( distance ) )

    const server = `http://${host}:${port}`
    res.status( 202 )
    res.send( { status: 'success', resultsUrl: `${server}/area-result/${uuid}` } )
    return
  })


  app.get<{uuid:string}, ApiResponse>('/area-result/:uuid', checkSecurity, (req, res) => {
    const uuid = req.params.uuid

    if ( !uuid ) {
      res.status( 400 )
      res.send( { status: 'failed', reason: 'bad request: missing uuid' } )
      return
    }

    if ( longQueryResults[ uuid ] ) {
      const jobResult = longQueryResults[ uuid ]
      if ( jobResult.status === 'success' ) {
        delete longQueryResults[ uuid ]
        const cities = jobResult.cities
        console.log( 'we got a job response!!', cities )
        res.status( 200 )
        res.send( { status: 'success', cities } )
      } else {
        const reason = jobResult.reason
        res.status( 422 ) // Unprocessable entity
        res.send( { status: 'failed', reason } )
      }
    } else {
      res.status( 202 )
      res.send( { status: 'failed', reason: 'pending job' } )
    }
  })


  app.get('/all-cities', checkSecurity, (_, res) => {
    const readableStream = Readable.from( JSON.stringify( getAllCities() ) )
    res.setHeader('Content-Type', 'application/json')
    res.status( 200 )
    readableStream.pipe(res)
  })

  return app
}

export default addRoutes
