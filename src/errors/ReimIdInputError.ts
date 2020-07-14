import { HttpError } from "./HttpError";
export class ReimIdInputError extends HttpError
{
    constructor()
    {
        super(400, 'Id needs to be a number')
    }
}