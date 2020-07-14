//entry point of application 
import express, { Request, Response, NextFunction } from 'express'
import { reimbursementRouter } from './routers/reimbursement-router'
import { loginMiddleware } from './middleware/login-middleware'
import { userRouter } from './routers/user-router'
import { sessionMiddleware } from './middleware/session-middleware'
import { BadCredentialsError } from './errors/BadCredentialsError'
import { getUserByUsernameAndPassword } from './daos/user-dao'
 
//begins app
const app = express() 

//take request - becomes json object- look for next function (middleware)
app.use(express.json())

app.use(loginMiddleware) //custom MW to run on all req
app.use(sessionMiddleware) //tracks connections
app.use('/reimbursements', reimbursementRouter)
app.use('/users', userRouter)// redirect all requests on /users to the router


//endpoint for credentials to recieve authentication always aysnc! awaiting value!
app.post('/login', async (req:Request, res:Response, next:NextFunction)=>
{
    let username = req.body.username
    let password = req.body.password
    if(!username || !password)
    {
        
        throw new BadCredentialsError()
    } 
    else
    {
        try
        {
            let user = await getUserByUsernameAndPassword(username, password) 
            req.session.user = user// adds user data to session for other/future reqs
            res.json(user)
        }
        catch(e)
        {
            next(e)
        }
    }
})

//Error handler we wrote that express redirects top level errors to
app.use((err, req, res, next) => {
    //if it is one of our custom errors
    if (err.statusCode) {
        // use the status code and the message for the response
        res.status(err.statusCode).send(err.message)
    } else {
        // if it wasnt one of our custom errors
        console.log(err)//log it out for us to debug
        //send a generic error response
        res.status(500).send('Oops, Something went wrong')
    }
})

app.listen(2020, () => {
    console.log('Server has started');
})