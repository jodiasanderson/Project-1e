// different endpoints require different roles, 
//here I ensure that certain roles have access to specific endpoints and other roles do not
import { Request, Response, NextFunction } from "express";

// array of accepted roles,returns function granting those roles access
// middleware factory or factory func
export function authorizationMiddleware(roles:string[])
{
    return (req:Request, res:Response, next:NextFunction) => 
    {
        let allowed = false
        for(const role of roles )
        {
            if(req.session.user.role === role ) //|| req.session.user.id===id)
            {
                allowed = true
                next()
            }
        }
    
        if(!allowed)
        {
            res.status(403).send('You have insufficent permissions for this endpoint')
        }
    }

}
