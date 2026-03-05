'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { shouldEnableOneSignal } from '@/lib/platform'

const ONESIGNAL_APP_ID = '4d61e383-61ef-42ca-a6c5-1ece240d2ebf'

export default function OneSignalLoader() {
    const [enabled, setEnabled] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return
        setEnabled(shouldEnableOneSignal(window.location.hostname))
    }, [])

    if (!enabled) return null

    return (
        <>
            <Script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" strategy="afterInteractive" />
            <Script id="onesignal-init" strategy="afterInteractive">
                {`
                    window.OneSignalDeferred = window.OneSignalDeferred || [];
                    window.OneSignalDeferred.push(async function(OneSignal) {
                      await OneSignal.init({
                        appId: "${ONESIGNAL_APP_ID}",
                      });
                    });
                `}
            </Script>
        </>
    )
}
