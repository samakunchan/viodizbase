import { CoursesFollowed } from './courses.model';
import { QCMState } from './qcm.model';
import { Certificat } from './certificat.model';

export class ViodizStudent {
  constructor(
    public uid: string,
    public isStudent: boolean,
    public coursesFollowed: CoursesFollowed[],
    public qcmState: QCMState,
    public idGroupe: number,
    public certificat?: Certificat,
  ) {}
}
