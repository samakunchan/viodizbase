import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { User, Users } from '../../../../core/auth/_models/user.model';
import { select, Store } from '@ngrx/store';
import {
  AuthService,
  currentUser,
  CurrentUserUpdateAddInfos,
  CurrentUserUpdatePhoto,
} from '../../../../core/auth';
import { AppState } from '../../../../core/reducers';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Update } from '@ngrx/entity';
import { takeUntil, tap } from 'rxjs/operators';

import * as toastr from '../../../../../assets/js/toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'kt-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss'],
})
export class PersonalInformationComponent implements OnInit {
  user$: Observable<Users>;
  personnalInformationForm: FormGroup;

  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
    private fireAuth: AngularFireAuth,
    private formBuilder: FormBuilder,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.user$ = this.store.pipe(select(currentUser));
    this.initForm();
    toastr.options = {
      closeButton: true,
      debug: false,
      newestOnTop: false,
      progressBar: false,
      positionClass: 'toast-top-right',
      preventDuplicates: false,
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

  initForm() {
    this.personnalInformationForm = this.formBuilder.group({
      avatar: ['', Validators.minLength(10)],
      firstname: ['', Validators.minLength(3)],
      lastname: ['', Validators.minLength(3)],
      addressLine: ['', Validators.minLength(3)],
      city: ['', Validators.minLength(3)],
      postCode: ['', Validators.minLength(3)],
      companyName: ['', Validators.minLength(3)],
      occupation: ['', Validators.minLength(3)],
      phone: ['', Validators.minLength(3)],
      website: ['', Validators.minLength(3)],
      linkedIn: ['', Validators.minLength(3)],
      facebook: ['', Validators.minLength(3)],
      twitter: ['', Validators.minLength(3)],
      instagram: ['', Validators.minLength(3)],
    });
  }

  onSendMailVerification() {
    this.authService.sendMailVerification().then(() => {
      toastr.success('Email envoyer');
    }).catch(err => {console.log(err); toastr.warning('Problème lors de l\'envoie de l\'email.'); });
  }

  detectFiles(event, email) {
    this.onUpload(event.target.files[0], email);
  }
  onUpload(file: File, email) {
    this.authService.uploadFile(file, 'profil', email).then((user: Users) => {
      this.store.dispatch(new CurrentUserUpdatePhoto({ user }));
    });
  }

  onSubmit() {
    const firstname = this.personnalInformationForm.value.firstname;
    const lastname = this.personnalInformationForm.value.lastname;
    const addressLine = this.personnalInformationForm.value.addressLine;
    const city = this.personnalInformationForm.value.city;
    const postCode = this.personnalInformationForm.value.postCode;
    const companyName = this.personnalInformationForm.value.companyName;
    const occupation = this.personnalInformationForm.value.occupation;
    const phone = this.personnalInformationForm.value.phone;
    const website = this.personnalInformationForm.value.website;
    const linkedIn = this.personnalInformationForm.value.linkedIn;
    const facebook = this.personnalInformationForm.value.facebook;
    const twitter = this.personnalInformationForm.value.twitter;
    const instagram = this.personnalInformationForm.value.instagram;

    this.authService
      .buildUserForUpdate({
        firstname,
        lastname,
        addressLine,
        city,
        postCode,
        companyName,
        occupation,
        phone,
        website,
        linkedIn,
        facebook,
        twitter,
        instagram,
      })
      .then((user: Users) => {
        this.store.dispatch(new CurrentUserUpdateAddInfos({ user }));
      })
      .catch(err => {console.log(err); toastr.warning(this.translate.instant('NOTIFICATIONS.FAILURE'), 'Profil'); });
  }
}
