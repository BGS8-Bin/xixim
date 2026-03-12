'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SendCampaignDialog } from '@/components/campaigns/send-campaign-dialog'

interface SendCampaignButtonProps {
    announcementId: string
    announcementTitle: string
}

export function SendCampaignButton({ announcementId, announcementTitle }: SendCampaignButtonProps) {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    return (
        <>
            <Button onClick={() => setOpen(true)} size="lg">
                <Send className="mr-2 h-4 w-4" />
                Enviar a Empresas
            </Button>

            <SendCampaignDialog
                announcementId={announcementId}
                announcementTitle={announcementTitle}
                open={open}
                onOpenChange={setOpen}
                onSuccess={() => {
                    router.push('/dashboard/comunicacion')
                }}
            />
        </>
    )
}
