import { Action } from '@ngrx/store';
import { User, Users } from '../_models/user.model';

export enum AuthActionTypes {
  Login = '[Login] Action',
  Logout = '[Logout] Action',
  Register = '[Register] Action',
  UserRequested = '[Request User] Action',
  UserLoaded = '[Load User] Auth API',
  CurrentUserUpdatePhoto = '[Update current user photo] Auth API',
  CurrentUserUpdateAddInfos = '[Update current user additionnal information] Auth API',
}

export class Login implements Action {
  readonly type = AuthActionTypes.Login;
  // Etape 3 de l'initialisation de l'app. Ensuite => auth.reducer.ts ligne 22
  constructor(public payload: { authToken: string }) {}
}

export class Logout implements Action {
  readonly type = AuthActionTypes.Logout;
}

export class Register implements Action {
  readonly type = AuthActionTypes.Register;
  constructor(public payload: { authToken: string }) {}
}

export class UserRequested implements Action {
  readonly type = AuthActionTypes.UserRequested;
}

export class UserLoaded implements Action {
  readonly type = AuthActionTypes.UserLoaded;
  constructor(public payload: { user: Users }) {}
}

export class CurrentUserUpdatePhoto implements Action {
  readonly type = AuthActionTypes.CurrentUserUpdatePhoto;
  constructor(public payload: { user: Users }) {}
}

export class CurrentUserUpdateAddInfos {
  readonly type = AuthActionTypes.CurrentUserUpdateAddInfos;
  constructor(public payload: { user: Users }) {}
}
export type AuthActions = Login | Logout | Register | UserRequested | UserLoaded | CurrentUserUpdatePhoto | CurrentUserUpdateAddInfos;
