import { useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { SOCKET_URL } from "@/constants/api"
import { TokenService } from "@/services/storage"

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const connect = async () => {
      const token = await TokenService.getAccessToken()
      
      socketRef.current = io(SOCKET_URL, {
        auth: { token }
      })

      socketRef.current.on("connect", () => {
        console.log("[SOCKET] Connecté")
      })

      socketRef.current.on("disconnect", () => {
        console.log("[SOCKET] Déconnecté")
      })
    }

    connect()

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  return socketRef.current
}