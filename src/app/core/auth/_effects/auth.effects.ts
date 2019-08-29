// Angular
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
// RxJS
import { filter, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { defer, Observable, of } from 'rxjs';
// NGRX
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
// Auth actions
import { AuthActionTypes, Login, Logout, Register, UserLoaded, UserRequested } from '..';
import { AuthService } from '../_services';
import { AppState } from '../../reducers';
import { environment } from '../../../../environments/environment';
import { isUserLoaded } from '..';

@Injectable()
export class AuthEffects {
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
        this.store.dispatch(new UserLoaded({ user: _user }));
      } else {
        this.store.dispatch(new Logout());
      }
    }),
  );

  /**
   * Désactivation de l'effet init afin de relancer l'application avec le formulaire login
   */
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
