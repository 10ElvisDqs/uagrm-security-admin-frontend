import Footer from '@/features/footer';
import Navbar from '@/features/navbar';
import { loadProfile, loadUser } from '@/redux/actions/auth/actions';
import { RootState } from '@/redux/reducers';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

interface PageProps {
  children: React.ReactNode;
}

export default function Layout({ children }: PageProps) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user); // 👈 Agrega esto
  const dispatch: ThunkDispatch<any, any, UnknownAction> = useDispatch();

  useEffect(() => {
    if (isAuthenticated && !user) { // 👈 Guard: solo si no hay usuario cargado
      dispatch(loadUser());
      dispatch(loadProfile());
    }
  }, [dispatch, isAuthenticated, user]);

  return (
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}