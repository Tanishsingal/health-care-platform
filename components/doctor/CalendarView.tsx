"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Clock, Users } from "lucide-react"

interface Appointment {
  id: string
  patient_first_name: string
  patient_last_name: string
  appointment_date: string
  duration_minutes: number
  status: string
  reason?: string
  medical_record_number: string
  patient_id: string
}

interface Props {
  appointments: Appointment[]
  onAppointmentClick: (appointment: Appointment) => void
}

export function CalendarView({ appointments, onAppointmentClick }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, firstDay, lastDay }
  }

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date)
      return (
        aptDate.getFullYear() === date.getFullYear() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getDate() === date.getDate()
      )
    }).sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
  }

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Render Month View
  const renderMonthView = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)
    const monthDays = []

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      monthDays.push(<div key={`empty-${i}`} className="min-h-[120px] bg-muted/20" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayAppointments = getAppointmentsForDate(date)
      const isToday = 
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear()

      monthDays.push(
        <div
          key={day}
          className={`min-h-[120px] border p-2 hover:bg-accent/50 transition-colors ${
            isToday ? 'bg-primary/5 border-primary' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
              {day}
            </span>
            {dayAppointments.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {dayAppointments.length}
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {dayAppointments.slice(0, 2).map(apt => (
              <div
                key={apt.id}
                onClick={() => onAppointmentClick(apt)}
                className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                  apt.status === 'completed' 
                    ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                    : apt.status === 'confirmed'
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                }`}
              >
                <div className="font-medium truncate">
                  {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="truncate">
                  {apt.patient_first_name} {apt.patient_last_name}
                </div>
              </div>
            ))}
            {dayAppointments.length > 2 && (
              <div className="text-xs text-muted-foreground text-center">
                +{dayAppointments.length - 2} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return monthDays
  }

  // Render Week View
  const renderWeekView = () => {
    const weekStart = new Date(currentDate)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start from Sunday

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      const dayAppointments = getAppointmentsForDate(date)
      const isToday = 
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear()

      weekDays.push(
        <div key={i} className="flex-1 border-r last:border-r-0">
          <div className={`p-3 border-b text-center ${isToday ? 'bg-primary/10' : ''}`}>
            <div className="text-xs text-muted-foreground">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-lg font-semibold ${isToday ? 'text-primary' : ''}`}>
              {date.getDate()}
            </div>
          </div>
          <div className="p-2 space-y-2 min-h-[500px]">
            {dayAppointments.map(apt => (
              <div
                key={apt.id}
                onClick={() => onAppointmentClick(apt)}
                className={`p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                  apt.status === 'completed' 
                    ? 'bg-green-100 dark:bg-green-950 border border-green-300 dark:border-green-800'
                    : apt.status === 'confirmed'
                    ? 'bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-800'
                    : 'bg-yellow-100 dark:bg-yellow-950 border border-yellow-300 dark:border-yellow-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-sm font-medium mb-1">
                  {apt.patient_first_name} {apt.patient_last_name}
                </div>
                {apt.reason && (
                  <div className="text-xs text-muted-foreground truncate">
                    {apt.reason}
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs">
                    {apt.duration_minutes} min
                  </Badge>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {apt.status}
                  </Badge>
                </div>
              </div>
            ))}
            {dayAppointments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No appointments
              </div>
            )}
          </div>
        </div>
      )
    }

    return weekDays
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Appointment Calendar</CardTitle>
            <CardDescription>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('month')}
                className={viewMode === 'month' ? 'bg-accent' : ''}
              >
                Month
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('week')}
                className={viewMode === 'week' ? 'bg-accent' : ''}
              >
                Week
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'month' ? (
          <>
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b">
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 border-l border-t">
              {renderMonthView()}
            </div>
          </>
        ) : (
          <div className="flex border rounded-lg overflow-hidden">
            {renderWeekView()}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-800" />
            <span className="text-xs">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-950 border border-green-300 dark:border-green-800" />
            <span className="text-xs">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-950 border border-yellow-300 dark:border-yellow-800" />
            <span className="text-xs">Scheduled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

