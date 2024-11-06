import { sign, verify } from 'jsonwebtoken'
import { Response, NextFunction } from 'express'
import { Request } from 'express'
import Logger from './logger'

let secret = ""

function generateAccessToken(username: String, admin: boolean) {
    Logger.debug('Secret: ' + secret)
    return sign({ username: username, admin: admin }, secret, { expiresIn: '24h' })
}

function setSecret(new_secret: string) {
    secret = new_secret
}

async function authenticateToken(req: Request, res: Response, next: NextFunction) {
    let token
    const header = req.headers['authorization']
    Logger.debug(header)
    if (header && typeof header === 'string') {
        if (header.startsWith('Bearer ')) {
            token = header.split(' ')[1]
        } else {
            res.sendStatus(401)
            return;
        }

    } else {
        res.sendStatus(401)
        return;
    }

    if (token == null) {
        Logger.info('Token is null')
        return res.sendStatus(401)
    }

    verify(token, secret, async (err: any, user: any) => {
        if (err) {
            Logger.error(err)
            Logger.debug('Authentication failed')
            return res.sendStatus(403)
        }

        // Check if user is in the database
        /* const db_user = await getUser(user.username)
        if (!db_user) {
            Logger.debug('Authentication failed: ' + user.username + ' is not in the database')
            return res.sendStatus(403)
        } */

        req.user = user.username
        req.admin = user.admin
        Logger.info('Authentication successful: ' + req.user)

        next()
    })
}



export { generateAccessToken, authenticateToken, setSecret }
