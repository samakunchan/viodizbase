import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User, UserLoaded } from '..';
import { Permission } from '..';
import { Role } from '..';
import { catchError, finalize, map } from 'rxjs/operators';
import { QueryParamsModel, QueryResultsModel } from '../../_base/crud';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { Users, UserViodiz, UserViodizRegister } from '../_models/user.model';
import { AngularFireStorage } from '@angular/fire/storage';

const API_USERS_URL = 'api/user';
const API_PERMISSION_URL = 'api/permissions';
const API_ROLES_URL = 'api/roles';

@Injectable()
export class AuthService {
  ref;
  path;
  file;
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;

  // https://youtu.be/qWy9ylc3f9U?t=342
  constructor(private http: HttpClient, private fireAuth: AngularFireAuth, private storage: AngularFireStorage) {}
  // Authentication/Authorization
  // login(email: string, password: string): Observable<User> {
  //   return this.http.post<User>(API_USERS_URL, { email, password });
  // }

  // Pour firebase
  login(email: string, password: string): Observable<any> {
    return this.loginObservable(email, password);
  }
  // Pour login firebase
  loginObservable(email, password) {
    return new Observable(observer => {
      this.fireAuth.auth
        .signInWithEmailAndPassword(email, password)
        .then(result => {
          this.fireAuth.auth.currentUser
            .getIdToken(true)
            .then(idToken => {
              observer.next({ data: result.user, idToken });
            })
            .catch(error => {
              observer.error(error);
            });
        })
        .catch(error => {
          const errorCode = error.code;
          const errorMessage = error.message;
          if (errorCode === 'auth/wrong-password') {
            alert('Mot de passe incorrect.');
          } else {
            alert(errorMessage);
          }
          observer.error(error);
        });
    });
  }

  getUserByToken(): Observable<User> {
    const userToken = localStorage.getItem(environment.authTokenKey);
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('Authorization', 'Bearer ' + userToken);
    return this.http.get<User>(API_USERS_URL, { headers: httpHeaders });
  }

  getUserByTokenFromCloud(): Observable<UserViodiz> {
    const userToken = localStorage.getItem(environment.authTokenKey);
    return new Observable(observer => {
      const tokenFromCloud = firebase.functions().httpsCallable('getUserWithToken');
      tokenFromCloud({ token: userToken })
        .then(result => {
          return observer.next(result.data);
        })
        .catch(error => observer.error(error));
    });
  }

  async signInWithGoogle() {
    if (!this.fireAuth.auth.currentUser) {
      const provider = new firebase.auth.GoogleAuthProvider();

      return await this.fireAuth.auth
        .signInWithPopup(provider)
        .then(result => {
          if (this.fireAuth.auth.currentUser) {
            return this.fireAuth.auth.currentUser
              .getIdToken(true)
              .then(idToken => {
                return { data: result.user, idToken };
              })
              .catch(error => {
                console.log(error);
              });
          }
        })
        .catch(error => {
          const errorCode = error.code;
          const errorMessage = error.message;
          const email = error.email;
          const credential = error.credential;
          if (errorCode === 'auth/account-exists-with-different-credential') {
            alert('You have already signed up with a different auth provider for that email.');
          } else {
            console.error(error);
          }
        });
    } else {
      await this.fireAuth.auth.signOut();
    }
  }

  async signInWithFacebook() {
    // Mettre en observable
    if (!this.fireAuth.auth.currentUser) {
      const provider = new firebase.auth.FacebookAuthProvider();

      return await this.fireAuth.auth
        .signInWithPopup(provider)
        .then(result => {
          if (this.fireAuth.auth.currentUser) {
            return this.fireAuth.auth.currentUser
              .getIdToken(true)
              .then(idToken => {
                return { data: result.user, idToken };
              })
              .catch(error => {
                console.log(error);
              });
          }
        })
        .catch(error => {
          const errorCode = error.code;
          const errorMessage = error.message;
          const email = error.email;
          const credential = error.credential;
          if (errorCode === 'auth/account-exists-with-different-credential') {
            alert('You have already signed up with a different auth provider for that email.');
          } else {
            console.error(error);
          }
        });
    } else {
      await this.fireAuth.auth.signOut();
    }
  }

  register(user: User): Observable<any> {
    return this.registerObservable(user);
  }

  registerObservable(user: User) {
    return new Observable(observer => {
      this.fireAuth.auth
        .createUserWithEmailAndPassword(user.email, user.password)
        .then(result => {
          this.fireAuth.auth.currentUser.updateProfile({ displayName: user.username });
          this.fireAuth.auth.currentUser
            .getIdToken(true)
            .then(idToken => {
              observer.next({ data: result.user });
            })
            .catch(error => {
              observer.error(error);
            });
        })
        .catch(error => {
          observer.error(error);
          console.log(error);
        });
    });
  }

