import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfilComponent } from './profil.component';
import { RouterModule, Routes } from '@angular/router';
import { PersonalInformationComponent } from './personal-information/personal-information.component';
import { CoreModule } from '../../../core/core.module';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: ProfilComponent,
    children: [
      {
        path: '',
        redirectTo: 'personnal-information',
        pathMatch: 'full',
      },
      {
        path: 'personnal-information',
        component: PersonalInformationComponent,
      },
    ],
  },
];
@NgModule({
  declarations: [ProfilComponent, PersonalInformationComponent],
  imports: [CommonModule, RouterModule.forChild(routes), CoreModule, NgbPopoverModule, ReactiveFormsModule, TranslateModule],
})
export class ProfilModule {}
