import { ViodizStudent } from './viodiz-student.model';

export class ViodizProf {
  constructor(public uid: number, public isProf: boolean, public groupes: Groupes, public score: number) {}
}

export class Groupes {
  constructor(public id: number, public students: ViodizStudent) {}
}
