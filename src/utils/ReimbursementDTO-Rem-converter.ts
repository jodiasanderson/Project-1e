import { ReimbursementDTO } from "../dtos/reimbursement-dto";
import { Reimbursement } from "../models/Reimbursement";

export function ReimbursementDTOConvertor( rdto:ReimbursementDTO):Reimbursement
{
    return {
        reimbursementId: rdto.reimbursement_id,
        author : rdto.author,
        amount: rdto.amount,  
        dateSubmitted : rdto.dateSubmitted,
        dateResolved: rdto.dateResolved,
        description: rdto.description,
        resolver: rdto.resolver,
        status: rdto.status,
        type: rdto.type
    
    }
} 

