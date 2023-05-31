import fs from 'fs-extra'
import crypto from 'crypto'

import { getDistFromLatLon } from '../utils';


export type CityRecord = {
  "guid": string;
  "isActive": false,
  "address": string;
  "latitude": number;
  "longitude": number;
  "tags": string[],
}

type UUID = string;

type ResultToken =
  | { status: 'success', cities: CityRecord[] }
  | { status: 'error', reason: string }

// Long query results are stiored in an object indexed by the GUUID or the search for fast retrieval
export type LongQueryResult = {
  [key: UUID]: ResultToken
}


let data: CityRecord[] = []

const longQueryResults: LongQueryResult = {}


// We use an in memory repository for this test because it is an easy hack
// In real life we would use a DB, Redis, etc ..,
// However notice that as long as the actual repo logic is constrained here, the rest of the code need not change
export const initRepo = async () => {
  try {
    const file = await fs.readFile( './data/addresses.json' )
    data = JSON.parse( file.toString() ) as CityRecord[]
    // console.log( 'Repository initialized ok. First 2 recs:', data.slice(0, 2))
    return longQueryResults
  } catch ( ex: any ) {
    throw Error( ex )
  }
}

export const getRecordsByTagAndActive = ( tag: string, isActive: boolean ) =>
  data.filter( e => e.tags.includes( tag ) && e.isActive === isActive )

export const getRecordsByDistance = ( from: string, to: string ) => {
  const cityFrom = data.find( e => e.guid === from )
  const cityTo = data.find( e => e.guid === to )

  if ( !cityFrom || !cityTo ) {
    throw Error( 'One of the cities was not found' )
  }

  const distance = getDistFromLatLon(
    cityFrom.latitude,
    cityFrom.longitude,
    cityTo.latitude,
    cityTo.longitude,
  )

  const result = {
    cityFrom,
    cityTo,
    unit: 'km',
    distance: +( distance.toFixed(2) ),
  }
  return result
}

export const startCitiesByAreaSearch = ( from: string, distance: number ) => {

  if ( distance <=0 ) {
    throw Error( 'Distance must be positive' )
  }

  const cityFrom = data.find( e => e.guid === from )

  if ( !cityFrom ) {
    throw Error( `City not found:${from}` )
  }

  const uuid = '2152f96f-50c7-4d76-9e18-f7033bd14428' // in real life we use: crypto.randomUUID() 

  // Trigger the promise but don't wait
  // In real life just calling the promise may suffice when the process is really asynchronous
  // Here it is not really async, so a timeout is necessary to guarantee that this function ends quickly.
  setTimeout( () => searchCitiesInArea( cityFrom, distance, uuid ), 0 )

  return uuid
}

export const getAllCities = () => {
  return data
}


const searchCitiesInArea = ( cityFrom: CityRecord, distance: number, uuid: string ) =>
  new Promise<void>( ( resolve, reject ) => {
    try {
      const citiesWithinDistance = data.filter( e => {
        const dist = getDistFromLatLon( cityFrom.latitude, cityFrom.longitude, e.latitude, e.longitude )
        return dist > 0 && dist < distance
      })
      console.log( 'citiesWithinDistance', citiesWithinDistance.length )
      longQueryResults[ uuid ] = { status: 'success', cities: citiesWithinDistance }
      resolve()
    } catch ( ex: any ) {
      longQueryResults[ uuid ] = { status: 'error', reason: ex }
      reject()
    }
  })
