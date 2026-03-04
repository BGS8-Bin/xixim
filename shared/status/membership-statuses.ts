export const MEMBERSHIP_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
} as const

export type MembershipStatusValue = typeof MEMBERSHIP_STATUS[keyof typeof MEMBERSHIP_STATUS]
