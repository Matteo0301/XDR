export { };

declare global {
    namespace Express {
        interface Request {
            user: string;
            admin: boolean;
            start: Date;
            end: Date;
        }
    }
}
