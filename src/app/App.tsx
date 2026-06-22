import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { BottomNavigation } from '@/components/BottomNavigation'
import { HomePage } from '@/features/home/HomePage'
import { ActivityListPage } from '@/features/activities/ActivityListPage'
import { ActivityDetailPage } from '@/features/activities/ActivityDetailPage'
import { LessonPlannerPage } from '@/features/planner/LessonPlannerPage'
import { MyLessonsPage } from '@/features/planner/MyLessonsPage'
import { ProgressPage } from '@/features/progress/ProgressPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

function Layout() {
  return (
    <>
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNavigation />
    </>
  )
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/explorar', element: <ActivityListPage /> },
      { path: '/explorar/:id', element: <ActivityDetailPage /> },
      { path: '/planejar', element: <LessonPlannerPage /> },
      { path: '/encontros', element: <MyLessonsPage /> },
      { path: '/progresso', element: <ProgressPage /> },
      { path: '/configuracoes', element: <SettingsPage /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
