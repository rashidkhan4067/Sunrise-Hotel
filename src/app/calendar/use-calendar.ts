"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { type CalendarEvent } from "./types"
import { useAppStore } from "@/store/use-app-store"
import { toast } from "sonner"

export interface UseCalendarState {
  selectedDate: Date
  showEventForm: boolean
  editingEvent: CalendarEvent | null
  showCalendarSheet: boolean
  events: CalendarEvent[]
}

export interface UseCalendarActions {
  setSelectedDate: (date: Date) => void
  setShowEventForm: (show: boolean) => void
  setEditingEvent: (event: CalendarEvent | null) => void
  setShowCalendarSheet: (show: boolean) => void
  handleDateSelect: (date: Date) => void
  handleNewEvent: () => void
  handleNewCalendar: () => void
  handleSaveEvent: (eventData: Partial<CalendarEvent>) => void
  handleDeleteEvent: (eventId: number) => void
  handleEditEvent: (event: CalendarEvent) => void
}

export interface UseCalendarReturn extends UseCalendarState, UseCalendarActions {}

export function useCalendar(initialEvents: CalendarEvent[] = []): UseCalendarReturn {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [showCalendarSheet, setShowCalendarSheet] = useState(false)

  const storeEvents = useAppStore((state) => state.calendarEvents)
  const initializeCalendarEvents = useAppStore((state) => state.initializeCalendarEvents)
  const addCalendarEvent = useAppStore((state) => state.addCalendarEvent)
  const updateCalendarEvent = useAppStore((state) => state.updateCalendarEvent)
  const deleteCalendarEvent = useAppStore((state) => state.deleteCalendarEvent)

  useEffect(() => {
    if (storeEvents.length === 0 && initialEvents.length > 0) {
      initializeCalendarEvents(initialEvents)
    }
  }, [storeEvents.length, initialEvents, initializeCalendarEvents])

  const events = useMemo(() => {
    return storeEvents.map((event) => ({
      ...event,
      date: new Date(event.date),
    }))
  }, [storeEvents])

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
    setShowCalendarSheet(false)
  }, [])

  const handleNewEvent = useCallback(() => {
    setEditingEvent(null)
    setShowEventForm(true)
  }, [])

  const handleNewCalendar = useCallback(() => {
    console.log("Creating new calendar")
  }, [])

  const handleSaveEvent = useCallback((eventData: Partial<CalendarEvent>) => {
    if (editingEvent) {
      const updated: CalendarEvent = {
        ...editingEvent,
        ...eventData,
        id: editingEvent.id,
      } as CalendarEvent
      updateCalendarEvent(updated)
      toast.success("Event updated successfully", {
        description: `"${updated.title}" has been saved.`,
      })
    } else {
      const newEvent: CalendarEvent = {
        id: Math.floor(Math.random() * 100000),
        title: eventData.title || "New Event",
        date: eventData.date || selectedDate,
        time: eventData.time || "9:00 AM",
        duration: eventData.duration || "1 hour",
        type: eventData.type || "event",
        attendees: eventData.attendees || [],
        location: eventData.location || "",
        color: eventData.color || "bg-blue-500",
        description: eventData.description || "",
      }
      addCalendarEvent(newEvent)
      toast.success("Event created successfully", {
        description: `"${newEvent.title}" has been added to your schedule.`,
      })
    }
    setShowEventForm(false)
    setEditingEvent(null)
  }, [editingEvent, selectedDate, addCalendarEvent, updateCalendarEvent])

  const handleDeleteEvent = useCallback((eventId: number) => {
    deleteCalendarEvent(eventId)
    toast.success("Event deleted successfully")
    setShowEventForm(false)
    setEditingEvent(null)
  }, [deleteCalendarEvent])

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setEditingEvent(event)
    setShowEventForm(true)
  }, [])

  return {
    selectedDate,
    showEventForm,
    editingEvent,
    showCalendarSheet,
    events,
    setSelectedDate,
    setShowEventForm,
    setEditingEvent,
    setShowCalendarSheet,
    handleDateSelect,
    handleNewEvent,
    handleNewCalendar,
    handleSaveEvent,
    handleDeleteEvent,
    handleEditEvent,
  }
}
