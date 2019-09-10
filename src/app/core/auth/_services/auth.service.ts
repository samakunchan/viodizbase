import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  Address,
  Certificat,
  CoursesFollowed,
  Metadata,
  QCMQuestions,
  QCMResponses,
  QCMState,
  SettingCurrentUser,
  Sha256,
  SocialNetworks,
  User,
  UserLoaded,
  ViodizProf,
  ViodizStudent,
} from '..';
import { Permission } from '..';
import { Role } from '..';
import { catchError, finalize, map } from 'rxjs/operators';
import { QueryParamsModel, QueryResultsModel } from '../../_base/crud';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { Users, UserFromCloud } from '../_models/user.model';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';

const API_USERS_URL = 'api/user';
const API_PERMISSION_URL = 'api/permissions';
const API_ROLES_URL = 'api/roles';

@Injectable()
export class AuthService {
  ref;
  path;
  file;

  socialNetworks: SocialNetworks;
  address: Address;
  coursesFollowed: CoursesFollowed;
  qcmState: QCMState;
  certificat: Certificat;
  viodizStudent: ViodizStudent;
  settingsCurrentUser: SettingCurrentUser;

  // https://youtu.be/qWy9ylc3f9U?t=342
  constructor(
    private http: HttpClient,
    private fireAuth: AngularFireAuth,
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    private router: Router,
  ) {
    this.socialNetworks = {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedIn: '',
    };
    this.address = {
      addressLine: '',
      postCode: '',
      city: '',
    };
    this.coursesFollowed = {
      idCourse: 0,
      chaptersTotal: 0,
      chapterComplete: [],
    };
    this.qcmState = {
      id: 0,
      status: false,
      score: 0,
    };
    this.certificat = {
      status: false,
      documentUrl: '',
      expireAt: '',
    };

    this.viodizStudent = {
      uid: '',
      isStudent: false,
      coursesFollowed: [this.coursesFollowed],
      idGroupe: 0,
      qcmState: this.qcmState,
      certificat: this.certificat, // Rajouter les settings pour le language
    };
    this.settingsCurrentUser = {
      language: 'en',
      notificationsState: false,
    };
  }

