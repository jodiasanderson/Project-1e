import { HttpError } from "./HttpError";
export class ReimNotFoundError extends HttpError //rem. we can't find :(
{
    constructor()
    {
        super(404, 'Reimbursement does not exist')
    }
}