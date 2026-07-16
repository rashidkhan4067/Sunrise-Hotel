"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useAuth as useClerkAuth, useUser as useClerkUser, useClerk, useOrganization } from "@clerk/react"

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
  updateProfile: (firstName: string, lastName: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ""

  useEffect(() => {
    console.log("[AuthDiagnostic]", {
      hasPublishableKey: !!CLERK_PUBLISHABLE_KEY,
      publishableKeyLength: CLERK_PUBLISHABLE_KEY.length,
      currentUrl: window.location.href,
      searchParams: window.location.search
    })
  }, [CLERK_PUBLISHABLE_KEY])

  const clerkAuth = useClerkAuth()
  const clerkUser = useClerkUser()
  const clerk = useClerk()
  const { membership } = useOrganization()

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

  const isClerkLoaded = clerkAuth.isLoaded && clerk.client
  const hasClerkParams = typeof window !== "undefined" && window.location.search.includes("__clerk_")

  // Fast loading: if we have cached details, don't show the blocking loading page spinner
  const isLoading = isClerkLoaded ? false : (cachedData ? false : true) || hasClerkParams
  const isAuthenticated = isClerkLoaded 
    ? (!!clerkAuth.isSignedIn || isAuthenticating) 
    : !!cachedData
  
  // Resolve user profile (cached vs Clerk)
  const user = isClerkLoaded
    ? clerkUser.user
    : (cachedData ? {
        id: cachedData.id,
        fullName: cachedData.fullName,
        firstName: cachedData.firstName,
        lastName: cachedData.lastName,
        imageUrl: cachedData.imageUrl,
        primaryEmailAddress: { emailAddress: cachedData.email },
        emailAddresses: [{ emailAddress: cachedData.email }]
      } : null)

  // Resolve role (cached vs Clerk)
  const role = isClerkLoaded
    ? (membership?.role || "org:member")
    : (cachedData?.role || "org:member")

  // Helper: Seed temporary user session cache to prevent guard redirect loops
  const seedTempUserCache = (emailAddress: string, firstName = "Loading", lastName = "") => {
    const tempUser = {
      id: "temp",
      fullName: lastName ? `${firstName} ${lastName}` : firstName,
      firstName,
      lastName,
      imageUrl: "",
      email: emailAddress,
      role: "org:member",
    }
    localStorage.setItem("clerk_cached_user", JSON.stringify(tempUser))
    setCachedData(tempUser)
  }

  // Reset authenticating bridge state once Clerk confirms the session is active
  useEffect(() => {
    if (clerkAuth.isSignedIn) {
      setIsAuthenticating(false)
    }
  }, [clerkAuth.isSignedIn])

  // Synchronize cache when Clerk loads or changes session
  useEffect(() => {
    if (!isClerkLoaded) return

    if (clerkAuth.isSignedIn) {
      // Only set cache when user details are fully loaded from Clerk API
      if (clerkUser.user) {
        const activeRole = membership?.role || "org:member"
        const userObj = clerkUser.user
        const freshData = {
          id: userObj.id,
          fullName: userObj.fullName,
          firstName: userObj.firstName,
          lastName: userObj.lastName,
          imageUrl: userObj.imageUrl,
          email: userObj.primaryEmailAddress?.emailAddress || userObj.emailAddresses?.[0]?.emailAddress || "",
          role: activeRole,
        }
        localStorage.setItem("clerk_cached_user", JSON.stringify(freshData))
        setCachedData(freshData)
      }
    } else if (!isAuthenticating) {
      // Only remove cache if Clerk explicitly reports signed out and we are not currently authenticating
      localStorage.removeItem("clerk_cached_user")
      setCachedData(null)
    }
  }, [isClerkLoaded, clerkAuth.isSignedIn, clerkUser.user, membership?.role, isAuthenticating])

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
          await clerkAuth.signOut()
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

    if (signUpObj.status === "missing_requirements") {
      const result = await signUpObj.update({
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
      })
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
        redirectUrlComplete: "/dashboard",
      })
    } catch (err: any) {
      const clerkError = err.errors?.[0]
      if (clerkError?.code === "session_exists" && clerkError.meta?.sessionId) {
        await clerk.setActive({ session: clerkError.meta.sessionId })
        return
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
        redirectUrlComplete: "/dashboard",
      })
    } catch (err: any) {
      const clerkError = err.errors?.[0]
      if (clerkError?.code === "session_exists" && clerkError.meta?.sessionId) {
        await clerk.setActive({ session: clerkError.meta.sessionId })
        return
      }
      throw err
    }
  }

  const logout = async () => {
    try {
      localStorage.removeItem("clerk_cached_user")
      setCachedData(null)
      await clerkAuth.signOut()
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

  const updateProfile = async (firstName: string, lastName: string) => {
    if (!clerkUser.user) {
      throw new Error("User profile is not loaded or authenticated.")
    }
    await clerkUser.user.update({
      firstName,
      lastName,
    })
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        role,
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
