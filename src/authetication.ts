import type { Request, Response, NextFunction } from 'express'

export function checkSecurity ( req: Request, res: Response, next: NextFunction ) {
  const bearerHeader = req.headers[ 'authorization' ]


  if ( bearerHeader ) {
  const bearer = bearerHeader.split( ' ' )
  const bearerToken = bearer[1]
  // console.log( 'bearerToken', bearerToken )
  // req.token = bearerToken
  if ( bearerToken === 'dGhlc2VjcmV0dG9rZW4=' ) {
    // Authenticated OK
    // console.log( 'Bearer token ok' )
    next()
  } else {
    // Unauthorized
    // console.log( 'Bearer token not ok' )
    res.sendStatus( 401 )
  }
  } else {
    // console.log( 'No authorization header' )
    res.sendStatus( 401 )
    return
  }
}

