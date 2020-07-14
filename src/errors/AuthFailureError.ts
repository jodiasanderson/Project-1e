import { HttpError } from "./HttpError";

export class AuthFailureError extends HttpError
{
    constructor()
    {
        super(400, 'Invalid Credentials')
    }
}