  // Pour firebase
  login(email: string, password: string): Observable<any> {
    return this.loginObservable(email, password);
  }
  // Pour login firebase
  loginObservable(email, password) {
    return new Observable(observer => {
      this.fireAuth.auth
        .signInWithEmailAndPassword(email, password)
        .then(credential => {
          this.fireAuth.auth.currentUser
            .getIdToken(true)
            .then(idToken => {
              observer.next({ data: credential.user, idToken });
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

  getUserByTokenFromCloud(): Observable<UserFromCloud> {
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
          this.db
            .collection<Users>('Users')
            .doc(result.user.uid)
            .get()
            .subscribe(doc => {
              if (!doc.exists) {
                // Ajout du User dans la collection Users pour les informations additionnels.
                this.db
                  .collection<Users>('Users')
                  .doc(result.user.uid)
                  .set({
                    firstname: '',
                    lastname: '',
                    occupation: '',
                    companyName: '',
                    phone: '',
                    website: '',
                    addressString: JSON.stringify(this.address),
                    socialNetworks: JSON.stringify(this.socialNetworks),
                    studentInfos: JSON.stringify(this.viodizStudent),
                    settingCurrentUser: JSON.stringify(this.settingsCurrentUser),
                  });
              }
            });
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
          this.db
            .collection<Users>('Users')
            .doc(result.user.uid)
            .get()
            .subscribe(doc => {
              if (!doc.exists) {
                // Ajout du User dans la collection Users pour les informations additionnels.
                this.db
                  .collection<Users>('Users')
                  .doc(result.user.uid)
                  .set({
                    firstname: '',
                    lastname: '',
                    occupation: '',
                    companyName: '',
                    phone: '',
                    website: '',
                    addressString: JSON.stringify(this.address),
                    socialNetworks: JSON.stringify(this.socialNetworks),
                    studentInfos: JSON.stringify(this.viodizStudent),
                    settingCurrentUser: JSON.stringify(this.settingsCurrentUser),
                  });
              }
            });

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
          // Update immédiat du profil pour le displayName
          this.fireAuth.auth.currentUser.updateProfile({ displayName: user.username });

          // Ajout du User dans la collection Users pour les informations additionnels.
          this.db
            .collection<any>('Users')
            .doc(result.user.uid)
            .set({
              firstname: '',
              lastname: '',
              occupation: '',
              companyName: '',
              phone: '',
              website: '',
              addressString: JSON.stringify(this.address),
              socialNetworks: JSON.stringify(this.socialNetworks),
              studentInfos: JSON.stringify(this.viodizStudent),
              settingCurrentUser: JSON.stringify(this.settingsCurrentUser), // Mettre ça dans le localStorage/cookie. Je set quand meme,
              // mais au chargement de l'utilisateur je le place dans le localstorage
            });

          // Création du token pour le cloud function afin de gérer la reconnextion.
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

  /**
   * Bien vérifier que les utilisateurs ont bien le nouveau model
   */
  getUser() {
    return new Observable(observer => {
      this.fireAuth.authState.subscribe(
        userCred => {
          if (userCred) {
            const user = new Users('', '', '');
            this.db
              .collection<Users>('Users')
              .doc(userCred.uid)
              .get()
              .subscribe(
                res => {
                  user.uid = userCred.uid;
                  user.displayName = userCred.displayName;
                  user.email = userCred.email;
                  user.emailVerified = userCred.emailVerified;
                  user.photoURL = userCred.photoURL;
                  user.firstname = res.data().firstname;
                  user.lastname = res.data().lastname;
                  user.occupation = res.data().occupation;
                  user.phone = res.data().phone;
                  user.companyName = res.data().companyName;
                  user.address = JSON.parse(res.data().addressString);
                  user.socialNetworks = JSON.parse(res.data().socialNetworks);
                  user.studentInfos = JSON.parse(res.data().studentInfos);
                  user.settingCurrentUser = JSON.parse(res.data().settingCurrentUser); // Mettre ça dans le localStorage/cookie, au
                  // chargement de l'utilisateur je le place dans le localstorage
                  observer.next(user);
                },
                error1 => {
                  observer.error(error1);
                },
              );
          } else {
            observer.error('Missing user');
          }
        },
        error => observer.error(error),
      );
    });
  }

  // Obliger d'envoyer un observble User pour le l'action new UserLoaded()
  updateUserProfilPhoto(_user: Users): Observable<Users> {
    return new Observable<Users>(observer => {
      this.fireAuth.authState.subscribe(
        user => {
          // Faire l'email verified observable
          // Pour la page overview, on met le même single page utilisateur
          // Faire des partials pour le Get Started du dashboard
          // Pour la liste des utilisateurs, il faudrait le charger 1 fois ...
          // ...soit dans l'admin component ensuite la variable global qui contient les données prends le relais
          /// ...soit à voir dans l'appModule une fois et vérifier que c'est le status admin qui charge les données.

          user
            .updateProfile({
              photoURL: _user.photoURL,
            })
            .then(() =>
              observer.next({
                displayName: _user.displayName,
                email: _user.email,
                emailVerified: _user.emailVerified,
                photoURL: _user.photoURL,
                uid: _user.uid,
                metadata: _user.metadata,
                firstname: _user.firstname,
                lastname: _user.lastname,
                occupation: _user.occupation,
                companyName: _user.companyName,
                phone: _user.phone,
                website: _user.website,
                address: _user.address,
                socialNetworks: _user.socialNetworks,
                settingCurrentUser: _user.settingCurrentUser,
                studentInfos: _user.studentInfos,
              }),
            )
            .catch(err => {
              observer.error(err);
            });
        },
        error => observer.error(error),
      );
    });
  }
  uploadFile(file, path, email) {
    return new Promise((resolve, reject) => {
      const photoNameHashed = new Sha256();
      photoNameHashed.hashString(email);
      const upload = firebase
        .storage()
        .ref('/images')
        .child(`users/${path}-${photoNameHashed.result}`)
        .put(file);
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
              this.getUser().subscribe(
                (userData: Users) => {
                  const user = new Users('', '', '');
                  user.uid = userData.uid;
                  user.firstname = userData.firstname;
                  user.lastname = userData.lastname;
                  user.occupation = userData.occupation;
                  user.companyName = userData.companyName;
                  user.phone = userData.phone;
                  user.website = userData.website;
                  user.displayName = userData.displayName;
                  user.email = userData.email;
                  user.emailVerified = userData.emailVerified;
                  user.photoURL = photoUrl;
                  user.address = userData.address;
                  user.socialNetworks = userData.socialNetworks;
                  user.studentInfos = userData.studentInfos;
                  user.settingCurrentUser = userData.settingCurrentUser;
                  user.studentInfos = userData.studentInfos;
                  resolve(user);
                },
                error => reject(error),
              );
            })
            .catch(error => {
              console.log(error);
            });
        },
      );
    });
  }

  updateCurrentUserProfil(_user): Observable<Users> {
    return new Observable<Users>(observer => {
      this.db
        .collection<any>('Users')
        .doc(_user.uid)
        .update({
          firstname: _user.firstname,
          lastname: _user.lastname,
          occupation: _user.occupation,
          companyName: _user.companyName,
          phone: _user.phone,
          website: _user.website,
          addressString: JSON.stringify(_user.address),
          socialNetworks: JSON.stringify(_user.socialNetworks),
        })
        .then(() =>
          observer.next({
            displayName: _user.displayName,
            email: _user.email,
            emailVerified: _user.emailVerified,
            photoURL: _user.photoURL,
            uid: _user.uid,
            metadata: _user.metadata,
            firstname: _user.firstname,
            lastname: _user.lastname,
            occupation: _user.occupation,
            companyName: _user.companyName,
            phone: _user.phone,
            website: _user.website,
            address: _user.address,
            socialNetworks: _user.socialNetworks,
            settingCurrentUser: _user.settingCurrentUser,
            studentInfos: _user.studentInfos,
          }),
        )
        .catch(err => {
          observer.error(err);
        });
    });
  }

  buildUserForUpdate(_user) {
    return new Promise((resolve, reject) => {
      this.getUser().subscribe(
        (userData: Users) => {
          const address = new Address(_user.addressLine, _user.city, _user.postCode);
          const socialNetWorks = new SocialNetworks(_user.linkedIn, _user.facebook, _user.twitter, _user.instagram);
          const user = new Users('', '', '');
          user.uid = userData.uid;
          user.firstname = _user.firstname;
          user.lastname = _user.lastname;
          user.occupation = _user.occupation;
          user.companyName = _user.companyName;
          user.phone = _user.phone;
          user.website = _user.website;
          user.displayName = userData.displayName;
          user.email = userData.email;
          user.emailVerified = userData.emailVerified;
          user.photoURL = userData.photoURL;
          user.address = address;
          user.socialNetworks = socialNetWorks;
          user.settingCurrentUser = userData.settingCurrentUser;
          user.studentInfos = userData.studentInfos;
          resolve(user);
        },
        error => {
          reject(error);
        },
      );
    });
  }

  sendMailVerification() {
    return new Promise((resolve, reject) => {
      this.fireAuth.auth.currentUser.sendEmailVerification()
        .then(() => {
        resolve();
      }).catch(err => reject(err));
    });

  }
  signOut() {
    return this.fireAuth.auth.signOut();
  }
  /*
   * Submit forgot password request
   *
   * @param {string} email
   * @returns {Observable<any>}
   */
  // Authentication/Authorization
  // login(email: string, password: string): Observable<User> {
  //   return this.http.post<User>(API_USERS_URL, { email, password });
  // }
  getUserByToken(): Observable<User> {
    const userToken = localStorage.getItem(environment.authTokenKey);
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('Authorization', 'Bearer ' + userToken);
    return this.http.get<User>(API_USERS_URL, { headers: httpHeaders });
  }

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
