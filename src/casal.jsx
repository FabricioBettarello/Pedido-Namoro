import { createContext, useContext } from 'react'

const CasalContext = createContext(null)

export const CasalProvider = CasalContext.Provider

// textos, fotos e música do casal da rota atual
export function useCasal() {
  return useContext(CasalContext)
}
