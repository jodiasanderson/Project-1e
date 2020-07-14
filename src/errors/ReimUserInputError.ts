import { HttpError } from "./HttpError";
export class ReimUserInputError extends HttpError 
{
    constructor()
    {
        super(400, 'Please Fill Out All Reimbursement Fields :( ')
    }
}