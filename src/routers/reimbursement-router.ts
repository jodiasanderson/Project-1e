import express, { Request, Response, NextFunction} from 'express'
import { getAllReim, findbyStatus,  findbyUser, submitReimbursement, updateReimbursementInfo } from '../daos/reimbursement-dao'
import { ReimIdInputError } from '../errors/ReimIdInputError'
import { Reimbursement } from '../models/Reimbursement'
import { ReimUserInputError } from '../errors/ReimUserInputError'
import { authorizationMiddleware } from '../middleware/authorization-middleware'

export let reimbursementRouter = express.Router()

//GET all reimbursements
reimbursementRouter.get('/', async(req:Request, res:Response,next: NextFunction)=> 
{
    try
    { 
    let allReimbursement = await getAllReim()
    res.json(allReimbursement) 
    } 
    catch (e) 
    {
    next(e)
    }
})

//GET reimbursements statusID
reimbursementRouter.get('/status/:id', authorizationMiddleware(['finance manager']),async (req:Request, res:Response,next:NextFunction )=> 
{
    let{id} = req.params
    if(isNaN(+id))
    {
        throw new ReimIdInputError()
    } 
    else 
    {
        try 
        {
            let reimbByStatusId = await findbyStatus(+id)
            res.json(reimbByStatusId)
        } 
        catch(e)
        {
            next(e)
        }
    }
})

//GET reimbursements by author & userId
reimbursementRouter.get('/author/userId/:userId', authorizationMiddleware(['finance manager']),async (req:Request, res:Response,next:NextFunction )=> //destructuring
{
    let{userId} = req.params
    if(isNaN(+userId))
    {
        throw new ReimIdInputError()
    } 
    else 
    {
        try 
        {
            let reimbByUserId = await findbyUser(+userId)
            res.json(reimbByUserId)
        } 
        catch(e)
        {
            next(e)
        }
    }
})


//POST Submit Reimbursement
reimbursementRouter.post('/',async (req:Request, res:Response, next:NextFunction) => 
{
    console.log(req.body);
    let { amount, description, type, author } = req.body
        //let author =req.session.userId ? kind of unecessary made !=undefined instead
        //console.log(amount) check check....
        //console.log(author) checking values
    if(author!=undefined || amount!= undefined || description!= undefined||type!=undefined) 
    {
        let newReim: Reimbursement = 
        {
            reimbursementId: 0,
            author,
            amount,
            dateSubmitted: new Date(),
            dateResolved: new Date(),
            description,
            resolver: author,
            status:1,    
            type
        }
        newReim.type || null
        try {
            //console.log('checking...')
                let savedReim = await submitReimbursement(newReim)
                res.json(savedReim)
            }
         catch (e) 
        {
            next(e)
        }
    }
    else 
    {
        throw new ReimUserInputError()
    }

})

//PATCH Update Reimbursement
reimbursementRouter.patch('/', authorizationMiddleware(['finance manager']), async (req:Request, res:Response, next:NextFunction) => {
    let { reimbursementId,
        author,
        amount,
        dateSubmitted,
        dateResolved,
        description,
        resolver,
        status,
        type} = req.body
        console.log(req.body)
    if(reimbursementId == undefined) 
    { 
        res.status(400).send('Reimbursement updates require ID and another field')
    }
    if(isNaN(+reimbursementId)) 
    { 
        res.status(400).send('ID must be a number')
    } 
    console.log(status)
    if  (status === "approved" || status === "denied")
    {
           
        let updatedReimInfo:Reimbursement = 
        { 
            reimbursementId, 
            author,
            amount,
            dateSubmitted,
            dateResolved,
            description,
            resolver,
            status,
            type
        }
        updatedReimInfo.author = author || undefined
        updatedReimInfo.amount = amount || undefined
        updatedReimInfo.dateSubmitted = dateSubmitted || undefined
        updatedReimInfo.dateResolved = dateResolved || undefined
        updatedReimInfo.description = description || undefined
        updatedReimInfo.resolver = resolver || undefined
        updatedReimInfo.status = status || undefined
        updatedReimInfo.type = type || undefined
        try 
        {
            let results = await updateReimbursementInfo(updatedReimInfo)
            res.json(results)
        } 
        catch (e) 
        {
            next(e)
        }
        } 
        else 
        {
         let updatedReimInfo: Reimbursement =
        {
            reimbursementId,
            author,
            amount,
            dateSubmitted: new Date(),
            dateResolved: new Date(),
            description,
            resolver,
            status,
            type
        }
        updatedReimInfo.author = author || undefined
        updatedReimInfo.amount = amount || undefined
        updatedReimInfo.description = description || undefined      
        updatedReimInfo.status = status || undefined
        updatedReimInfo.type = type || undefined   
        try 
        {
            console.log('checking req body...')
            let updatedReimbursementResults = await updateReimbursementInfo(updatedReimInfo)
            res.json(updatedReimbursementResults)
        }
         catch (e) 
        {
            next(e)
        }
    }
})