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
  Certificat,
  CoursesFollowed,
  Login,
  Logout,
  Metadata,
  QCMQuestions,
  QCMResponses,
  QCMState,
  Register,
  SocialNetworks,
  UserCreated,
  UserLoaded,
  UserRequested,
  UsersActionToggleLoading,
  ViodizProf,
  ViodizStudent,
} from '..';
import { AuthService } from '../_services';
import { AppState } from '../../reducers';
import { environment } from '../../../../environments/environment';
import { isUserLoaded } from '..';
import { Users } from '../_models/user.model';
import { CurrentUserUpdateAddInfos, CurrentUserUpdatePhoto } from '..';

import * as toastr from '../../../../assets/js/toastr';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class AuthEffects {
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
      this.auth.signOut();
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
    // Doit etre un observable afin de tap. L'objet user fed est la.
    mergeMap(([action, _isUserLoaded]) => this.auth.getUserByTokenFromCloud()),
    tap(_user => {
      if (_user) {
        // On se contente de savoir si le token est valide, on utilise le authState pour la suite pour avoir les données en instantané
        this.auth.getUser().subscribe((user: Users) => {
          console.log(user);
          this.store.dispatch(new UserLoaded({ user }));
        });
      } else {
        this.store.dispatch(new Logout());
      }
    }),
  );

  @Effect({ dispatch: false })
  updateCurrentUserPhoto = this.actions$.pipe(
    ofType<CurrentUserUpdatePhoto>(AuthActionTypes.CurrentUserUpdatePhoto),
    mergeMap(({ payload }) => {
      return this.auth.updateUserProfilPhoto(payload.user).pipe(
        tap(result => {
          const user = new Users('', '', '');
          // Rajouter les autres informations de la collection
          user.uid = result.uid;
          user.displayName = result.displayName;
          user.email = result.email;
          user.emailVerified = result.emailVerified;
          user.photoURL = result.photoURL;
          user.firstname = result.firstname;
          user.lastname = result.lastname;
          user.occupation = result.occupation;
          user.companyName = result.companyName;
          user.phone = result.phone;
          user.website = result.website;
          user.address = result.address;
          user.socialNetworks = result.socialNetworks;
          user.studentInfos = result.studentInfos;
          toastr.success((this.translate.instant('NOTIFICATIONS.SUCCESS'), 'Profil'));
          return this.store.dispatch(new UserLoaded({ user }));
        }),
      );
    }),
  );

  @Effect({ dispatch: false })
  currentUserUpdateAddInfos = this.actions$.pipe(
    ofType<CurrentUserUpdateAddInfos>(AuthActionTypes.CurrentUserUpdateAddInfos),
    mergeMap(({ payload }) => {
      return this.auth.updateCurrentUserProfil(payload.user).pipe(
        tap(result => {
          const user = new Users('', '', '');
          user.uid = result.uid;
          user.displayName = result.displayName;
          user.email = result.email;
          user.emailVerified = result.emailVerified;
          user.photoURL = result.photoURL;
          user.firstname = result.firstname;
          user.lastname = result.lastname;
          user.occupation = result.occupation;
          user.companyName = result.companyName;
          user.phone = result.phone;
          user.website = result.website;
          user.address = result.address;
          user.socialNetworks = result.socialNetworks;
          user.studentInfos = result.studentInfos;
          toastr.success(this.translate.instant('NOTIFICATIONS.SUCCESS'), 'Profil');
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

  constructor(private actions$: Actions, private router: Router, private auth: AuthService, private store: Store<AppState>, private translate: TranslateService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.returnUrl = event.url;
      }
    });

    toastr.options = {
      closeButton: true,
      debug: false,
      newestOnTop: true,
      progressBar: false,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      onclick: null,
      showDuration: '300',
      hideDuration: '1000',
      timeOut: '5000',
      extendedTimeOut: '1000',
      showEasing: 'swing',
      hideEasing: 'linear',
      showMethod: 'fadeIn',
      hideMethod: 'fadeOut'
    };
  }
}
