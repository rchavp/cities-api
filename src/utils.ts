// Based on Harvesine Formula: https://en.wikipedia.org/wiki/Haversine_formula
export const getDistFromLatLon = (
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
) => {
  const deg2rad = ( deg: number )  => deg * ( Math.PI / 180 )

  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad( latitude2 - latitude1 )
  const dLon = deg2rad( longitude2 - longitude1 ) 
  const a = 
    Math.sin( dLat / 2 ) * Math.sin( dLat / 2 ) +
    Math.cos( deg2rad( latitude1 ) ) * Math.cos( deg2rad( latitude2 ) ) * 
    Math.sin( dLon / 2 ) * Math.sin( dLon / 2 )
     
  const c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) ) 
  const d = R * c // Distance in km
  return d
}

