
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "attendance": {
                  Row: {
                    "created_at": string,"id": string,"marked_by": string | null,"session_id": string,"status": Database["public"]['Enums']["attendance_status"],"student_id": string
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"marked_by"?: string | null,"session_id": string,"status": Database["public"]['Enums']["attendance_status"],"student_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"marked_by"?: string | null,"session_id"?: string,"status"?: Database["public"]['Enums']["attendance_status"],"student_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "attendance_marked_by_fkey"
      columns: ["marked_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "attendance_session_id_fkey"
      columns: ["session_id"]
isOneToOne: false
      referencedRelation: "class_sessions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "attendance_student_id_fkey"
      columns: ["student_id"]
isOneToOne: false
      referencedRelation: "students"
      referencedColumns: ["id"]
    }
                  ]
                },"class_sessions": {
                  Row: {
                    "class_id": string,"created_at": string,"id": string,"session_date": string,"status": Database["public"]['Enums']["session_status"]
                  }
                  Insert: {
                    "class_id": string,"created_at"?: string,"id"?: string,"session_date": string,"status"?: Database["public"]['Enums']["session_status"]
                  }
                  Update: {
                    "class_id"?: string,"created_at"?: string,"id"?: string,"session_date"?: string,"status"?: Database["public"]['Enums']["session_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "class_sessions_class_id_fkey"
      columns: ["class_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["id"]
    }
                  ]
                },"classes": {
                  Row: {
                    "capacity": number,"coach_id": string | null,"course_id": string,"created_at": string,"end_date": string,"end_time": string,"id": string,"start_date": string,"start_time": string,"venue_id": string | null,"weekday": number
                  }
                  Insert: {
                    "capacity": number,"coach_id"?: string | null,"course_id": string,"created_at"?: string,"end_date": string,"end_time": string,"id"?: string,"start_date": string,"start_time": string,"venue_id"?: string | null,"weekday": number
                  }
                  Update: {
                    "capacity"?: number,"coach_id"?: string | null,"course_id"?: string,"created_at"?: string,"end_date"?: string,"end_time"?: string,"id"?: string,"start_date"?: string,"start_time"?: string,"venue_id"?: string | null,"weekday"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "classes_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "coaches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "classes_course_id_fkey"
      columns: ["course_id"]
isOneToOne: false
      referencedRelation: "courses"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "classes_venue_id_fkey"
      columns: ["venue_id"]
isOneToOne: false
      referencedRelation: "venues"
      referencedColumns: ["id"]
    }
                  ]
                },"coaches": {
                  Row: {
                    "bio": string | null,"certifications": (string)[],"created_at": string,"id": string,"is_active": boolean,"name": string,"photo_url": string | null,"profile_id": string | null
                  }
                  Insert: {
                    "bio"?: string | null,"certifications"?: (string)[],"created_at"?: string,"id"?: string,"is_active"?: boolean,"name": string,"photo_url"?: string | null,"profile_id"?: string | null
                  }
                  Update: {
                    "bio"?: string | null,"certifications"?: (string)[],"created_at"?: string,"id"?: string,"is_active"?: boolean,"name"?: string,"photo_url"?: string | null,"profile_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "coaches_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"courses": {
                  Row: {
                    "age_group": Database["public"]['Enums']["age_group"],"cover_url": string | null,"created_at": string,"default_coach_id": string | null,"description": string | null,"id": string,"is_active": boolean,"level": Database["public"]['Enums']["skill_level"],"price": number,"sessions_count": number,"title": string
                  }
                  Insert: {
                    "age_group": Database["public"]['Enums']["age_group"],"cover_url"?: string | null,"created_at"?: string,"default_coach_id"?: string | null,"description"?: string | null,"id"?: string,"is_active"?: boolean,"level": Database["public"]['Enums']["skill_level"],"price": number,"sessions_count": number,"title": string
                  }
                  Update: {
                    "age_group"?: Database["public"]['Enums']["age_group"],"cover_url"?: string | null,"created_at"?: string,"default_coach_id"?: string | null,"description"?: string | null,"id"?: string,"is_active"?: boolean,"level"?: Database["public"]['Enums']["skill_level"],"price"?: number,"sessions_count"?: number,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "courses_default_coach_id_fkey"
      columns: ["default_coach_id"]
isOneToOne: false
      referencedRelation: "coaches"
      referencedColumns: ["id"]
    }
                  ]
                },"custom_requests": {
                  Row: {
                    "colors": string | null,"contact_email": string | null,"contact_name": string,"contact_phone": string,"created_at": string,"due_date": string | null,"estimate_amount": number | null,"fabric": string | null,"features": string[],"id": string,"item_type": Database["public"]['Enums']["custom_item_type"],"logo_url": string | null,"notes": string | null,"paid_at": string | null,"payment_method": string | null,"payment_ref": string | null,"payment_status": string,"profile_id": string | null,"qty": number,"quote_amount": number | null,"quote_note": string | null,"roster": NonNullable<Json>,"size_breakdown": NonNullable<Json>,"status": Database["public"]['Enums']["custom_request_status"],"team_name": string
                  }
                  Insert: {
                    "colors"?: string | null,"contact_email"?: string | null,"contact_name": string,"contact_phone": string,"created_at"?: string,"due_date"?: string | null,"estimate_amount"?: number | null,"fabric"?: string | null,"features"?: string[],"id"?: string,"item_type": Database["public"]['Enums']["custom_item_type"],"logo_url"?: string | null,"notes"?: string | null,"paid_at"?: string | null,"payment_method"?: string | null,"payment_ref"?: string | null,"payment_status"?: string,"profile_id"?: string | null,"qty": number,"quote_amount"?: number | null,"quote_note"?: string | null,"roster"?: NonNullable<Json>,"size_breakdown"?: NonNullable<Json>,"status"?: Database["public"]['Enums']["custom_request_status"],"team_name": string
                  }
                  Update: {
                    "colors"?: string | null,"contact_email"?: string | null,"contact_name"?: string,"contact_phone"?: string,"created_at"?: string,"due_date"?: string | null,"estimate_amount"?: number | null,"fabric"?: string | null,"features"?: string[],"id"?: string,"item_type"?: Database["public"]['Enums']["custom_item_type"],"logo_url"?: string | null,"notes"?: string | null,"paid_at"?: string | null,"payment_method"?: string | null,"payment_ref"?: string | null,"payment_status"?: string,"profile_id"?: string | null,"qty"?: number,"quote_amount"?: number | null,"quote_note"?: string | null,"roster"?: NonNullable<Json>,"size_breakdown"?: NonNullable<Json>,"status"?: Database["public"]['Enums']["custom_request_status"],"team_name"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "custom_requests_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"enrollments": {
                  Row: {
                    "claim_token": string | null,"class_id": string,"created_at": string,"id": string,"notes": string | null,"parent_email": string | null,"parent_name": string | null,"parent_phone": string | null,"source": Database["public"]['Enums']["enrollment_source"],"status": Database["public"]['Enums']["enrollment_status"],"student_id": string
                  }
                  Insert: {
                    "claim_token"?: string | null,"class_id": string,"created_at"?: string,"id"?: string,"notes"?: string | null,"parent_email"?: string | null,"parent_name"?: string | null,"parent_phone"?: string | null,"source"?: Database["public"]['Enums']["enrollment_source"],"status"?: Database["public"]['Enums']["enrollment_status"],"student_id": string
                  }
                  Update: {
                    "claim_token"?: string | null,"class_id"?: string,"created_at"?: string,"id"?: string,"notes"?: string | null,"parent_email"?: string | null,"parent_name"?: string | null,"parent_phone"?: string | null,"source"?: Database["public"]['Enums']["enrollment_source"],"status"?: Database["public"]['Enums']["enrollment_status"],"student_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "enrollments_class_id_fkey"
      columns: ["class_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "enrollments_student_id_fkey"
      columns: ["student_id"]
isOneToOne: false
      referencedRelation: "students"
      referencedColumns: ["id"]
    }
                  ]
                },"order_items": {
                  Row: {
                    "created_at": string,"id": string,"order_id": string,"qty": number,"unit_price": number,"variant_id": string
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"order_id": string,"qty": number,"unit_price": number,"variant_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"order_id"?: string,"qty"?: number,"unit_price"?: number,"variant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"orders": {
                  Row: {
                    "address": string | null,"contact_name": string | null,"contact_phone": string | null,"created_at": string,"delivery_method": string,"discount": number,"id": string,"notes": string | null,"payment_proof_url": string | null,"points_used": number,"profile_id": string,"status": Database["public"]['Enums']["order_status"],"subtotal": number,"total": number
                  }
                  Insert: {
                    "address"?: string | null,"contact_name"?: string | null,"contact_phone"?: string | null,"created_at"?: string,"delivery_method"?: string,"discount"?: number,"id"?: string,"notes"?: string | null,"payment_proof_url"?: string | null,"points_used"?: number,"profile_id": string,"status"?: Database["public"]['Enums']["order_status"],"subtotal"?: number,"total": number
                  }
                  Update: {
                    "address"?: string | null,"contact_name"?: string | null,"contact_phone"?: string | null,"created_at"?: string,"delivery_method"?: string,"discount"?: number,"id"?: string,"notes"?: string | null,"payment_proof_url"?: string | null,"points_used"?: number,"profile_id"?: string,"status"?: Database["public"]['Enums']["order_status"],"subtotal"?: number,"total"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "orders_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"points_ledger": {
                  Row: {
                    "created_at": string,"created_by": string | null,"delta": number,"id": string,"profile_id": string,"reason": string,"ref_id": string | null,"ref_type": string | null
                  }
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"delta": number,"id"?: string,"profile_id": string,"reason": string,"ref_id"?: string | null,"ref_type"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"delta"?: number,"id"?: string,"profile_id"?: string,"reason"?: string,"ref_id"?: string | null,"ref_type"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "points_ledger_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "points_ledger_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"product_variants": {
                  Row: {
                    "color": string | null,"created_at": string,"id": string,"product_id": string,"size": string | null,"stock": number
                  }
                  Insert: {
                    "color"?: string | null,"created_at"?: string,"id"?: string,"product_id": string,"size"?: string | null,"stock"?: number
                  }
                  Update: {
                    "color"?: string | null,"created_at"?: string,"id"?: string,"product_id"?: string,"size"?: string | null,"stock"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_variants_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"products": {
                  Row: {
                    "category": Database["public"]['Enums']["product_category"],"created_at": string,"description": string | null,"id": string,"images": (string)[],"is_active": boolean,"name": string,"price": number
                  }
                  Insert: {
                    "category": Database["public"]['Enums']["product_category"],"created_at"?: string,"description"?: string | null,"id"?: string,"images"?: (string)[],"is_active"?: boolean,"name": string,"price": number
                  }
                  Update: {
                    "category"?: Database["public"]['Enums']["product_category"],"created_at"?: string,"description"?: string | null,"id"?: string,"images"?: (string)[],"is_active"?: boolean,"name"?: string,"price"?: number
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "can_manage_venues": boolean,"created_at": string,"full_name": string | null,"id": string,"phone": string | null,"role": Database["public"]['Enums']["user_role"]
                  }
                  Insert: {
                    "can_manage_venues"?: boolean,"created_at"?: string,"full_name"?: string | null,"id": string,"phone"?: string | null,"role"?: Database["public"]['Enums']["user_role"]
                  }
                  Update: {
                    "can_manage_venues"?: boolean,"created_at"?: string,"full_name"?: string | null,"id"?: string,"phone"?: string | null,"role"?: Database["public"]['Enums']["user_role"]
                  }
                  Relationships: [
                    
                  ]
                },"site_settings": {
                  Row: {
                    "created_at": string,"key": string,"updated_at": string,"value": NonNullable<Json>
                  }
                  Insert: {
                    "created_at"?: string,"key": string,"updated_at"?: string,"value": NonNullable<Json>
                  }
                  Update: {
                    "created_at"?: string,"key"?: string,"updated_at"?: string,"value"?: NonNullable<Json>
                  }
                  Relationships: [
                    
                  ]
                },"student_badges": {
                  Row: {
                    "awarded_by": string | null,"badge_key": string,"created_at": string,"id": string,"note": string | null,"student_id": string
                  }
                  Insert: {
                    "awarded_by"?: string | null,"badge_key": string,"created_at"?: string,"id"?: string,"note"?: string | null,"student_id": string
                  }
                  Update: {
                    "awarded_by"?: string | null,"badge_key"?: string,"created_at"?: string,"id"?: string,"note"?: string | null,"student_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "student_badges_awarded_by_fkey"
      columns: ["awarded_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "student_badges_student_id_fkey"
      columns: ["student_id"]
isOneToOne: false
      referencedRelation: "students"
      referencedColumns: ["id"]
    }
                  ]
                },"student_notes": {
                  Row: {
                    "body": string,"created_at": string,"created_by": string | null,"id": string,"kind": string,"student_id": string
                  }
                  Insert: {
                    "body": string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"kind"?: string,"student_id": string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"kind"?: string,"student_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "student_notes_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "student_notes_student_id_fkey"
      columns: ["student_id"]
isOneToOne: false
      referencedRelation: "students"
      referencedColumns: ["id"]
    }
                  ]
                },"students": {
                  Row: {
                    "birth_year": number,"created_at": string,"id": string,"level": Database["public"]['Enums']["skill_level"],"name": string,"notes": string | null,"parent_id": string | null,"years_playing": number
                  }
                  Insert: {
                    "birth_year": number,"created_at"?: string,"id"?: string,"level"?: Database["public"]['Enums']["skill_level"],"name": string,"notes"?: string | null,"parent_id"?: string | null,"years_playing"?: number
                  }
                  Update: {
                    "birth_year"?: number,"created_at"?: string,"id"?: string,"level"?: Database["public"]['Enums']["skill_level"],"name"?: string,"notes"?: string | null,"parent_id"?: string | null,"years_playing"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "students_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"venues": {
                  Row: {
                    "address": string,"created_at": string,"district": string,"id": string,"map_url": string | null,"name": string
                  }
                  Insert: {
                    "address": string,"created_at"?: string,"district": string,"id"?: string,"map_url"?: string | null,"name": string
                  }
                  Update: {
                    "address"?: string,"created_at"?: string,"district"?: string,"id"?: string,"map_url"?: string | null,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "member_points_balance": {
                  Row: {
                    "balance": number | null,"profile_id": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "points_ledger_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "demo_reset_now":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"email_for_phone":
{ Args: { "p_phone": string,"p_key": string }; Returns: string
                           },
"demo_spawn_member":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"calendar_feed":
{ Args: { "p_token": string }; Returns: {
              "cancelled": boolean,"description": string | null,"end_time": string,"location": string | null,"session_date": string,"start_time": string,"summary": string,"uid": string
            }[]
                           },
"accept_custom_quote":
{ Args: { "p_id": string }; Returns: undefined
                           },
"admin_list_members":
{ Args: Record<PropertyKey, never>; Returns: {
              "can_manage_venues": boolean,"created_at": string,"email": string,"full_name": string,"id": string,"phone": string,"points_balance": number,"role": Database["public"]['Enums']["user_role"],"students_count": number
            }[]
                           },
"can_manage_venues":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"claim_enrollments":
{ Args: { "p_tokens": (string)[] }; Returns: number
                           },
"class_availability":
{ Args: Record<PropertyKey, never>; Returns: {
              "capacity": number,"class_id": string,"remaining": number,"taken": number,"waitlist": number
            }[]
                           },
"current_user_role":
{ Args: Record<PropertyKey, never>; Returns: Database["public"]['Enums']["user_role"]
                           },
"enroll_guest":
{ Args: { "p_birth_year": number,"p_class_id": string,"p_notes"?: string,"p_parent_email": string,"p_parent_name": string,"p_parent_phone": string,"p_student_name": string,"p_years_playing"?: number }; Returns: {
              "claim_token": string,"enrollment_id": string,"status": Database["public"]['Enums']["enrollment_status"]
            }[]
                           },
"enroll_member":
{ Args: { "p_class_id": string,"p_notes"?: string,"p_student_id": string }; Returns: {
              "enrollment_id": string,"status": Database["public"]['Enums']["enrollment_status"]
            }[]
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_coach_of_class":
{ Args: { "p_class_id": string }; Returns: boolean
                           },
"is_coach_of_session":
{ Args: { "p_session_id": string }; Returns: boolean
                           },
"is_coach_of_student":
{ Args: { "p_student_id": string }; Returns: boolean
                           },
"normalize_hk_phone":
{ Args: { "p_phone": string }; Returns: string
                           },
"owns_student":
{ Args: { "p_student_id": string }; Returns: boolean
                           },
"place_order":
{ Args: { "p_address"?: string,"p_contact_name": string,"p_contact_phone": string,"p_delivery_method": string,"p_items": Json,"p_notes"?: string,"p_points": number }; Returns: string
                           },
"points_rule":
{ Args: { "p_default": number,"p_key": string }; Returns: number
                           },
"sync_class_sessions":
{ Args: { "p_class_id": string }; Returns: undefined
                           }
          }
          Enums: {
            "age_group": "kids"|"primary"|"secondary"|"adult","attendance_status": "present"|"absent"|"leave","custom_item_type": "jersey"|"warmup"|"other","custom_request_status": "submitted"|"quoted"|"accepted"|"in_production"|"completed"|"cancelled","enrollment_source": "guest"|"member"|"admin","enrollment_status": "pending"|"confirmed"|"waitlist"|"cancelled","order_status": "pending_payment"|"paid"|"shipped"|"cancelled","product_category": "jersey"|"shorts"|"ball"|"training","session_status": "scheduled"|"completed"|"cancelled","skill_level": "starter"|"foundation"|"intermediate"|"elite","user_role": "member"|"coach"|"admin"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "age_group": ["kids", "primary", "secondary", "adult"],"attendance_status": ["present", "absent", "leave"],"custom_item_type": ["jersey", "warmup", "other"],"custom_request_status": ["submitted", "quoted", "accepted", "in_production", "completed", "cancelled"],"enrollment_source": ["guest", "member", "admin"],"enrollment_status": ["pending", "confirmed", "waitlist", "cancelled"],"order_status": ["pending_payment", "paid", "shipped", "cancelled"],"product_category": ["jersey", "shorts", "ball", "training"],"session_status": ["scheduled", "completed", "cancelled"],"skill_level": ["starter", "foundation", "intermediate", "elite"],"user_role": ["member", "coach", "admin"]
          }
        }
} as const
