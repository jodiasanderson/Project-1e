import {PoolClient, QueryResult} from "pg"; 
import {connectionPool} from ".";
import { ReimbursementDTOConvertor } from "../utils/ReimbursementDTO-Rem-converter";
import { ReimNotFoundError } from "../errors/ReimNotFoundError";
import { Reimbursement } from "../models/Reimbursement";

//gets reimbursements from DB
export async function getAllReim():Promise<Reimbursement[]>
{
    let client:PoolClient; 
    try
    {
        client = await connectionPool.connect()
        let results:QueryResult = await client.query(`select r."reimbursement_id", r."author", 
                                                    r."amount", 
                                                    r."dateSubmitted", 
                                                    r."dateResolved", 
                                                    r."description", 
                                                    r."resolver", 
                                                    r."status",
                                                    r."type"
                                                        from project0.reimbursement r
                                                left join project0.reimbursementstatus rs
                                                    on r."status" = rs.status_id
                                                left join project0.reimbursementtype rt
                                                    on r."type" = rt.type_id order by r."dateSubmitted";`)
        return results.rows.map(ReimbursementDTOConvertor) 
    }
    catch(e)
    {
        console.log(e)
        throw new Error ('un-implented error handling')
    }
    finally
    {
       client && client.release() 
    }
}


export async function findbyStatus(statusId: number):Promise<Reimbursement[]>
{
    let client: PoolClient
    try {
        //get a connection
        client = await connectionPool.connect()
        //send the query
        let results = await client.query(`select r."reimbursement_id", r."author", r."amount", r."dateSubmitted", r."dateResolved", r."description", 
                                            r."resolver", r."status", r."type" from project0.reimbursement r left join project0.reimbursementstatus rs
                                            on r."status" = rs.status_id left join project0.reimbursementtype rt on r."type" = rt.type_id 
                                            where r."status" =$1 order by r."dateSubmitted";`, [statusId])
        if(results.rowCount === 0)
        {
            throw new Error('Reimbursement Not Found')
        }
        else
        { 
            return results.rows.map(ReimbursementDTOConvertor)
    
        }   
    }
    catch (e) 
    {
        if(e.message === 'Reimbursement Not Found')
        {
            throw new ReimNotFoundError()
        }
        console.log(e)
        throw new Error('Unhandled Error Occured')
    }
    finally 
    {
        client && client.release()
    }
}

export async function findbyUser(userId: number):Promise<Reimbursement[]>
{
    let client: PoolClient
    try {
        
        client = await connectionPool.connect()
        let results = await client.query(`select * from project0.reimbursement r 
        left join  project0.users u on r.author = u.user_id
        left join project0.reimbursementstatus rs on r.status = rs.status_id 
        left join project0.reimbursementtype rt on r."type" = rt.type_id
        where r.author = $1 order by r."dateSubmitted";`, [userId])
        
            // $1 to specify a parameter to fill in a value using an array as second arg of query function
        if(results.rowCount === 0)
        {
            throw new Error('User Not Found')
        }
        else
        { 
            return results.rows.map(ReimbursementDTOConvertor)
    
        }   
    }
    catch (e) 
    {
        if(e.message === 'Reimbursement Not Found')
        {
            throw new ReimNotFoundError()
        }
        console.log(e)
        throw new Error('Unhandled Error Occured')
    }
    finally 
    {
        client && client.release()
    }
}

//Submit Reimbursement
export async function submitReimbursement(newReim:Reimbursement):Promise<Reimbursement> {
    let client:PoolClient
   try {
        client = await connectionPool.connect()
        await client.query('BEGIN;')
         let typeId = await client.query(`select t."type_id" from project0.reimbursementtype t where t."type_id" =$1;`,[newReim.type])
        //console.log(typeId)
        //console.log(typeId.rowCount === 0)
        console.log(newReim)
        if(typeId.rowCount === 0) 
        {
            throw new Error('Type Not Found')
        }
        
        typeId = typeId.rows[0].type_id 
        
        let results = await client.query(`insert into project0.reimbursement ("author", "amount", "dateSubmitted", "dateResolved",
        "description", "resolver", "status", "type") values($1,$2,$3,$4,$5,$6,$7,$8) returning "reimbursement_id";`,
                        [newReim.author, newReim.amount, newReim.dateSubmitted, newReim.dateResolved,
                            newReim.description,newReim.resolver, newReim.status, typeId]) ;
                                       
        //console.log(results)
                                        
        newReim.reimbursementId = results.rows[0].reimbursement_id
        await client.query('COMMIT;')
        return newReim
     } catch (e) {
        client && client.query('ROLLBACK;')
        if(e.message === 'Type Not Found' || e.message === 'Status Not Found') {
            throw new Error("DOA -_-")
        } 
        console.log(e);
        throw new Error('Unhandled Error Occured')
    } finally {
        client && client.release()
    }
    
}

