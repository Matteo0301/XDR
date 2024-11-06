import morgan, { StreamOptions } from "morgan";

import Logger from "./logger";
// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream: StreamOptions = {
    // Use the http severity
    write: (message) => Logger.http(message),
};

const streamWarn: StreamOptions = {
    // Use the http severity
    write: (message) => Logger.warn(message),
};


// Build the morgan middleware
const morganMiddleware = morgan(
    // Define message format string (this is the default one).
    // The message format is made from tokens, and each token is
    // defined inside the Morgan library.
    // You can create your custom token to show what do you want from a request.
    ':remote-addr - [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
    // Options: in this case, I overwrote the stream and the skip logic.
    // See the methods above.
    { stream, skip: function (req, res) { return res.statusCode < 200 && res.statusCode >= 300 } }
);

// Build the morgan middleware
const warningsMiddleWare = morgan(
    // Define message format string (this is the default one).
    // The message format is made from tokens, and each token is
    // defined inside the Morgan library.
    // You can create your custom token to show what do you want from a request.
    ':remote-addr - [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
    // Options: in this case, I overwrote the stream and the skip logic.
    // See the methods above.
    { stream: streamWarn, skip: function (req, res) { return res.statusCode >= 200 && res.statusCode < 300 } }
);

export { morganMiddleware, warningsMiddleWare };