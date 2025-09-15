import { createFileRoute, Outlet } from '@tanstack/react-router'
import ProtectedRoutes from '@/utils/ProtectedRoutes'
import { ROLES } from '@/utils/role'

export const Route = createFileRoute('/student/notices')({
  component: () => (
    <ProtectedRoutes role={ROLES.STUDENT}>
      <Outlet />
    </ProtectedRoutes>
  ),
})

export default Route
