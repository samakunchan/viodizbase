import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { User, Users, UserViodiz, UserViodizRegister } from '../../../../core/auth/_models/user.model';
import { select, Store } from '@ngrx/store';
import { Address, AuthService, currentUser, CurrentUserUpdate, SocialNetworks } from '../../../../core/auth';
import { AppState } from '../../../../core/reducers';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Update } from '@ngrx/entity';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'kt-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss'],
})
export class PersonalInformationComponent implements OnInit, OnDestroy {
  user$: Observable<Users>;
  user: Users;
  fileUrl;
  personnalInformationForm: FormGroup;
  private unsubscribe: Subject<any>;
  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
    private fireAuth: AngularFireAuth,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.user$ = this.store.pipe(select(currentUser));
    this.initForm();
  }

  initForm() {
    this.personnalInformationForm = this.formBuilder.group({
      avatar: ['', Validators.minLength(10)],
      firstname: ['', Validators.minLength(3)],
      lastname: ['', Validators.minLength(3)],
      company: ['', Validators.minLength(3)],
    });
  }

  detectFiles(event) {
    this.onUpload(event.target.files[0]);
  }
  onUpload(file: File) {
    this.authService.uploadFile(file, 'profil').then(result => {
      const user = new Users('', '', '', false, '', '', '', '', '', new Address(), new SocialNetworks());
      user.uid = result.user.uid;
      user.displayName = result.user.displayName;
      user.email = result.user.email;
      user.emailVerified = result.user.emailVerified;
      user.photoURL = result.photoURL;
      this.store.dispatch(new CurrentUserUpdate({ user }));
    });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // this.unsubscribe.next();
    // this.unsubscribe.complete();
  }
}
