// components/ui/toaster.tsx
"use client"

// Uvozimo potrebne komponente iz './toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider, // <- Provider je potreban ovde
  ToastTitle,
  ToastViewport, // <- Viewport je potreban ovde
} from "./toast"
// Uvozimo useToast hook iz './use-toast'
import { useToast } from "./use-toast"

// Definišemo i izvozimo glavnu Toaster komponentu
// Ona renderuje ToastProvider i ToastViewport, a zatim mapira preko aktivnih toastova
export function Toaster() {
  const { toasts } = useToast() // Dobijamo listu aktivnih toastova od huka

  return (
    // Obezbeđujemo Radix Toast Provider context za useToast hook
    (<ToastProvider> 
      {/* Mapiramo preko liste toastova i renderujemo ih */}
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          (<Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>)
        );
      })}
      {/* Renderujemo Viewport - ovo je kontejner gde će se toastovi pojavljivati */}
      <ToastViewport />
    </ToastProvider>)
  );
}

// Izvozimo Toaster komponentu
// export { Toaster } // Može i ovako, ali export function Toaster() je češće