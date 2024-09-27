// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '@/firebase/firebaseConfig'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'

// Create Context
const AuthContext = createContext()

// Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password)
    }

    const logout = () => {
        return signOut(auth)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom Hook
export const useAuth = () => {
    return useContext(AuthContext)
}
