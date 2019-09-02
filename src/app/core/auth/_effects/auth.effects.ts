// Angular
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
// RxJS
import { filter, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { defer, Observable, of } from 'rxjs';
// NGRX
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
// Auth actions
import {
  Address,
  AuthActionTypes,
  CurrentUserUpdate,
  Login,
  Logout,
  Register,
  SocialNetworks,
  UserCreated,
  UserLoaded,
  UserRequested,
  UsersActionToggleLoading,
} from '..';
import { AuthService } from '../_services';
import { AppState } from '../../reducers';
import { environment } from '../../../../environments/environment';
import { isUserLoaded } from '..';
import { Users, UserViodizRegister } from '../_models/user.model';

@Injectable()
export class AuthEffects {
  user: UserViodizRegister;
  showActionLoadingDistpatcher = new UsersActionToggleLoading({ isLoading: true });
  hideActionLoadingDistpatcher = new UsersActionToggleLoading({ isLoading: false });

  @Effect({ dispatch: false })
  login$ = this.actions$.pipe(
    ofType<Login>(AuthActionTypes.Login),
    tap(action => {
      // Etape 2 de l'initialisation de l'app. Ensuite => auth.reducer.ts ligne 22
      localStorage.setItem(environment.authTokenKey, action.payload.authToken);
      // L'utilisateur est chargé lors de l'initialisation et à la connection
      this.store.dispatch(new UserRequested());
    }),
  );

  @Effect({ dispatch: false })
  logout$ = this.actions$.pipe(
    ofType<Logout>(AuthActionTypes.Logout),
    tap(() => {
      localStorage.removeItem(environment.authTokenKey);
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.returnUrl } });
    }),
  );

  @Effect({ dispatch: false })
  register$ = this.actions$.pipe(
    ofType<Register>(AuthActionTypes.Register),
    tap(action => {
      localStorage.setItem(environment.authTokenKey, action.payload.authToken);
    }),
  );

  @Effect({ dispatch: false })
  loadUser$ = this.actions$.pipe(
    ofType<UserRequested>(AuthActionTypes.UserRequested),
    withLatestFrom(this.store.pipe(select(isUserLoaded))), // isUserLoaded = true ou false
    filter(([action, _isUserLoaded]) => !_isUserLoaded),
    mergeMap(([action, _isUserLoaded]) => this.auth.getUserByTokenFromCloud()), // Doit etre un observable afin de tap. L'objet user fed est la.
    tap(_user => {
      if (_user) {
        // On se contente de savoir si le token est valide, on utilise le authState pour la suite pour avoir les données en instantané
        this.auth.getUser().subscribe((result: Users) => {
          // Apparemment cela ne marche pas a l'ouverture de l'application
          const user = new Users('', '', '', false, '', '', '', '', '', new Address(), new SocialNetworks(), result.metadata);
          user.uid = result.uid;
          user.displayName = result.displayName;
          user.email = result.email;
          user.emailVerified = result.emailVerified;
          user.photoURL = result.photoURL;
          this.store.dispatch(new UserLoaded({ user }));
        });
      } else {
        this.store.dispatch(new Logout());
      }
    }),
  );

  @Effect({ dispatch: false })
  updateCurrentUser = this.actions$.pipe(
    ofType<CurrentUserUpdate>(AuthActionTypes.CurrentUserUpdate),
    mergeMap(({ payload }) => {
      return this.auth.updateUserProfil(payload.user).pipe(
        tap(result => {
          const user = new Users('', '', '', false, '', '', '', '', '', new Address(), new SocialNetworks());
          user.uid = result.uid;
          user.displayName = result.displayName;
          user.email = result.email;
          user.emailVerified = result.emailVerified;
          user.photoURL = result.photoURL;
          return this.store.dispatch(new UserLoaded({ user }));
        }),
      );
    }),
  );

  @Effect()
  init$: Observable<Action> = defer(() => {
    const userToken = localStorage.getItem(environment.authTokenKey);
    // Ajouter le current user de firebase ou le current user de nrgx qui détient le current user de firebase

    let observableResult = of({ type: 'NO_ACTION' });
    if (userToken) {
      // Etape 1 de l'initialisation de l'app. Ensuite => ligne 23
      observableResult = of(new Login({ authToken: userToken }));
    }
    return observableResult;
  });

  private returnUrl: string;

  constructor(private actions$: Actions, private router: Router, private auth: AuthService, private store: Store<AppState>) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.returnUrl = event.url;
      }
    });
  }
}
