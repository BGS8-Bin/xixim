// Admission schemas
export {
    admissionCreateSchema,
    admissionUpdateStatusSchema,
    admissionRejectSchema,
    type AdmissionCreateInput,
    type AdmissionUpdateStatusInput,
    type AdmissionRejectInput,
} from './admission.schema'

// Payment schemas
export {
    paymentCreateSchema,
    paymentConfirmSchema,
    paymentRejectSchema,
    paymentUpdateSchema,
    type PaymentCreateInput,
    type PaymentConfirmInput,
    type PaymentRejectInput,
    type PaymentUpdateInput,
} from './payment.schema'

// Company schemas
export {
    companyCreateSchema,
    companyUpdateSchema,
    type CompanyCreateInput,
    type CompanyUpdateInput,
} from './company.schema'
