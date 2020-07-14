//config for a function and builds a function (factory)
import session,{SessionOptions} from 'express-session'

const sessionConfig:SessionOptions =
{
    secret: 'secret', 
    cookie:
    {
        secure:false
    }, 
    resave:false, 
    saveUninitialized:false

}
//session factory keeps track and makes obj 
//returns function as (req, res, next)
//attaches to session obj where each unique connection has a unique session then next()
export const sessionMiddleware = session(sessionConfig) 
