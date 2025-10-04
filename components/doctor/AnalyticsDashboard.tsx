"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Calendar, 
  Pill, 
  TestTube, 
  TrendingUp, 
  Activity,
  FileText,
  Clock
} from "lucide-react"

interface AnalyticsData {
  patientStats: {
    total: number
    newThisMonth: number
    activePatients: number
    byGender: { male: number; female: number; other: number }
  }
  appointmentStats: {
    total: number
    completed: number
    upcoming: number
    cancelled: number
    avgDuration: number
    completionRate: number
  }
  prescriptionStats: {
    total: number
    active: number
    completed: number
    topMedications: Array<{ name: string; count: number }>
  }
  labTestStats: {
    total: number
    pending: number
    completed: number
    topTests: Array<{ name: string; count: number }>
  }
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
  }>
}

interface Props {
  data: AnalyticsData
}

export function AnalyticsDashboard({ data }: Props) {
  const {
    patientStats,
    appointmentStats,
    prescriptionStats,
    labTestStats,
    recentActivity
  } = data

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientStats.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{patientStats.newThisMonth}</span> new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {appointmentStats.completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prescriptionStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {prescriptionStats.active} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lab Tests</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labTestStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {labTestStats.pending} pending results
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Demographics & Appointment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Demographics</CardTitle>
            <CardDescription>Distribution by gender</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Male */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Male</span>
                  <span className="text-sm text-muted-foreground">
                    {patientStats.byGender.male} ({Math.round((patientStats.byGender.male / patientStats.total) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(patientStats.byGender.male / patientStats.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Female */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Female</span>
                  <span className="text-sm text-muted-foreground">
                    {patientStats.byGender.female} ({Math.round((patientStats.byGender.female / patientStats.total) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-pink-600 h-2 rounded-full transition-all"
                    style={{ width: `${(patientStats.byGender.female / patientStats.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Other */}
              {patientStats.byGender.other > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Other</span>
                    <span className="text-sm text-muted-foreground">
                      {patientStats.byGender.other} ({Math.round((patientStats.byGender.other / patientStats.total) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${(patientStats.byGender.other / patientStats.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appointment Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
            <CardDescription>Current appointment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Completed */}
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Completed</p>
                    <p className="text-xs text-muted-foreground">Finished consultations</p>
                  </div>
                </div>
                <Badge variant="secondary">{appointmentStats.completed}</Badge>
              </div>

              {/* Upcoming */}
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Upcoming</p>
                    <p className="text-xs text-muted-foreground">Scheduled appointments</p>
                  </div>
                </div>
                <Badge variant="secondary">{appointmentStats.upcoming}</Badge>
              </div>

              {/* Cancelled */}
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Cancelled</p>
                    <p className="text-xs text-muted-foreground">Cancelled appointments</p>
                  </div>
                </div>
                <Badge variant="secondary">{appointmentStats.cancelled}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Medications & Lab Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Prescribed Medications */}
        <Card>
          <CardHeader>
            <CardTitle>Most Prescribed Medications</CardTitle>
            <CardDescription>Top 5 medications prescribed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prescriptionStats.topMedications.slice(0, 5).map((med, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Pill className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{med.name}</p>
                      <p className="text-xs text-muted-foreground">{med.count} prescriptions</p>
                    </div>
                  </div>
                  <Badge variant="outline">#{index + 1}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Ordered Lab Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Most Ordered Lab Tests</CardTitle>
            <CardDescription>Top 5 lab tests ordered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {labTestStats.topTests.slice(0, 5).map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <TestTube className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{test.name}</p>
                      <p className="text-xs text-muted-foreground">{test.count} tests ordered</p>
                    </div>
                  </div>
                  <Badge variant="outline">#{index + 1}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border-l-2 border-primary/20 hover:border-primary/50 transition-colors">
                <div className="mt-1">
                  {activity.type === 'appointment' && <Calendar className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'prescription' && <Pill className="w-4 h-4 text-green-600" />}
                  {activity.type === 'lab_test' && <TestTube className="w-4 h-4 text-purple-600" />}
                  {activity.type === 'patient' && <Users className="w-4 h-4 text-orange-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

