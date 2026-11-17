/**
 * Route theo SITE-01 (sitemap explorer app). Mỗi màn tải lười để trang đầu
 * nhẹ trên mạng yếu (NFR-13).
 */
import { lazy, Suspense, type ComponentType } from 'react';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  ScrollRestoration,
} from 'react-router-dom';
import { LoadingBlock } from '@datn/ui';
import { AppShell } from './AppShell';
import { RequireAuth, RedirectIfSignedIn } from './RequireAuth';
import { RouteError } from './RouteError';

function page(load: () => Promise<{ default: ComponentType }>) {
  const Page = lazy(load);
  return (
    <Suspense
      fallback={<LoadingBlock text="Đang mở…" className="min-h-[50vh]" />}
    >
      <Page />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    // Trang mới mở từ đầu trang, quay lại thì về đúng chỗ cũ (cả màn ngoài AppShell).
    element: (
      <>
        <ScrollRestoration />
        <Outlet />
      </>
    ),
    errorElement: <RouteError />,
    children: [
      {
        path: '/',
        element: page(() => import('../features/landing/LandingPage')),
      },
      {
        path: '/design',
        element: page(() => import('../features/design/DesignSystemPage')),
      },
      {
        element: <RedirectIfSignedIn />,
        children: [
          {
            path: '/sign-in',
            element: page(() => import('../features/auth/SignInPage')),
          },
          {
            path: '/register',
            element: page(() => import('../features/auth/RegisterPage')),
          },
        ],
      },
      {
        path: '/forgot-password',
        element: page(() => import('../features/auth/ForgotPasswordPage')),
      },
      {
        path: '/reset-password',
        element: page(() => import('../features/auth/ResetPasswordPage')),
      },
      {
        element: <RequireAuth />,
        children: [
          // Màn toàn khung, không thanh điều hướng: nhập vai cần tập trung.
          {
            path: '/welcome',
            element: page(() => import('../features/onboarding/WelcomePage')),
          },
          {
            path: '/quiz',
            element: page(() => import('../features/quiz/QuizPage')),
          },
          {
            path: '/play/:runId',
            element: page(() => import('../features/play/PlayPage')),
          },
          {
            // Màn toàn cảnh theme cartoon, không có thanh điều hướng của app.
            path: '/islands/:enrolmentId/onboard',
            element: page(() => import('../features/island/OnboardPage')),
          },
          {
            path: '/play/:runId/reflect',
            element: page(() => import('../features/summary/ReflectPage')),
          },
          {
            path: '/play/:runId/summary',
            element: page(() => import('../features/summary/SummaryPage')),
          },
          {
            element: (
              <AppShell>
                <Outlet />
              </AppShell>
            ),
            children: [
              {
                path: '/galaxy',
                element: page(() => import('../features/galaxy/GalaxyPage')),
              },
              {
                path: '/quiz/result',
                element: page(() => import('../features/quiz/QuizResultPage')),
              },
              {
                path: '/occupations/:code',
                element: page(
                  () => import('../features/occupation/OccupationPage'),
                ),
              },
              {
                path: '/occupations/:code/levels',
                element: page(
                  () => import('../features/occupation/LevelsPage'),
                ),
              },
              {
                path: '/occupations/:code/rate',
                element: page(() => import('../features/rating/RatePage')),
              },
              {
                path: '/islands/:enrolmentId',
                element: page(() => import('../features/island/IslandPage')),
              },
              {
                path: '/profile',
                element: page(() => import('../features/profile/ProfilePage')),
              },
              {
                path: '/settings',
                element: page(
                  () => import('../features/settings/SettingsPage'),
                ),
              },
              {
                path: '/feedback',
                element: page(
                  () => import('../features/feedback/FeedbackPage'),
                ),
              },
            ],
          },
        ],
      },
      { path: '/home', element: <Navigate to="/galaxy" replace /> },
      { path: '*', element: page(() => import('./NotFoundPage')) },
    ],
  },
]);
