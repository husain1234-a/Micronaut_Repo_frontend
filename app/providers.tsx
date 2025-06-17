"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode, useEffect } from "react"

// Types
interface User {
  id: string
  email: string
  role: string
}

interface Address {
  id: string
  userId: string
  type: "home" | "work" | "other"
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: string
}

interface AppState {
  user: User | null
  users: User[]
  addresses: Address[]
  notifications: Notification[]
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

type AppAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_USERS"; payload: User[] }
  | { type: "SET_ADDRESSES"; payload: Address[] }
  | { type: "SET_NOTIFICATIONS"; payload: Notification[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "DELETE_USER"; payload: string }
  | { type: "ADD_ADDRESS"; payload: Address }
  | { type: "UPDATE_ADDRESS"; payload: Address }
  | { type: "DELETE_ADDRESS"; payload: string }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }

// Initialize state from localStorage if available
const getInitialState = (): AppState => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      users: [],
      addresses: [],
      notifications: [],
      isAuthenticated: false,
      loading: false,
      error: null,
    }
  }

  const storedUser = localStorage.getItem('user')
  const user = storedUser ? JSON.parse(storedUser) : null

  return {
    user,
    users: [],
    addresses: [],
    notifications: [],
    isAuthenticated: !!user,
    loading: false,
    error: null,
  }
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      }
    case "SET_USERS":
      return { ...state, users: action.payload }
    case "SET_ADDRESSES":
      return { ...state, addresses: action.payload }
    case "SET_NOTIFICATIONS":
      return { ...state, notifications: action.payload }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "ADD_USER":
      return { ...state, users: [...state.users, action.payload] }
    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((user) => (user.id === action.payload.id ? action.payload : user)),
      }
    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload),
      }
    case "ADD_ADDRESS":
      return { ...state, addresses: [...state.addresses, action.payload] }
    case "UPDATE_ADDRESS":
      return {
        ...state,
        addresses: state.addresses.map((address) => (address.id === action.payload.id ? action.payload : address)),
      }
    case "DELETE_ADDRESS":
      return {
        ...state,
        addresses: state.addresses.filter((address) => address.id !== action.payload),
      }
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload ? { ...notification, read: true } : notification,
        ),
      }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function Providers({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, getInitialState())

  // Sync state with localStorage
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('user', JSON.stringify(state.user))
    } else {
      localStorage.removeItem('user')
    }
  }, [state.user])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within Providers")
  }
  return context
}