export async function updateReimbursementInfo(updatedReimbursementInfo:Reimbursement):Promise<Reimbursement> {
    let client:PoolClient
    try {
        client = await connectionPool.connect()
        await client.query('BEGIN;')

        if(updatedReimbursementInfo.author) {
            await client.query(`update project0.reimbursement set "author" = $1 
                                where "reimbursement_id" = $2;`, 
                                [updatedReimbursementInfo.author, updatedReimbursementInfo.reimbursementId])
        }
        if(updatedReimbursementInfo.amount) {
            await client.query(`update project0.reimbursement set "amount" = $1 
                                where "reimbursement_id" = $2;`, 
                                [updatedReimbursementInfo.amount, updatedReimbursementInfo.reimbursementId])
        }
        if(updatedReimbursementInfo.dateSubmitted) {
            await client.query(`update project0.reimbursement set "dateSubmitted" = $1 
                                where "reimbursement_id" = $2;`, 
                                [updatedReimbursementInfo.dateSubmitted, updatedReimbursementInfo.reimbursementId])
        }
        if(updatedReimbursementInfo.dateResolved) {
            await client.query(`update project0.reimbursement set "dateResolved" = $1 
                                where "reimbursement_id" = $2;`, 
                                [updatedReimbursementInfo.dateResolved, updatedReimbursementInfo.reimbursementId])
        }
        if(updatedReimbursementInfo.description) {
            await client.query(`update project0.reimbursement set "description" = $1 
                                where "reimbursement_id" = $2;`, 
                                [updatedReimbursementInfo.description, updatedReimbursementInfo.reimbursementId])
        }
        if(updatedReimbursementInfo.resolver) {
            await client.query(`update project0.reimbursement set "resolver" = $1 
                                where "reimbursement_id" = $2;`, 
                                [updatedReimbursementInfo.resolver, updatedReimbursementInfo.reimbursementId])
        }
        if(updatedReimbursementInfo.status) {
            let statusId = await client.query(`select rs."status_id" from project0.reimbursementstatus rs 
                                            where rs."status_id" = $1;`, [updatedReimbursementInfo.status])
            if(statusId.rowCount === 0) {
                throw new Error('Status Not Found')
            }
            statusId = statusId.rows[0].status_id
            await client.query(`update project0.reimbursement set "status" = $1 
                                where "reimbursement_id" = $2;`, 
                                [statusId, updatedReimbursementInfo.reimbursementId])
        }
        if(updatedReimbursementInfo.type) 
        {
            console.log(updatedReimbursementInfo.type)
            let typeId = await client.query(`select rt."type_id" from project0.reimbursementtype rt 
                                            where rt."type_id" = $1;`, [updatedReimbursementInfo.type])
                                            
            if(typeId.rowCount === 0) {
                throw new Error('Type Not Found')
            }
            // typeId = typeId.rows[0].type_id
            // //await client.query(`update project0.reimbursementtype set "type" = $1 
            //                     where "reimbursement_id" = $2;`, 
             //                   [typeId, updatedReimbursementInfo.reimbursementId])
        }

        await client.query('COMMIT;')
        return updatedReimbursementInfo
    } catch(e) {
        client && client.query('ROLLBACK;')
       if(e.message == 'Status Not Found' || e.message == 'Type Not Found') {
            throw new Error('DAO side')
       }
        console.log(e);
        throw new Error('Unhandled Error')
    } finally {
        client && client.release()
    }
}

