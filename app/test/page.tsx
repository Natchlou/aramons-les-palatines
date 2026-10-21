'use client'

import * as React from 'react'

import { TestZone } from '@/components/test-zone'
import SignatureInput from '@/components/ui/signature-input'

export default function TestPage() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const [value, setValue] = React.useState<string | null>(null)

  return (
    <TestZone>
      <div className="flex flex-col gap-4">
        <SignatureInput
          canvasRef={canvasRef}
          onSignatureChange={setValue}
        />

        {value && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Aperçu de la signature</p>

            <img
              src={value}
              alt="Signature dessinée"
              className="max-w-100 rounded-md border border-border"
            />
          </div>
        )}
      </div>
    </TestZone>
  )
}