  /*
   * Submit forgot password request
   *
   * @param {string} email
   * @returns {Observable<any>}
   */
  public requestPassword(email: string): Observable<any> {
    return this.http.get(API_USERS_URL + '/forgot?=' + email).pipe(catchError(this.handleError('forgot-password', [])));
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(API_USERS_URL);
  }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(API_USERS_URL + `/${userId}`);
  }

  // DELETE => delete the user from the server
  deleteUser(userId: number) {
    const url = `${API_USERS_URL}/${userId}`;
    return this.http.delete(url);
  }

  // UPDATE => PUT: update the user on the server
  updateUser(_user: User): Observable<any> {
    const httpHeaders = new HttpHeaders();
    httpHeaders.set('Content-Type', 'application/json');
    return this.http.put(API_USERS_URL, _user, { headers: httpHeaders });
  }

  getUser() {
    return new Observable(observer => {
      this.fireAuth.authState.subscribe(user => {
        if (user) {
          observer.next(user);
        } else {
          observer.error('Missing user');
        }
      });
    });
  }

  // Obliger d'envoyer un observble User pour le l'action new UserLoaded()
  updateUserProfil(_user: Users): Observable<Users> {
    return new Observable<Users>(observer => {
      this.fireAuth.authState.subscribe(user => {
        console.log(_user);
        user
          .updateProfile({
            photoURL: _user.photoURL,
          })
          .then(res =>
            observer.next({
              displayName: _user.displayName,
              email: _user.email,
              emailVerified: _user.emailVerified,
              photoURL: _user.photoURL,
              uid: _user.uid,
              metadata: _user.metadata,
            }),
          )
          .catch(err => {
            observer.error(err);
          });
      });
    });
  }
  uploadFile(file, path) {
    return new Promise((resolve, reject) => {
      this.file = file;
      this.path = path;
      const upload = firebase
        .storage()
        .ref('/images')
        // Mettre le username a la place du file.name
        .child('users/' + this.path + '-' + this.file.name)
        .put(this.file);
      return upload.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        () => {
          console.log('Chargement…');
        },
        error => {
          console.log('Erreur de chargement ! : ' + error.message);
          reject(error.message);
        },
        () => {
          return upload.snapshot.ref
            .getDownloadURL()
            .then(photoUrl => {
              this.fireAuth.authState.subscribe(user => {
                resolve({ user, photoURL: photoUrl });
              });
            })
            .catch(error => {
              console.log(error);
            });
        },
      );
    });
  }

  // CREATE =>  POST: add a new user to the server
  createUser(user: User): Observable<User> {
    const httpHeaders = new HttpHeaders();
    httpHeaders.set('Content-Type', 'application/json');
    return this.http.post<User>(API_USERS_URL, user, { headers: httpHeaders });
  }

  // Method from server should return QueryResultsModel(items: any[], totalsCount: number)
  // items => filtered/sorted result
  findUsers(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
    const httpHeaders = new HttpHeaders();
    httpHeaders.set('Content-Type', 'application/json');
    return this.http.post<QueryResultsModel>(API_USERS_URL + '/findUsers', queryParams, { headers: httpHeaders });
  }

  // Permission
  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(API_PERMISSION_URL);
  }

  getRolePermissions(roleId: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(API_PERMISSION_URL + '/getRolePermission?=' + roleId);
  }

  // Roles
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(API_ROLES_URL);
  }

  getRoleById(roleId: number): Observable<Role> {
    return this.http.get<Role>(API_ROLES_URL + `/${roleId}`);
  }

  // CREATE =>  POST: add a new role to the server
  createRole(role: Role): Observable<Role> {
    // Note: Add headers if needed (tokens/bearer)
    const httpHeaders = new HttpHeaders();
    httpHeaders.set('Content-Type', 'application/json');
    return this.http.post<Role>(API_ROLES_URL, role, { headers: httpHeaders });
  }

  // UPDATE => PUT: update the role on the server
  updateRole(role: Role): Observable<any> {
    const httpHeaders = new HttpHeaders();
    httpHeaders.set('Content-Type', 'application/json');
    return this.http.put(API_ROLES_URL, role, { headers: httpHeaders });
  }

  // DELETE => delete the role from the server
  deleteRole(roleId: number): Observable<Role> {
    const url = `${API_ROLES_URL}/${roleId}`;
    return this.http.delete<Role>(url);
  }

  // Check Role Before deletion
  isRoleAssignedToUsers(roleId: number): Observable<boolean> {
    return this.http.get<boolean>(API_ROLES_URL + '/checkIsRollAssignedToUser?roleId=' + roleId);
  }

  findRoles(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
    // This code imitates server calls
    const httpHeaders = new HttpHeaders();
    httpHeaders.set('Content-Type', 'application/json');
    return this.http.post<QueryResultsModel>(API_ROLES_URL + '/findRoles', queryParams, { headers: httpHeaders });
  }

  /*
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: any) {
    return (error: any): Observable<any> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result);
    };
  }
}
