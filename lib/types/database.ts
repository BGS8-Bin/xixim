export type OrganizationType = "gobierno" | "academia" | "industria" | "organizacion_civil"

export type CompanySector =
  | "software"
  | "hardware"
  | "telecomunicaciones"
  | "consultoria"
  | "manufactura"
  | "servicios"
  | "educacion"
  | "investigacion"
  | "otro"

export type CompanySize = "micro" | "pequena" | "mediana" | "grande"

export type MembershipStatus = "pending" | "active" | "inactive" | "suspended"

export type MembershipType = "basica" | "premium" | "enterprise"

export type UserRole = "admin" | "editor" | "viewer"

export type AdmissionStatus = "pending" | "under_review" | "approved" | "rejected" | "more_info_needed" | "payment_pending" | "documents_pending" | "completed"

export type EntityType = "persona_fisica" | "persona_moral"

export type PaymentStatus = "pending" | "confirmed" | "rejected"

export type DocumentType = "carta_compromiso" | "info_comercial" | "estatutos" | "aviso_privacidad"

export type EventType = "networking" | "capacitacion" | "conferencia" | "taller" | "feria" | "reunion" | "otro"

export type EventStatus = "draft" | "published" | "cancelled" | "completed"

export type AttendeeStatus = "registered" | "confirmed" | "attended" | "cancelled" | "no_show"

export interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  description: string | null
  type: OrganizationType
  logo_url: string | null
  website: string | null
  email: string | null
  phone: string | null
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  city: string
  state: string
  country: string
  founded_year: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  legal_name: string | null
  rfc: string | null
  description: string | null
  sector: CompanySector
  size: CompanySize | null
  logo_url: string | null
  website: string | null
  email: string
  phone: string | null
  address: string | null
  city: string
  state: string
  country: string
  employee_count: number | null
  founded_year: number | null
  top_products: string | null
  purchase_requirements: string | null
  membership_status: MembershipStatus
  membership_type: MembershipType | null
  membership_start_date: string | null
  membership_end_date: string | null
  organization_id: string | null
  created_at: string
  updated_at: string
  organization?: Organization
}

