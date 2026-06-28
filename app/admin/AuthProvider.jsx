'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../../lib/firebaseClient'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) { setLoading(false); return }
    return onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false) })
  }, [])

  const login = useCallback((email, password) => {
    if (!auth) return Promise.reject(new Error('Firebase not initialized'))
    return signInWithEmailAndPassword(auth, email, password)
  }, [])
  const logout = useCallback(() => auth ? signOut(auth) : Promise.resolve(), [])
  const getToken = useCallback(async () => (auth?.currentUser ? auth.currentUser.getIdToken() : null), [])

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, getToken }}>
      {children}
    </AuthCtx.Provider>
  )
}
