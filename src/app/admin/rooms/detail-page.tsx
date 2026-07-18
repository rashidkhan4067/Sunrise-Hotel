"use client"

import { useParams } from "react-router-dom"
import { RoomDetailPage } from "@/features/rooms/pages/room-detail-page"

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>()
  return <RoomDetailPage roomId={id!} />
}
