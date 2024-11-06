import express, { Express } from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import cors from 'cors'
import Helmet from "helmet"
import https from 'https'
import fs from 'fs'
import './lib/util/token'
import mongoose from 'mongoose'
import rateLimit from 'express-rate-limit'
import { Server } from 'http'
import Logger from './lib/util/logger'
import { randomBytes } from 'crypto'
import { morganMiddleware, warningsMiddleWare } from './lib/util/morganMiddleware'
import { setSecret } from './lib/util/token'
import { connect } from './lib/mongoose'

dotenv.config()

const max_requests = process.env.MAX_REQUESTS || '10000'
const max_requests_window = process.env.MAX_REQUESTS_WINDOW || '600000'
const limiter = rateLimit({
    windowMs: parseInt(max_requests_window), // 15 minutes
    max: parseInt(max_requests), // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})


const app: Express = express()
const port = process.env.PORT || 443

let server: Server | null = null

const CONNECTION_STRING = process.env.CONNECTION_STRING || "mongodb+srv://matteomariotti0301:<db_password>@xdr.y35n6.mongodb.net/?retryWrites=true&w=majority&appName=XDR"

async function initServer() {

    Logger.info(`⚡️[server]: Server is running at https://localhost:${port}`)
    if (process.env.NODE_ENV === 'production')
        await connect(CONNECTION_STRING)
    const random_secret = randomBytes(64).toString('hex');
    let secret = process.env.TOKEN_SECRET as string || random_secret
    setSecret(secret)
    Logger.info("MongoDB connection successful")
}

async function closeServer() {
    if (server) {
        Logger.info('Closing server')
        server.close()
        await close()
        Logger.info('Process terminated successfully')
        process.exit(1)
    }
}

/* process.on('SIGTERM', closeServer)
process.on('SIGINT', closeServer)
process.on('uncaughtException', closeServer) */

mongoose.connection.on('error', async () => {
    Logger.error('MongoDB connection error')
    await closeServer()
}
)

app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, }))
app.use(Helmet())
app.use(morganMiddleware)
app.use(warningsMiddleWare)
// Apply the rate limiting middleware to all requests
app.use(limiter)

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    /* server = https.createServer(
        {
            key: fs.readFileSync('key.pem'),
            cert: fs.readFileSync('cert.pem')
        },
        app
    ).listen(port, async () => {
        initServer()
    }); */
    app.listen(port, async () => {
        initServer()
    });

}

export { app, initServer as startServer }