import { ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useMetaMask } from '@/components/web3/MetaMaskProvider';
import { MainLayout } from '@/components/layout/MainLayout';

interface PatientLayoutProps {
  children: ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isConnected, currentAccount } = useMetaMask();
  const [isLoading, setIsLoading] = useState(true);
  const [patientSession, setPatientSession] = useState<any>(null);
  
  // Check for MetaMask-based patient session in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPatientSession = localStorage.getItem('patientSession');
      if (storedPatientSession) {
        try {
          setPatientSession(JSON.parse(storedPatientSession));
        } catch (error) {
          console.error('Error parsing patient session:', error);
        }
      }
      setIsLoading(false);
    }
  }, []);

  // Check if user is authenticated via next-auth or MetaMask
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if authenticated via next-auth (case insensitive check for 'patient' role)
  const isNextAuthPatient = session?.user?.role?.toUpperCase() === 'PATIENT';
  
  // Check if authenticated via MetaMask
  const isMetaMaskPatient = isConnected && currentAccount && patientSession?.user?.role === 'patient';
  
  // If not authenticated at all, redirect to login
  if (!isNextAuthPatient && !isMetaMaskPatient) {
    console.log('Not authenticated, redirecting to login');
    router.push('/login');
    return null;
  }
  
  // Simply use the MainLayout component which already handles responsive design
  // and has the sidebar with role-based navigation
  return <MainLayout>{children}</MainLayout>;
}
