//represents user data we get from DB
//DO NOT send to user because this is DB version 
export class UserDTO 
{
    user_id:number
    username:string
    password:string
    firstName: string 
    lastName: string
    email:string
    role:string
    role_id:number
    
}