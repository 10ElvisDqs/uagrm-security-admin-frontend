import { RootState } from '@/redux/reducers';
import { Dispatch, UnknownAction } from 'redux';
import { ToastError, ToastSuccess } from '@/components/toast/alerts';
import { ThunkDispatch } from 'redux-thunk';
import {
  SIGNUP_SUCCESS,
  SIGNUP_FAIL,
  ACTIVATION_SUCCESS,
  ACTIVATION_FAIL,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOAD_USER_SUCCESS,
  LOAD_USER_FAIL,
  REFRESH_TOKEN_FAIL,
  REFRESH_TOKEN_SUCCESS,
  VERIFY_TOKEN_FAIL,
  VERIFY_TOKEN_SUCCESS,
  LOAD_PROFILE_FAIL,
  LOAD_PROFILE_SUCCESS,
  LOGOUT,
} from './types';
import type {
  IRegisterProps,
  IActivationProps,
  IResendActivationProps,
  IForgotPasswordProps,
  IForgotPasswordConfirmProps,
  ILoginProps,
} from './interfaces';

export const register = (props: IRegisterProps) => async (dispatch: Dispatch) => {
  try {
    const body = JSON.stringify({
      email: props.email,
      username: props.username,
      first_name: props.first_name,
      last_name: props.last_name,
      password: props.password,
      re_password: props.re_password,
    });

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body,
    });

    const data = await res.json();

    if (res.status === 201) {
      dispatch({
        type: SIGNUP_SUCCESS,
      });
      ToastSuccess('Hemos enviado un correo electrónico, por favor haga clic en el enlace para verificar su cuenta.');
    } else {
      dispatch({
        type: SIGNUP_FAIL,
      });
      if (data.email && data.email.length > 0) {
        ToastError(data.email[0]);
      } else if (data.username && data.username.length > 0) {
        ToastError(data.username[0]);
      } else {
        ToastError('Ocurrió un error desconocido.');
      }
    }
  } catch (err) {
    dispatch({
      type: SIGNUP_FAIL,
    });
  }
};

export const activate = (props: IActivationProps) => async (dispatch: Dispatch) => {
  try {
    const body = JSON.stringify({
      uid: props.uid,
      token: props.token,
    });

    const res = await fetch('/api/auth/activate', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body,
    });

    if (res.status === 204) {
      dispatch({
        type: ACTIVATION_SUCCESS,
      });
      ToastSuccess('Su cuenta ha sido activada, ahora puede iniciar sesión.');
    } else {
      dispatch({
        type: ACTIVATION_FAIL,
      });
      ToastError('Hubo un error al activar su cuenta.');
    }
  } catch (err) {
    dispatch({
      type: ACTIVATION_FAIL,
    });
  }
};

export const resendActivation = (props: IResendActivationProps) => async () => {
  try {
    const body = JSON.stringify({
      email: props.email,
    });

    const res = await fetch('/api/auth/resend_activation', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body,
    });

    if (res.status === 204) {
      ToastSuccess('Hemos enviado un correo electrónico para activar su cuenta.');
    } else {
      ToastError('Hubo un error al reenviar el correo de activación.');
    }
  } catch (err) {
    ToastError('Error inesperado');
  }
};

export const forgotPassword = (props: IForgotPasswordProps) => async () => {
  try {
    const body = JSON.stringify({
      email: props.email,
    });

    const res = await fetch('/api/auth/forgot_password', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body,
    });

    if (res.status === 204) {
      ToastSuccess('Hemos enviado un correo electrónico para restablecer su contraseña.');
    } else {
      ToastError('Hubo un error al reenviar el correo de restablecimiento de contraseña.');
    }
  } catch (err) {
    ToastError('Error inesperado');
  }
};

export const forgotPasswordConfirm = (props: IForgotPasswordConfirmProps) => async () => {
  try {
    const body = JSON.stringify({
      new_password: props.new_password,
      re_new_password: props.re_new_password,
      uid: props.uid,
      token: props.token,
    });

    const res = await fetch('/api/auth/forgot_password_confirm', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body,
    });

    if (res.status === 204) {
      ToastSuccess('Su contraseña ha sido restablecida, ahora puede iniciar sesión.');
    } else {
      ToastError('Hubo un error al restablecer su contraseña.');
    }
  } catch (err) {
    ToastError('Error inesperado');
  }
};

export const loadUser = () => async (dispatch: Dispatch) => {
  try {
    const res = await fetch('/api/auth/user', {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await res.json();
    if (res.status === 200) {
      dispatch({
        type: LOAD_USER_SUCCESS,
        payload: data,
      });
    } else {
      dispatch({
        type: LOAD_USER_FAIL,
      });
      ToastError('Error al cargar la información del usuario.');
    }
  } catch (err) {
    dispatch({
      type: LOAD_USER_FAIL,
    });
  }
};

export const loadProfile = () => async (dispatch: Dispatch) => {
  try {
    const res = await fetch('/api/auth/profile', { credentials: 'include' });

    const data = await res.json();
    if (res.status === 200) {
      dispatch({
        type: LOAD_PROFILE_SUCCESS,
        payload: data.results,
      });
    } else {
      dispatch({
        type: LOAD_PROFILE_FAIL,
      });
      ToastError('Error al cargar el perfil de usuario.');
    }
  } catch (err) {
    dispatch({
      type: LOAD_PROFILE_FAIL,
    });
  }
};

export const login =
  (props: ILoginProps) => async (dispatch: ThunkDispatch<RootState, void, UnknownAction>) => {
    try {
      const body = JSON.stringify({
        email: props.email,
        password: props.password,
      });

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body,
      });

      if (res.status === 200) {
        dispatch({
          type: LOGIN_SUCCESS,
        });
        await Promise.all([dispatch(loadUser()), dispatch(loadProfile())]);
        ToastSuccess('Login exitoso!');
      } else {
        dispatch({
          type: LOGIN_FAIL,
        });
        ToastError('Error al iniciar sesión, verifique su correo electrónico y contraseña.');
      }
    } catch (err) {
      dispatch({
        type: LOGIN_FAIL,
      });
    }
  };

export const refreshAccessToken = () => async (dispatch: Dispatch) => {
  try {
    const res = await fetch('/api/auth/refresh', { credentials: 'include' });
    if (res.status === 200) {
      dispatch({
        type: REFRESH_TOKEN_SUCCESS,
      });
    } else {
      dispatch({
        type: REFRESH_TOKEN_FAIL,
      });
    }
  } catch (err) {
    dispatch({
      type: REFRESH_TOKEN_FAIL,
    });
  }
};

export const verifyAccessToken = () => async (dispatch: Dispatch) => {
  try {
    const res = await fetch('/api/auth/verify', { credentials: 'include' });
    if (res.status === 200) {
      dispatch({
        type: VERIFY_TOKEN_SUCCESS,
      });
    } else {
      dispatch({
        type: VERIFY_TOKEN_FAIL,
      });
    }
  } catch (err) {
    dispatch({
      type: VERIFY_TOKEN_FAIL,
    });
  }
};

export const setLoginSuccess = () => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: LOGIN_SUCCESS,
    });
  } catch (err) {
    dispatch({
      type: LOGIN_FAIL,
    });
  }
};

export const logout = () => async (dispatch: Dispatch) => {
  try {
    const res = await fetch('/api/auth/logout', { credentials: 'include' });
    if (res.status === 200) {
      dispatch({
        type: LOGOUT,
      });
    }
  } catch (err) {
    ToastError('No se pudo cerrar la sesión');
  }
};