export interface CompanyContact {
  id: string
  company_id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  position: string | null
  birthday: string | null
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface AdmissionRequest {
  id: string
  company_name: string
  trade_name: string | null
  rfc: string | null
  sector: string
  industry: string | null
  website: string | null
  contact_name: string
  contact_position: string
  contact_email: string
  contact_phone: string
  contact_birthday: string | null
  employee_count: string | null
  annual_revenue: string | null
  founding_year: number | null
  address: string | null
  city: string
  state: string
  motivation: string
  services_interest: string[] | null
  how_did_you_hear: string | null
  entity_type: EntityType | null
  is_sat_registered: boolean | null
  years_in_operation: number | null
  is_startup: boolean | null
  innovation_project_description: string | null
  guarantor_1_name: string | null
  guarantor_1_company: string | null
  guarantor_2_name: string | null
  guarantor_2_company: string | null
  previous_chambers_participation: string | null
  fiscal_document_url: string | null
  brochure_url: string | null
  top_products: string | null
  purchase_requirements: string | null
  status: AdmissionStatus
  reviewed_by: string | null
  review_notes: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  reviewer?: Profile
}

export interface Payment {
  id: string
  admission_request_id: string
  amount: number
  currency: string
  payment_method: string | null
  payment_reference: string | null
  payment_date: string | null
  proof_url: string | null
  status: PaymentStatus
  confirmed_by: string | null
  confirmed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MemberDocument {
  id: string
  admission_request_id: string
  document_type: DocumentType
  file_url: string | null
  signed: boolean
  signed_at: string | null
  created_at: string
  updated_at: string
}

export interface WelcomeKit {
  id: string
  admission_request_id: string
  company_id: string | null
  estatutos_accepted: boolean
  privacy_accepted: boolean
  accepted_at: string | null
  kit_sent: boolean
  kit_sent_at: string | null
  directory_access_granted: boolean
  created_at: string
  updated_at: string
}

export interface AdmissionComment {
  id: string
  admission_request_id: string
  user_id: string
  comment: string
  is_internal: boolean
  created_at: string
  user?: Profile
}

export interface Event {
  id: string
  title: string
  description: string | null
  event_type: EventType
  start_date: string
  end_date: string
  is_all_day: boolean
  location: string | null
  location_url: string | null
  is_virtual: boolean
  virtual_link: string | null
  max_attendees: number | null
  registration_required: boolean
  registration_deadline: string | null
  organizer_id: string | null
  organizer_name: string | null
  status: EventStatus
  is_public: boolean
  image_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  organizer?: Organization
  attendees_count?: number
}

export interface EventAttendee {
  id: string
  event_id: string
  user_id: string | null
  company_id: string | null
  attendee_name: string
  attendee_email: string
  attendee_phone: string | null
  attendee_company: string | null
  status: AttendeeStatus
  registered_at: string
  confirmed_at: string | null
  attended_at: string | null
}

// Announcement types
export type AnnouncementType = "general" | "evento" | "oportunidad" | "convocatoria" | "noticia"
export type AnnouncementPriority = "low" | "normal" | "high" | "urgent"
export type AnnouncementStatus = "draft" | "published" | "archived"

export interface Announcement {
  id: string
  title: string
  content: string
  excerpt: string | null
  announcement_type: AnnouncementType
  priority: AnnouncementPriority
  status: AnnouncementStatus
  published_at: string | null
  expires_at: string | null
  is_public: boolean
  target_audience: string[]
  image_url: string | null
  attachment_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  creator?: Profile
}

export interface AnnouncementRead {
  id: string
  announcement_id: string
  user_id: string
  read_at: string
}

// Campaign types
export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "failed" | "cancelled"
export type EmailStatus = "pending" | "sent" | "failed" | "bounced" | "opened" | "clicked"
export type WhatsAppStatus = "pending" | "sent" | "failed" | "delivered" | "read"
export type TrackingEventSource = "sendgrid" | "twilio" | "manual"

export interface CampaignFilters {
  membership_status?: MembershipStatus[]
  membership_type?: MembershipType[]
  sector?: CompanySector[]
  size?: CompanySize[]
  city?: string[]
  state?: string[]
}

export interface AnnouncementCampaign {
  id: string
  announcement_id: string
  name: string
  description: string | null
  filters: CampaignFilters
  send_to_all_companies: boolean
  send_to_contacts: boolean
  total_recipients: number
  emails_sent: number
  emails_failed: number
  emails_opened: number
  emails_clicked: number
  whatsapp_sent: number
  whatsapp_failed: number
  status: CampaignStatus
  scheduled_at: string | null
  started_at: string | null
  completed_at: string | null
  send_via_email: boolean
  send_via_whatsapp: boolean
  sendgrid_template_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  announcement?: Announcement
  creator?: Profile
}

export interface AnnouncementRecipient {
  id: string
  campaign_id: string
  company_id: string | null
  contact_id: string | null
  recipient_email: string
  recipient_name: string | null
  recipient_phone: string | null
  email_status: EmailStatus
  whatsapp_status: WhatsAppStatus
  sendgrid_message_id: string | null
  twilio_message_sid: string | null
  email_sent_at: string | null
  email_opened_at: string | null
  email_clicked_at: string | null
  whatsapp_sent_at: string | null
  error_message: string | null
  created_at: string
  updated_at: string
  company?: Company
  contact?: CompanyContact
}

export interface AnnouncementTrackingEvent {
  id: string
  recipient_id: string
  event_type: string
  event_source: TrackingEventSource
  event_data: Record<string, any> | null
  user_agent: string | null
  ip_address: string | null
  url_clicked: string | null
  event_timestamp: string
  created_at: string
}
