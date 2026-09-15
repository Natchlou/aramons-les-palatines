"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { useRouter } from "next/navigation";

export default function QRScanner() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const router = useRouter();
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!videoRef.current) return;

        const reader = new BrowserQRCodeReader();

        let controls: { stop: () => void } | undefined;
        let mounted = true;

        const startScanner = async () => {
            try {
                setError(null);

                const devices =
                    await BrowserQRCodeReader.listVideoInputDevices();

                if (devices.length === 0) {
                    throw new Error("Aucune caméra détectée.");
                }

                // On privilégie la caméra arrière sur téléphone
                const backCamera =
                    devices.find((device) =>
                        device.label.toLowerCase().includes("back"),
                    ) ??
                    devices.find((device) =>
                        device.label.toLowerCase().includes("rear"),
                    ) ??
                    devices[devices.length - 1];

                controls = await reader.decodeFromVideoDevice(
                    backCamera.deviceId,
                    videoRef.current!,
                    (result) => {
                        if (!mounted || !result) return;

                        const value = result.getText();
                        if (value.startsWith("resident:")) {
                            const residentId = value.replace("resident:", "");

                            controls?.stop();

                            router.push(`/cleaning/${residentId}`);
                        }
                        setResult(value);

                        // Stoppe le scanner après détection
                        controls?.stop();
                    },
                );
            } catch (error) {
                console.error("Erreur scanner QR :", error);

                if (mounted) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "Impossible d'utiliser la caméra.",
                    );
                }
            }
        };

        startScanner();

        return () => {
            mounted = false;
            controls?.stop();
        };
    }, []);

    return (
        <div className="mx-auto w-full max-w-md space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-black">
                <video
                    ref={videoRef}
                    className="aspect-square w-full object-cover"
                    autoPlay
                    muted
                    playsInline
                />

                {/* Cadre de scan */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-56 w-56 rounded-2xl border-4 border-white/80" />
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
                    {error}
                </div>
            )}

            {result && (
                <div className="rounded-xl border p-4">
                    <p className="text-sm font-medium">
                        QR code détecté
                    </p>

                    <code className="mt-2 block break-all text-sm">
                        {result}
                    </code>
                </div>
            )}
        </div>
    );
}