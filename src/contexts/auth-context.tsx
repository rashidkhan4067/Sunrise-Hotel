"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useAuth as useClerkAuth, useUser as useClerkUser, useClerk } from "@clerk/react"
import { apiClient } from "@/lib/api-client"

export type LoginResult = boolean | { status: "needs_second_factor"; strategy: "totp" | "phone_code" }

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: any
  role: string
  signIn: any
  signUp: any
  login: (email: string, password: string) => Promise<LoginResult>
  register: (values: { firstName: string; lastName: string; email: string; password: string }) => Promise<boolean>
  verifyOtp: (code: string) => Promise<void>
  verifyOtpLogin: (code: string) => Promise<void>
  verifySecondFactor: (code: string, strategy: "totp" | "phone_code") => Promise<void>
  loginWithGoogle: () => Promise<void>
  registerWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  getToken: () => Promise<string | null>
  updateProfile: (firstName: string, lastName: string, phone?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const resolveUserRole = (userObj: any): string => {
  if (!userObj) return "org:member"

  const emails = [
    userObj.primaryEmailAddress?.emailAddress,
    ...(userObj.emailAddresses?.map((e: any) => e.emailAddress) || [])
  ].filter(Boolean).map((e: string) => e.toLowerCase())

  // Dynamically load Admin emails from the Vite environment variable
  const adminEmailsEnv = import.meta.env.VITE_ADMIN_EMAILS || ""
  const adminEmails = [
    "admin@sunrise.com",
    ...adminEmailsEnv.split(",").map((e: string) => e.trim().toLowerCase())
  ].filter(Boolean)

  if (emails.some(e => adminEmails.includes(e))) {
    return "org:admin"
  }

  // Fallback: check publicMetadata for role field
  const metaRole = userObj.publicMetadata?.role
  if (metaRole === "org:admin" || metaRole === "admin" || metaRole === "ADMIN") {
    return "org:admin"
  }
  if (metaRole === "receptionist" || metaRole === "RECEPTIONIST") {
    return "receptionist"
  }

  return "org:member"
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const clerkAuth = useClerkAuth()
  const clerkUser = useClerkUser()
  const clerk = useClerk()

  const signInObj = clerk.client?.signIn
  const signUpObj = clerk.client?.signUp

  // Bridge state to cover the gap while Clerk is setting the active session
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  // Load cached session data instantly for fast hydrations
  const [cachedData, setCachedData] = useState<any>(() => {
    try {
      const cached = localStorage.getItem("clerk_cached_user")
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  // Clerk loading state indicator
  const isClerkLoaded = clerkAuth.isLoaded && clerk.client
  const isLoading = !isClerkLoaded
  const hasLocalActiveSession = isClerkLoaded ? (clerk.client?.sessions?.some((s: any) => s.status === "active") ?? false) : false
  const isAuthenticated = !!cachedData || (isClerkLoaded ? (!!clerkAuth.isSignedIn || isAuthenticating || hasLocalActiveSession) : false)
  
  const [currentUser, setCurrentUser] = useState<any>(() => {
    if (cachedData) {
      return {
        id: cachedData.id,
        fullName: cachedData.fullName,
        firstName: cachedData.firstName,
        lastName: cachedData.lastName,
        imageUrl: cachedData.imageUrl,
        primaryEmailAddress: { emailAddress: cachedData.email },
        emailAddresses: [{ emailAddress: cachedData.email }]
      }
    }
    return null
  })

  const [currentRole, setCurrentRole] = useState<string>(() => {
    return cachedData?.role || "org:member"
  })

  // Helper: Seed temporary user session cache to prevent guard redirect loops
  const seedTempUserCache = (emailAddress: string, firstName = "", lastName = "") => {
    let resolvedFirst = firstName
    let resolvedLast = lastName

    if (!resolvedFirst && emailAddress) {
      const prefix = emailAddress.split("@")[0]
      const parts = prefix.split(/[\._-]/)
      resolvedFirst = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ")
    }

    let resolvedRole = resolveUserRole({
      primaryEmailAddress: { emailAddress: emailAddress },
      emailAddresses: [{ emailAddress: emailAddress }]
    })

    if (resolvedRole === "org:member") {
      try {
        const cacheStr = localStorage.getItem("registered_users_cache")
        if (cacheStr) {
          const cache = JSON.parse(cacheStr)
          const matched = cache.find((u: any) => u.email?.toLowerCase() === emailAddress.toLowerCase())
          if (matched) {
            resolvedRole = matched.role === "Admin" ? "org:admin" : "receptionist"
          }
        }
      } catch (e) {
        console.warn("Failed to check registered users cache during seed:", e)
      }
    }

    const tempUser = {
      id: "temp",
      fullName: resolvedLast ? `${resolvedFirst} ${resolvedLast}` : resolvedFirst || "Staff Member",
      firstName: resolvedFirst || "Staff",
      lastName: resolvedLast,
      imageUrl: "",
      email: emailAddress,
      role: resolvedRole,
    }
    localStorage.setItem("clerk_cached_user", JSON.stringify(tempUser))
    setCachedData(tempUser)
    setCurrentUser({
      id: "temp",
      fullName: tempUser.fullName,
      firstName: tempUser.firstName,
      lastName: tempUser.lastName,
      imageUrl: "",
      primaryEmailAddress: { emailAddress: emailAddress },
      emailAddresses: [{ emailAddress: emailAddress }]
    })
    setCurrentRole(resolvedRole)
  }

  // Reset authenticating bridge state once Clerk confirms the session is active
  useEffect(() => {
    if (clerkAuth.isSignedIn) {
      setIsAuthenticating(false)
    }
  }, [clerkAuth.isSignedIn])

  // Auto-sync session locally if authenticated globally (prevents 400 Bad Request click errors)
  useEffect(() => {
    if (!isClerkLoaded) return
    if (!clerkAuth.isSignedIn) {
      const activeSession = clerk.client?.sessions?.[0]
      if (activeSession && activeSession.status === "active") {
        console.log("[AuthContext] Found global Clerk session. Activating locally...")
        clerk.setActive({ session: activeSession.id }).catch(err => {
          console.warn("Failed to auto-activate existing session:", err)
        })
      }
    }
  }, [isClerkLoaded, clerkAuth.isSignedIn, clerk])

  // Synchronize cache when Clerk loads or changes session
  useEffect(() => {
    if (!isClerkLoaded) return

    if (clerkAuth.isSignedIn) {
      // Only set cache when user details are fully loaded from Clerk API
      if (clerkUser.user) {
        const userObj = clerkUser.user
        const email = userObj.primaryEmailAddress?.emailAddress || userObj.emailAddresses?.[0]?.emailAddress || ""
        const activeRole = resolveUserRole(userObj)
        
        // Sync user details with Django backend
        const fullName = `${userObj.firstName || ""} ${userObj.lastName || ""}`.trim()
        const lastSyncedName = sessionStorage.getItem("clerk_last_synced_name")
        const lastSyncedEmail = sessionStorage.getItem("clerk_last_synced_email")
        if (fullName && (lastSyncedName !== fullName || lastSyncedEmail !== email)) {
          getToken().then(token => {
            if (token) {
              apiClient.patch("/auth/me/", {
                first_name: userObj.firstName || "",
                last_name: userObj.lastName || "",
                email: email
              }, token)
              .then(() => {
                sessionStorage.setItem("clerk_last_synced_name", fullName)
                sessionStorage.setItem("clerk_last_synced_email", email)
                console.log("[AuthContext] Synced profile with Django backend:", fullName, email)
              })
              .catch(err => console.warn("Failed to sync profile details with backend:", err))
            }
          })
        }
        
        // Always bind to live Clerk user details for valid image URL signatures
        setCurrentUser(userObj)
        setCurrentRole(activeRole)

        const freshData = {
          id: userObj.id,
          fullName: userObj.fullName,
          firstName: userObj.firstName,
          lastName: userObj.lastName,
          imageUrl: userObj.imageUrl,
          email: email,
          role: activeRole,
        }

        const freshString = JSON.stringify(freshData)
        const cachedString = localStorage.getItem("clerk_cached_user")

        if (cachedString !== freshString) {
          localStorage.setItem("clerk_cached_user", freshString)
          setCachedData(freshData)
        }

        // Store the real user details in the shared local database cache of registered users
        try {
          const stored = localStorage.getItem("registered_users_cache")
          const list = stored ? JSON.parse(stored) : []
          const existingIdx = list.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase())
          
          const userRecord = {
            name: userObj.fullName || `${userObj.firstName || ""} ${userObj.lastName || ""}`.trim() || email.split("@")[0],
            email: email,
            avatar: userObj.imageUrl || "",
            role: activeRole === "org:admin" ? "Admin" : "Client",
            status: "Active",
            joinedDate: new Date(userObj.createdAt || Date.now()).toISOString().split('T')[0],
            lastLogin: new Date(userObj.updatedAt || Date.now()).toISOString().split('T')[0],
          }

          if (existingIdx >= 0) {
            list[existingIdx] = userRecord
          } else {
            list.push(userRecord)
          }
          localStorage.setItem("registered_users_cache", JSON.stringify(list))
        } catch (e) {
          console.error("[AuthContext] Failed to update registered users cache:", e)
        }
      }
    }
  }, [isClerkLoaded, clerkAuth.isSignedIn, clerkUser.user, isAuthenticating])



  const login = async (email: string, password: string): Promise<LoginResult> => {
    if (!clerkAuth.isLoaded || !signInObj) {
      throw new Error("Clerk authentication is not loaded yet.")
    }

    let result;
    try {
      result = await signInObj.create({
        identifier: email,
        password: password,
      })
    } catch (err: any) {
      const clerkError = err.errors?.[0]
      const isAlreadySignedIn = clerkError?.code === "session_exists" || 
                                err.message?.toLowerCase().includes("already signed in") ||
                                clerkError?.message?.toLowerCase().includes("already signed in")
      
      if (isAlreadySignedIn) {
        const sid = clerkError?.meta?.sessionId || 
                    clerkError?.meta?.session_id || 
                    clerk.client?.sessions?.[0]?.id
        
        if (sid) {
          console.log("[AuthContext] Activating existing session:", sid)
          setIsAuthenticating(true)
          await clerk.setActive({ session: sid })
          
          seedTempUserCache(email)

          await new Promise(r => setTimeout(r, 500))
          return true
        } else {
          await clerkAuth.signOut({ redirectUrl: window.location.origin + "/#/auth/sign-in" })
          throw new Error("Already signed in, but could not find a session ID to activate. Please try logging in again.")
        }
      }
      throw err
    }

    if (result.status === "complete") {
      setIsAuthenticating(true)
      await clerk.setActive({ session: result.createdSessionId })

      seedTempUserCache(email)

      await new Promise(r => setTimeout(r, 500))
      return true
    } else if (result.status === "needs_second_factor") {
      const mfaFactor = result.supportedSecondFactors?.find(
        (factor: any) => factor.strategy === "totp" || factor.strategy === "phone_code"
      ) as any

      if (!mfaFactor) {
        throw new Error("MFA is required but no supported factors are set up.")
      }

      if (mfaFactor.strategy === "phone_code") {
        await signInObj.prepareSecondFactor({ strategy: "phone_code" })
      }

      return { status: "needs_second_factor", strategy: mfaFactor.strategy }
    } else if (result.status === "needs_client_trust" || result.status === "needs_first_factor") {
      const emailFactor = result.supportedFirstFactors?.find(
        (factor: any) => factor.strategy === "email_code"
      ) as any
      
      if (!emailFactor) {
        throw new Error("Email verification is required but not supported for this account.")
      }

      await signInObj.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailFactor.emailAddressId,
      })
      
      return false
    } else {
      throw new Error(`Authentication incomplete: status is ${result.status}`)
    }
  }

  const verifyOtpLogin = async (code: string) => {
    if (!clerkAuth.isLoaded || !signInObj) {
      throw new Error("Clerk authentication is not loaded yet.")
    }

    const completeSignIn = await signInObj.attemptFirstFactor({
      strategy: "email_code",
      code,
    })

    if (completeSignIn.status === "complete") {
      setIsAuthenticating(true)
      await clerk.setActive({ session: completeSignIn.createdSessionId })

      seedTempUserCache(signInObj.identifier || "")
    } else {
      throw new Error(`Verification incomplete: status is ${completeSignIn.status}`)
    }
  }

  const verifySecondFactor = async (code: string, strategy: "totp" | "phone_code") => {
    if (!clerkAuth.isLoaded || !signInObj) {
      throw new Error("Clerk authentication is not loaded yet.")
    }

    const completeSignIn = await signInObj.attemptSecondFactor({
      strategy,
      code,
    })

    if (completeSignIn.status === "complete") {
      setIsAuthenticating(true)
      await clerk.setActive({ session: completeSignIn.createdSessionId })

      seedTempUserCache(signInObj.identifier || "")
    } else {
      throw new Error(`MFA Verification incomplete: status is ${completeSignIn.status}`)
    }
  }

  const register = async (values: { firstName: string; lastName: string; email: string; password: string }): Promise<boolean> => {
    if (!clerkAuth.isLoaded || !signUpObj) {
      throw new Error("Clerk authentication is not loaded yet.")
    }

    // Auto-generate a clean, alphanumeric username based on the email prefix (e.g. rashid_4829)
    const usernamePrefix = values.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "")
    const paddedPrefix = usernamePrefix.length >= 4 ? usernamePrefix : (usernamePrefix + "user")
    const generatedUsername = `${paddedPrefix}_${Math.floor(1000 + Math.random() * 9000)}`.toLowerCase()

    if (signUpObj.status === "missing_requirements") {
      const updateParams: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
        username: generatedUsername,
      }

      const result = await signUpObj.update(updateParams)
      if (result.status === "complete") {
        setIsAuthenticating(true)
        await clerk.setActive({ session: result.createdSessionId })

        seedTempUserCache(values.email, values.firstName, values.lastName)

        return false
      } else {
        console.error("Clerk Update Result:", result)
        const missing = result.missingFields ? result.missingFields.join(", ") : "unknown"
        const unverified = result.unverifiedFields ? result.unverifiedFields.join(", ") : "unknown"
        throw new Error(`Could not complete registration. Status: ${result.status}. Missing: ${missing}. Unverified: ${unverified}.`)
      }
    } else {
      await signUpObj.create({
        firstName: values.firstName,
        lastName: values.lastName,
        emailAddress: values.email,
        password: values.password,
        username: generatedUsername,
      })

      await signUpObj.prepareEmailAddressVerification({
        strategy: "email_code",
      })
      return true
    }
  }

  const verifyOtp = async (code: string) => {
    if (!clerkAuth.isLoaded || !signUpObj) {
      throw new Error("Clerk authentication is not loaded yet.")
    }

    const completeSignUp = await signUpObj.attemptEmailAddressVerification({
      code,
    })

    if (completeSignUp.status === "complete") {
      setIsAuthenticating(true)
      await clerk.setActive({ session: completeSignUp.createdSessionId })

      seedTempUserCache(signUpObj.emailAddress || "")
    } else {
      throw new Error(`Verification incomplete: status is ${completeSignUp.status}`)
    }
  }

  const loginWithGoogle = async () => {
    if (!clerkAuth.isLoaded || !signInObj) {
      throw new Error("Clerk authentication is not loaded yet.")
    }

    try {
      await signInObj.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      })
    } catch (err: any) {
      const clerkError = err.errors?.[0]
      const errorStr = (JSON.stringify(err) || "").toLowerCase()
      const isAlreadySignedIn = 
        errorStr.includes("already signed in") ||
        errorStr.includes("session_exists") ||
        clerkError?.code === "session_exists"

      if (isAlreadySignedIn) {
        const sessionId = clerkError?.meta?.sessionId || clerk.client?.sessions?.[0]?.id
        if (sessionId) {
          await clerk.setActive({ session: sessionId })
          return
        }
      }
      throw err
    }
  }

  const registerWithGoogle = async () => {
    if (!clerkAuth.isLoaded || !signUpObj) {
      throw new Error("Clerk authentication is not loaded yet.")
    }

    try {
      await signUpObj.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      })
    } catch (err: any) {
      const clerkError = err.errors?.[0]
      const errorStr = (JSON.stringify(err) || "").toLowerCase()
      const isAlreadySignedIn = 
        errorStr.includes("already signed in") ||
        errorStr.includes("session_exists") ||
        clerkError?.code === "session_exists"

      if (isAlreadySignedIn) {
        const sessionId = clerkError?.meta?.sessionId || clerk.client?.sessions?.[0]?.id
        if (sessionId) {
          await clerk.setActive({ session: sessionId })
          return
        }
      }
      throw err
    }
  }

  const logout = async () => {
    try {
      localStorage.removeItem("clerk_cached_user")
      setCachedData(null)
      await clerkAuth.signOut({ redirectUrl: window.location.origin + "/#/auth/sign-in" })
    } catch (e) {
      console.error("Failed to clear auth session:", e)
    }
  }

  const getToken = async () => {
    try {
      return await clerkAuth.getToken()
    } catch (e) {
      console.error("Failed to resolve Clerk token:", e)
      return null
    }
  }

  // Automatically sync Clerk profile to Django database on login/signup
  useEffect(() => {
    async function syncUserProfile() {
      if (clerkAuth.isSignedIn && clerkUser.user) {
        try {
          const token = await getToken()
          if (token) {
            const userObj = clerkUser.user
            const email = userObj.primaryEmailAddress?.emailAddress || userObj.emailAddresses?.[0]?.emailAddress || ""
            
            // First, trigger get_or_create_user by fetching /me/
            const getRes = await fetch("http://localhost:8000/api/auth/me/", {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            
            if (getRes.ok) {
              const userData = await getRes.json()
              // If the email is a placeholder or different, update it with real Clerk details
              if (!userData.email || userData.email.includes("@placeholder.sunrise.com") || userData.email !== email || !userData.first_name) {
                await fetch("http://localhost:8000/api/auth/me/", {
                  method: "PATCH",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    email: email,
                    first_name: userObj.firstName || "",
                    last_name: userObj.lastName || ""
                  })
                })
                console.log("[AuthContext] Successfully updated database user profile with real Clerk details.")
              } else {
                console.log("[AuthContext] Clerk profile is already in sync with Django backend database.")
              }
            }
          }
        } catch (err) {
          console.warn("[AuthContext] Failed to sync Clerk profile with Django backend:", err)
        }
      }
    }
    syncUserProfile()
  }, [clerkAuth.isSignedIn, clerkUser.user, getToken])

  const updateProfile = async (firstName: string, lastName: string, phone?: string) => {
    if (!clerkUser.user) {
      throw new Error("User profile is not loaded or authenticated.")
    }
    await clerkUser.user.update({
      firstName,
      lastName,
    })

    if (phone) {
      try {
        const currentPhone = clerkUser.user.primaryPhoneNumber?.phoneNumber
        if (currentPhone !== phone) {
          // Remove old phone numbers
          for (const p of clerkUser.user.phoneNumbers) {
            await p.destroy().catch(() => {})
          }
          // Create the new phone number (Clerk sets the first/only phone number as primary automatically)
          await clerkUser.user.createPhoneNumber({ phoneNumber: phone })
        }
      } catch (err: any) {
        console.warn("Failed to update phone number via Clerk:", err)
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user: currentUser,
        role: currentRole,
        signIn: signInObj,
        signUp: signUpObj,
        login,
        register,
        verifyOtp,
        verifyOtpLogin,
        verifySecondFactor,
        loginWithGoogle,
        registerWithGoogle,
        logout,
        getToken,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
