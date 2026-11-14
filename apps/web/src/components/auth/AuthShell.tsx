import type { ReactNode } from 'react';
import { Card, CardBody } from '../ui/Card';
import { Logo } from '../layout/Logo';
import { StarField } from '../layout/StarField';
import { SectionLabel } from '../ui/Note';
import { LanguageToggle } from '../layout/LanguageToggle';

/** Khung chung của các màn đăng nhập, đăng ký, đồng ý — cùng một bầu trời sao. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <>
      <StarField />
      <div className="absolute right-5 top-5 z-2">
        <LanguageToggle />
      </div>
      <div className="relative z-1 grid min-h-screen place-items-center p-6">
        <Card className="w-full max-w-[430px] bg-none bg-bg/60 backdrop-blur-[6px]">
          <CardBody className="px-8 py-9 max-[480px]:px-5">
            <div className="mb-6 text-center">
              <Logo className="mx-auto mb-4 h-[72px] w-[72px] drop-shadow-[0_6px_22px_rgba(212,176,106,.3)]" />
              <SectionLabel className="mb-2 text-center">
                {subtitle ?? 'JobQuest'}
              </SectionLabel>
              <h1 className="font-display text-[30px] font-medium leading-tight tracking-[-0.01em]">
                {title}
              </h1>
            </div>
            {children}
          </CardBody>
        </Card>
      </div>
    </>
  );
}

// `Field` nay nằm ở `ui/Field`; xuất lại ở đây cho các chỗ đang nhập từ file này.
export { Field } from '../ui/Field';
