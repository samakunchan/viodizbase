// Actions
import { AuthActions, AuthActionTypes } from '../_actions/auth.actions';
// Models
import { User, UserViodizRegister } from '../_models/user.model';

export interface AuthState {
  loggedIn: boolean;
  authToken: string;
  user: UserViodizRegister;
  isUserLoaded: boolean;
}

export const initialAuthState: AuthState = {
  loggedIn: false,
  authToken: undefined,
  user: undefined,
  isUserLoaded: false,
};

export function authReducer(state = initialAuthState, action: AuthActions): AuthState {
  switch (action.type) {
    // Etape 4 de l'initialisation de l'app. Ensuite => je ne sais pas encore
    case AuthActionTypes.Login: {
      const _token: string = action.payload.authToken;
      return {
        loggedIn: true,
        authToken: _token,
        user: undefined,
        isUserLoaded: false,
      };
    }

    case AuthActionTypes.Register: {
      const _token: string = action.payload.authToken;
      return {
        loggedIn: true,
        authToken: _token,
        user: undefined,
        isUserLoaded: false,
      };
    }

    case AuthActionTypes.Logout:
      return initialAuthState;

    case AuthActionTypes.UserLoaded: {
      const _user: UserViodizRegister = action.payload.user;
      return {
        ...state,
        user: _user,
        isUserLoaded: true,
      };
    }
    default:
      return state;
  }
}
