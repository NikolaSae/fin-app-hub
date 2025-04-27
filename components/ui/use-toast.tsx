// components/ui/use-toast.tsx
"use client"

import * as React from "react"

// Uvozimo samo TIPove i Provider komponentu iz definicija komponenata u './toast'
import type {
  ToastActionElement,
  ToastProps,
} from "./toast"
import { ToastProvider as RadixToastProvider } from "./toast" // Preimenujemo Radix provider

// Smanjio sam remove delay na razumniju vrednost (npr. 5000ms = 5 sekundi)
// Ako želite da toastovi stoje jako dugo, vratite na 1000000, ali je to neobično.
const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 5000 // 5 sekundi

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

// -------- Logika za upravljanje stanjem (Reducer pattern) --------
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const removeToast = (toastId: string) => {
  const timeout = toastTimeouts.get(toastId)

  if (timeout) {
    clearTimeout(timeout)
  }

  dispatch({
    type: "REMOVE_TOAST",
    toastId: toastId,
  })
}


const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    // Dispatch remove action after delay
    dispatch({ type: "REMOVE_TOAST", toastId: toastId })
  }, TOAST_REMOVE_DELAY) // Koristimo definisani delay

  toastTimeouts.set(toastId, timeout)
}

// Reducer funkcija - čista funkcija koja menja state
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Side effect: dodajemo toast u red za uklanjanje
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        // Ako nema specificiranog toastId-a, dodajemo sve trenutne toastove
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false, // Mark as closed
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      // Uklanjamo toast iz liste
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [], // Ukloni sve ako nije specificiran ID
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// -------- Globalno stanje i Dispatch --------
const listeners: Array<(state: State) => void> = [] // Slušaoci koji se obaveštavaju o promeni state-a

let memoryState: State = { toasts: [] } // Globalni state van React render ciklusa

// Dispatch funkcija - jedini način da se promeni state
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action) // Ažuriranje state-a preko reducera
  listeners.forEach((listener) => { // Obaveštavanje svih slušalaca (hookova)
    listener(memoryState)
  })
}

// --------------- Toast funkcija (za pozivanje toastova) ---------------
type Toast = Omit<ToasterToast, "id"> // Tip za parametre toast funkcije (bez ID-a)

function toast({ ...props }: Toast) {
  const id = genId() // Generisanje jedinstvenog ID-a

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id }) // Funkcija za zatvaranje specifičnog toasta

  // Dodavanje novog toasta u state
   dispatch({
     type: "ADD_TOAST",
     toast: {
       ...props,
       id,
       open: true, // Toast je otvoren
       onOpenChange: (open) => { // Callback kada se toast zatvori
         if (!open) dismiss();
       },
     },
   });

  return {
    id: id,
    dismiss, // Vraćamo funkciju za zatvaranje
    update, // Vraćamo funkciju za ažuriranje
  }
}

// --------------- Context i Provider (za hook) ---------------
// Kontext je potreban da bi useToast mogao da pristupi dispatch funkciji i state-u
const ToastContext = React.createContext<{
    toast: typeof toast; // Funkcija za kreiranje/ažuriranje toastova
    dismiss: (toastId?: string) => void; // Funkcija za zatvaranje/uklanjanje toastova
    toasts: ToasterToast[]; // Lista aktivnih toastova
} | undefined>(undefined);

// Provider komponenta koja obezbeđuje Context. RENDERUJE SE U LAYOUT-u.
const ToasterProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = React.useState<State>(memoryState);

    // Efekat za prijavljivanje/odjavljivanje listenera na globalni state
    React.useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, []); // Prazan dependency array - pokreće se samo pri mountovanju

    // Efekat za uklanjanje toastova iz state-a nakon što se animacija zatvaranja završi
    React.useEffect(() => {
      state.toasts.filter(toast => !toast.open).forEach(toast => {
        // Pozivamo removeToast nakon kratkog delay-a da se završi animacija zatvaranja
        setTimeout(() => removeToast(toast.id), 1000); // 1 sekunda - prilagodite po potrebi CSS tranziciji
      });
    }, [state.toasts]); // Pokreće se kada se lista toastova promeni (open svojstvo se menja)


    // Vrednost koju obezbeđujemo Contextu
    const contextValue = React.useMemo(() => ({
      toasts: state.toasts,
      toast: toast, // Globalna toast funkcija
      dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }), // Globalna dispatch funkcija za dismiss
    }), [state.toasts]); // Ažuriramo context value ako se lista toastova promeni


    // Obezbeđujemo Context svim podređenim komponentama
    return (
        <ToastContext.Provider value={contextValue}>
            {children}
        </ToastContext.Provider>
    );
};

// --------------- Hook (za pristup state-u i funkcijama u komponentama) ---------------
function useToast() {
    // Konzumiramo context
    const context = React.useContext(ToastContext);

    if (context === undefined) {
        // Greška ako hook nije pozvan unutar Providera
        // Poruka je tačna kao u vašoj grešci
        throw new Error("useToast must be used within a ToasterProvider"); 
    }

    // Vraćamo vrednost iz contexta
    return context; 
}


// Izvozimo hook, toast funkciju i Provider komponentu
export { useToast, toast, ToasterProvider };