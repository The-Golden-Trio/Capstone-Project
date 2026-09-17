import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { findRole, findScenarioByKey, roleName } from '../data/indexes';
import { shortName } from '../domain/format';
import type { CrumbHandle } from '../hooks/useBreadcrumbs';
import { DashboardPage } from './DashboardPage';
import { ErrorPage } from './ErrorPage';
import { EventPage } from './EventPage';
import { EventResultPage } from './EventResultPage';
import { JobsMapPage } from './JobsMapPage';
import { ProfilePage } from './ProfilePage';
import { QuizPage } from './QuizPage';
import { QuizResultPage } from './QuizResultPage';
import { RequireProfile } from './RequireProfile';
import { SignupPage } from './SignupPage';
import { JobPage } from './job/JobPage';
import { EndingPage } from './play/EndingPage';
import { PlayPage } from './play/PlayPage';

/** Mẩu bánh mì "Bản đồ nghề / <tên nghề>" dùng lại ở mọi route con của một nghề. */
const roleCrumbs: CrumbHandle['crumbs'] = ({ roleCode, band }) => {
  const role = findRole(roleCode);
  if (!role || !band) return [{ label: 'Bản đồ nghề', to: '/jobs' }];
  return [
    { label: 'Bản đồ nghề', to: '/jobs' },
    {
      label: shortName(role.role_name_vn),
      to: `/jobs/${role.role_code}/${band}`,
    },
  ];
};

const routes: RouteObject[] = [
  {
    path: '/signup',
    element: <SignupPage />,
    errorElement: <ErrorPage />,
  },
  {
    element: <RequireProfile />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
        handle: { crumbs: () => [{ label: 'Tổng quan' }] } satisfies CrumbHandle,
      },
      {
        path: 'quiz',
        handle: {
          crumbs: () => [{ label: 'Tự vấn', to: '/quiz' }],
        } satisfies CrumbHandle,
        children: [
          { index: true, element: <QuizPage /> },
          {
            path: 'result',
            element: <QuizResultPage />,
            handle: {
              crumbs: () => [{ label: 'Kết quả' }],
            } satisfies CrumbHandle,
          },
        ],
      },
      {
        path: 'jobs',
        children: [
          {
            index: true,
            element: <JobsMapPage />,
            handle: {
              crumbs: () => [{ label: 'Bản đồ nghề' }],
            } satisfies CrumbHandle,
          },
          {
            path: ':roleCode/:band',
            handle: { crumbs: roleCrumbs } satisfies CrumbHandle,
            children: [
              { index: true, element: <JobPage /> },
              { path: 'events/:eventId', element: <EventPage /> },
              { path: 'events/:eventId/result', element: <EventResultPage /> },
              { path: ':tab', element: <JobPage /> },
            ],
          },
        ],
      },
      {
        path: 'play/:scenarioKey',
        handle: {
          crumbs: ({ scenarioKey }) => {
            const entry = scenarioKey ? findScenarioByKey(scenarioKey) : undefined;
            if (!entry) return [{ label: 'Màn chơi' }];
            const { role_code, band } = entry.scenario.job;
            return [
              { label: 'Bản đồ nghề', to: '/jobs' },
              {
                label: shortName(roleName(role_code)),
                to: `/jobs/${role_code}/${band}`,
              },
              { label: entry.scenario.scenario_title },
            ];
          },
        } satisfies CrumbHandle,
        children: [
          { index: true, element: <PlayPage /> },
          { path: 'end', element: <EndingPage /> },
        ],
      },
      {
        path: 'profile',
        element: <ProfilePage />,
        handle: {
          crumbs: () => [{ label: 'Hành trang' }],
        } satisfies CrumbHandle,
      },
      { path: '*', element: <ErrorPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
