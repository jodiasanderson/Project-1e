//connection to DB data
import { PoolClient } from "pg";
import { connectionPool } from ".";
import { UserDTOtoUserConvertor } from "../utils/UserDTO-to-User-convertor";
import { UserNotFoundError } from "../errors/UserNotFoundError";
import { User } from "../models/User";
import { AuthFailureError} from '../errors/AuthFailureError';
import { UserUserInputError } from "../errors/UserUserInputError";

//Get all users
export async function getAllUsers():Promise<User[]> //<What we want to return as>
{
    let client: PoolClient
    try 
    {
        //get connection
        client = await connectionPool.connect()
        //send query
        let results = await client.query(`select u.user_id,u.username ,u."password" ,u.email ,r.role_id , r."role" from project0.users u left join project0.roles r on u."role" = r.role_id;`)
        return results.rows.map(UserDTOtoUserConvertor)//return rows
    } 
    catch (e) 
    {   
        console.log(e)
        throw new Error('Unhandled Error Occured')
    } 
    finally 
    {
        client && client.release()
    }
}

//Get user by id
export async function getUserById(id: number):Promise<User> 
{
    let client: PoolClient
    try 
    {
        client = await connectionPool.connect()
        let results = await client.query(`select u.user_id, 
                u.username , 
                u."password" , 
                u."firstName",
                u."lastName",
                u.email ,
                r.role_id , 
                r."role" 
                from project0.users u left join project0.roles r on u."role" = r.role_id 
                where u.user_id = $1;`,
            [id])//parameterized query- $1 to specify a parameter, then fills in value using array
        if(results.rowCount === 0)
        {
            throw new Error('User Not Found')
        }
        return UserDTOtoUserConvertor(results.rows[0])
    } 
    catch (e) 
    {
        if(e.message === 'User Not Found')
        {
            throw new UserNotFoundError()
        }
        console.log(e)
        throw new Error('Unhandled Error Occured')
    }
    finally
    {
        //connection goes back to the pool
        client && client.release()
    }
}


//Find user by username and password aka login
export async function getUserByUsernameAndPassword(username:string, password:string):Promise<User>{
    let client: PoolClient
    try 
    {
        client = await connectionPool.connect()
        let results = await client.query(`select u."user_id", 
               u.username , 
               u."password" , 
               u."firstName",
               u."lastName",
               u.email ,
                r.role_id , 
                r."role" 
                from project0.users u left join project0.roles r on u."role" = r.role_id 
                where u."username" = $1 and u."password" = $2;`,
            [username, password])
        if(results.rowCount === 0)
        {
            throw new Error('User Not Found')
        }
        return UserDTOtoUserConvertor(results.rows[0])
    }
     catch(e) 
    {
        if(e.message === 'User Not Found')
        {
            throw new AuthFailureError()
        }
        
        console.log(e)
        throw new Error('Unhandled Error Occured')
    }
    finally
    {
        client && client.release()
    }
}


//Save one user
export async function saveOneUser(newUser:User):Promise<User>
{
    let client:PoolClient
    try
    {
        client = await connectionPool.connect()
        //multiple querys for a transaction
        await client.query('BEGIN;')//start transaction
        let roleId = await client.query(`select r."role_id" from project0.roles r where r."role" = $1`, [newUser.role])
        if(roleId.rowCount === 0)
        {
            throw new Error('Role Not Found')
        }
        roleId = roleId.rows[0].role_id
        let results = await client.query(`insert into project0.users ("username", "password", "firstName", "lastName", "email","role")
                                            values($1,$2,$3,$4) returning "user_id" `,//returns some values from rows in an insert, update,delete
                                            [newUser.username, newUser.password, newUser.firstName, newUser.lastName, newUser.email, roleId])
        newUser.userId = results.rows[0].user_id
        await client.query('COMMIT;')//ends transaction
        return newUser
    }
    catch(e)
    {
        client && client.query('ROLLBACK;')//if this is a js error undo the sql
        if(e.message === 'Role Not Found')
        {
            throw new UserUserInputError()
        }
        console.log(e)
        throw new Error('Unhandled Error Occured')
    }
    finally
    {
        client && client.release();
    }
}

//Patch user?
export async function patchUser(patchUser:User):Promise<User> 
{
    let client:PoolClient
    try{
        client = await connectionPool.connect();
        client.query('begin');
        if(patchUser.username) 
        {
            await client.query(`update project0.users set "username" = $1 
                                where "user_id" = $2;`, 
                                [patchUser.username, patchUser.userId])
        }
        if(patchUser.password)
        {
            await client.query(`update project0.users set "password" = $1 
                                    where "user_id" = $2;`, 
                                    [patchUser.password, patchUser.userId])
        }
        if(patchUser.firstName) 
        {
            await client.query(`update project0.users set "firstName" = $1 
                                where "user_id" = $2;`, 
                                [patchUser.firstName, patchUser.userId])
        }
        if(patchUser.lastName) 
        {
            await client.query(`update project0.users set "lastName" = $1 
                                where "user_id" = $2;`, 
                                [patchUser.lastName, patchUser.userId])
        }
        if(patchUser.email) 
        {
            await client.query(`update project0.users set "email" = $1 
                                where "user_id" = $2;`, 
                                [patchUser.email, patchUser.userId])
        }
        if(patchUser.role) 
        {
            let roleId = await client.query(`select r."role_id" from project0.roles r 
                                where r."role" = $1`,[patchUser.role])
                                
        if(roleId.rowCount === 0) 
        {
            throw new Error('Role Not Found')
        }
            roleId = roleId.rows[0].role_id
            await client.query(`update project0.users set "role" = $1 
                                where "user_id" = $2;`, [roleId, patchUser.userId])
        }
        await client.query('COMMIT;')
        return patchUser   
    } 
    catch (e) 
    {
        client && client.query('ROLLBACK;')
        if(e.message === 'Role Not Found') 
        {
            throw new Error ('not working')
        }
        console.log(e);
        throw new Error('Unhandled Error')
    } 
    finally 
    {
        client && client.release()
    }
}
