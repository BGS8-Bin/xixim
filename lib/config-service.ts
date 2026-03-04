import { createClient } from '@/lib/supabase/client'
import type { ClusterConfig } from '@/hooks/useClusterConfig'

/**
 * Service for managing cluster configuration
 */
export class ConfigService {
    private supabase = createClient()

    /**
     * Update cluster configuration
     */
    async updateClusterConfig(updates: Partial<ClusterConfig>): Promise<{
        data: ClusterConfig | null
        error: string | null
    }> {
        try {
            // Get the first (and only) config record
            const { data: existing } = await this.supabase
                .from('cluster_config')
                .select('id')
                .limit(1)
                .single()

            if (!existing) {
                return { data: null, error: 'Configuration not found' }
            }

            const { data, error } = await this.supabase
                .from('cluster_config')
                .update(updates)
                .eq('id', existing.id)
                .select()
                .single()

            if (error) throw error

            return { data, error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Error updating configuration'
            }
        }
    }

    /**
     * Upload logo to Supabase Storage
     */
    async uploadLogo(
        file: File,
        type: 'logo' | 'icon' | 'favicon'
    ): Promise<{
        url: string | null
        error: string | null
    }> {
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${type}-${Date.now()}.${fileExt}`

            const { data, error } = await this.supabase.storage
                .from('assets')
                .upload(`logos/${fileName}`, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (error) throw error

            // Get public URL
            const { data: urlData } = this.supabase.storage
                .from('assets')
                .getPublicUrl(data.path)

            return { url: urlData.publicUrl, error: null }
        } catch (err) {
            return {
                url: null,
                error: err instanceof Error ? err.message : 'Error uploading file'
            }
        }
    }

    /**
     * Update system setting
     */
    async updateSystemSetting(
        key: string,
        value: any,
        category: string = 'general'
    ): Promise<{ success: boolean; error: string | null }> {
        try {
            const { error } = await this.supabase
                .from('system_settings')
                .upsert(
                    {
                        key,
                        value,
                        category
                    },
                    {
                        onConflict: 'key'
                    }
                )

            if (error) throw error

            return { success: true, error: null }
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Error updating setting'
            }
        }
    }

    /**
     * Get email template by type
     */
    async getEmailTemplate(templateType: string) {
        try {
            const { data, error } = await this.supabase
                .from('email_templates')
                .select('*')
                .eq('template_type', templateType)
                .eq('is_active', true)
                .limit(1)
                .single()

            if (error) throw error

            return { data, error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Error fetching template'
            }
        }
    }

    /**
     * Update email template
     */
    async updateEmailTemplate(
        id: string,
        updates: {
            name?: string
            subject?: string
            body?: string
            is_active?: boolean
        }
    ) {
        try {
            const { data, error } = await this.supabase
                .from('email_templates')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            return { data, error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Error updating template'
            }
        }
    }
}

// Export singleton instance
export const configService = new ConfigService()
