import { createBrowserRouter } from 'react-router-dom';
import { CataloguePage } from '../pages/ca/CataloguePage';
import { ReferenceImportPage } from '../pages/ca/ReferenceImportPage';
import { PublishScenarioPage } from '../pages/ca/PublishScenarioPage';
import { OccupationMonitorPage } from '../pages/ca/OccupationMonitorPage';
import { SystemPromptsPage } from '../pages/ca/SystemPromptsPage';
import { GameSettingsPage } from '../pages/ca/GameSettingsPage';

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
import {
  PortalRedirect,
  RequirePortal,
  RequireStaff,
} from '../shell/StaffShell';

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
      {
        path: 'ca',
        element: <RequirePortal portal="ca" />,
        children: [
          { index: true, element: <CaPortalPage /> }, // C01
          {
            path: 'occupations/:occupationId/scenarios',
            element: <ScenarioSlotsPage />,
          }, // C05
          {
            path: 'occupations/:occupationId/review-criteria',
            element: <ReviewCriteriaPage />,
          }, // C04
          { path: 'scenarios/:scenarioId/gamify', element: <GamifyPage /> }, // C06
          { path: 'assets', element: <AssetLibraryPage /> }, // C07
          { path: 'catalogue', element: <CataloguePage /> }, // C02
          {
            path: 'catalogue/imports/:importId?',
            element: <ReferenceImportPage />,
          }, // C03
          {
            path: 'scenarios/:scenarioId/publish',
            element: <PublishScenarioPage />,
          }, // C08
          {
            path: 'occupations/:occupationId/monitor',
            element: <OccupationMonitorPage />,
          }, // C09
          {
            path: 'occupations/:occupationId/prompts',
            element: <SystemPromptsPage />,
          }, // C10
          { path: 'settings', element: <GameSettingsPage /> }, // C11 ĐỀ XUẤT
        ],
      },
      {
        path: 'de',
        element: <RequirePortal portal="de" />,
        children: [
          { index: true, element: <DePortalPage /> }, // D01
          { path: 'scenarios/:scenarioId/author', element: <AuthoringPage /> }, // D03
          { path: 'scenarios/:scenarioId/review', element: <ReviewPage /> }, // D04
        ],
      },
      { path: '*', element: <PortalRedirect /> },
    ],
  },
];

export const router = createBrowserRouter(routes, { basename: '/staff' });
