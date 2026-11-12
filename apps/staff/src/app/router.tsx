import { createBrowserRouter } from 'react-router-dom';
import { AssetLibraryPage } from '../pages/ca/AssetLibraryPage';
import { CaPortalPage } from '../pages/ca/CaPortalPage';
import { GamifyPage } from '../pages/ca/GamifyPage';
import { ReviewCriteriaPage } from '../pages/ca/ReviewCriteriaPage';
import { ScenarioSlotsPage } from '../pages/ca/ScenarioSlotsPage';
import { AuthoringPage } from '../pages/de/AuthoringPage';
import { DePortalPage } from '../pages/de/DePortalPage';
import { ReviewPage } from '../pages/de/ReviewPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { SignInPage } from '../pages/auth/SignInPage';
import { PortalRedirect, RequireStaff } from '../shell/StaffShell';

/**
 * Route của staff app (đề xuất Q6, `docs/plans/2026-11-06_ke-hoach-staff-app-CA-DE.md` §5).
 * Mã màn theo SITE-02, SITE-03.
 */
export const routes = [
  { path: '/login', element: <SignInPage /> }, // T01
  { path: '/reset-password', element: <ResetPasswordPage /> }, // T01
  {
    element: <RequireStaff />, // T00
    children: [
      { index: true, element: <PortalRedirect /> },
      { path: 'ca', element: <CaPortalPage /> }, // C01
      {
        path: 'ca/occupations/:occupationId/scenarios',
        element: <ScenarioSlotsPage />,
      }, // C05
      {
        path: 'ca/occupations/:occupationId/review-criteria',
        element: <ReviewCriteriaPage />,
      }, // C04
      { path: 'ca/scenarios/:scenarioId/gamify', element: <GamifyPage /> }, // C06
      { path: 'ca/assets', element: <AssetLibraryPage /> }, // C07
      { path: 'de', element: <DePortalPage /> }, // D01
      { path: 'de/scenarios/:scenarioId/author', element: <AuthoringPage /> }, // D03
      { path: 'de/scenarios/:scenarioId/review', element: <ReviewPage /> }, // D04
      { path: '*', element: <PortalRedirect /> },
    ],
  },
];

export const router = createBrowserRouter(routes, { basename: '/staff' });
