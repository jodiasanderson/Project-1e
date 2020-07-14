//import { ReimbursementStatus } from "./ReimbursementStatus"
//import { ReimbursementType } from "./ReimbursementType"

export class Reimbursement
{
    reimbursementId: number 
    author: number 
    amount: number  
    dateSubmitted: Date
    dateResolved: Date 
    description: string 
    resolver: number 
    status: number
    type: number
  }