import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import verifyAccess from '@/utils/api/auth/VerifyAccess';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ChangePasswordForm from '@/components/modules/security/ChangePasswordForm';
import TwoFactorSection from '@/components/modules/security/TwoFactorSection';

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { verified } = await verifyAccess(context);

  if (!verified) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default function SecurityPage() {
  return (
    <DashboardLayout title="Seguridad y Protección">
      <div className="space-y-10">
        <ChangePasswordForm />
        <TwoFactorSection />
      </div>
    </DashboardLayout>
  );
}

SecurityPage.getLayout = function getLayout(page: React.ReactElement) {
  return <>{page}</>;
};
