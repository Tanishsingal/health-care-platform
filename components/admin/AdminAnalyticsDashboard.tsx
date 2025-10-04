"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  UserPlus,
  Calendar, 
  Pill, 
  TestTube, 
  TrendingUp, 
  Activity,
  FileText,
  Clock,
  Stethoscope,
  Building,
  DollarSign,
  AlertCircle
} from "lucide-react"

interface AdminAnalyticsData {
  systemOverview: {
    totalUsers: number
    totalPatients: number
    totalDoctors: number
    totalStaff: number
    newUsersThisMonth: number
    activeUsers: number
  }
  patientStats: {
    total: number
    newThisMonth: number
    activePatients: number
    byGender: { male: number; female: number; other: number }
    byBloodGroup: Array<{ bloodGroup: string; count: number }>
  }
  staffStats: {
    doctors: number
    nurses: number
    labTechnicians: number
    pharmacists: number
    byDepartment: Array<{ department: string; count: number }>
    bySpecialization: Array<{ specialization: string; count: number }>
  }
  appointmentStats: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
    completed: number
    upcoming: number
    cancelled: number
    completionRate: number
  }
  prescriptionStats: {
    total: number
    thisMonth: number
    active: number
    topMedications: Array<{ name: string; count: number }>
  }
  labTestStats: {
    total: number
    thisMonth: number
    pending: number
    completed: number
    topTests: Array<{ name: string; count: number }>
  }
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
    user?: string
  }>
  systemHealth: {
    averageAppointmentDuration: number
    patientSatisfaction: number
    staffUtilization: number
    systemUptime: number
  }
}

interface Props {
  data: AdminAnalyticsData
}

export function AdminAnalyticsDashboard({ data }: Props) {
  const {
    systemOverview,
    patientStats,
    staffStats,
    appointmentStats,
    prescriptionStats,
    labTestStats,
    recentActivity,
    systemHealth
  } = data

  return (
    <div className="space-y-6">
      {/* System Overview - Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{systemOverview.totalUsers}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              <span className="font-semibold">+{systemOverview.newUsersThisMonth}</span> new this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">{systemOverview.totalPatients}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              <span className="font-semibold">{patientStats.activePatients}</span> active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Stethoscope className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{systemOverview.totalDoctors}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              <span className="font-semibold">{systemOverview.totalStaff}</span> total staff
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">{appointmentStats.today}</div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Today | <span className="font-semibold">{appointmentStats.thisWeek}</span> this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prescriptionStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {prescriptionStats.thisMonth} this month | {prescriptionStats.active} active
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
              {labTestStats.pending} pending | {labTestStats.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentStats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {appointmentStats.completed} of {appointmentStats.total} appointments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Demographics & Staff Distribution */}
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

        {/* Staff Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Distribution</CardTitle>
            <CardDescription>By role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Doctors */}
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Doctors</p>
                    <p className="text-xs text-muted-foreground">Medical practitioners</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg">{staffStats.doctors}</Badge>
              </div>

              {/* Nurses */}
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Nurses</p>
                    <p className="text-xs text-muted-foreground">Nursing staff</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg">{staffStats.nurses}</Badge>
              </div>

              {/* Lab Technicians */}
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <TestTube className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Lab Technicians</p>
                    <p className="text-xs text-muted-foreground">Laboratory staff</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg">{staffStats.labTechnicians}</Badge>
              </div>

              {/* Pharmacists */}
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <Pill className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Pharmacists</p>
                    <p className="text-xs text-muted-foreground">Pharmacy staff</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg">{staffStats.pharmacists}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Medications & Lab Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Medications */}
        <Card>
          <CardHeader>
            <CardTitle>Most Prescribed Medications</CardTitle>
            <CardDescription>System-wide top 5</CardDescription>
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

        {/* Top Lab Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Most Ordered Lab Tests</CardTitle>
            <CardDescription>System-wide top 5</CardDescription>
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

      {/* Top Specializations & Blood Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Specializations */}
        <Card>
          <CardHeader>
            <CardTitle>Doctor Specializations</CardTitle>
            <CardDescription>Distribution by specialty</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {staffStats.bySpecialization.slice(0, 6).map((spec, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{spec.specialization || 'General Practice'}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(spec.count / staffStats.doctors) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{spec.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Blood Group Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Blood Group Distribution</CardTitle>
            <CardDescription>Patient blood types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {patientStats.byBloodGroup.slice(0, 8).map((bg, index) => (
                <div key={index} className="p-3 border rounded-lg text-center hover:bg-accent transition-colors">
                  <div className="text-2xl font-bold text-primary">{bg.bloodGroup || 'Unknown'}</div>
                  <div className="text-xs text-muted-foreground">{bg.count} patients</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent System Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
          <CardDescription>Latest 15 activities across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.slice(0, 15).map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border-l-2 border-primary/20 hover:border-primary/50 transition-colors">
                <div className="mt-1">
                  {activity.type === 'appointment' && <Calendar className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'prescription' && <Pill className="w-4 h-4 text-green-600" />}
                  {activity.type === 'lab_test' && <TestTube className="w-4 h-4 text-purple-600" />}
                  {activity.type === 'patient' && <Users className="w-4 h-4 text-orange-600" />}
                  {activity.type === 'user' && <UserPlus className="w-4 h-4 text-pink-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  {activity.user && (
                    <p className="text-xs text-muted-foreground mt-1">By: {activity.user}</p>
                  )}
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

