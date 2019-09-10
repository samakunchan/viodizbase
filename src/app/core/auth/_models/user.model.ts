import { BaseModel } from '../../_base/crud';
import { Address } from './address.model';
import { SocialNetworks } from './social-networks.model';
import { Metadata } from './metadata.model';
import { ViodizStudent } from './viodiz-student.model';
import { ViodizProf } from './viodiz-prof.model';
import { Certificat } from './certificat.model';
import { SettingCurrentUser } from './settingCurrentUser.model';
import { QCMQuestions, QCMResponses, QCMState } from './qcm.model';
import { CoursesFollowed } from './courses.model';

export class User extends BaseModel {
  id?: number;
  username?: string;
  password?: string;
  email: string;
  accessToken?: string;
  refreshToken?: string;
  roles?: number[];
  pic?: string;
  fullname?: string;
  occupation?: string;
  companyName?: string;
  phone?: string;
  address?: Address;
  socialNetworks?: SocialNetworks;

  clear?(): void {
    this.id = undefined;
    this.username = '';
    this.password = '';
    this.email = '';
    this.roles = [];
    this.fullname = '';
    this.accessToken = 'access-token-' + Math.random();
    this.refreshToken = 'access-token-' + Math.random();
    this.pic = './assets/media/user/default.jpg';
    this.occupation = '';
    this.companyName = '';
    this.phone = '';
    this.address = new Address();
    this.socialNetworks = new SocialNetworks();
  }
}

// A effacer, puisque je vais me contenter de juste savoir si la connexion est réussi.
// Attention quand même a vérifer si j'ai toujours beosin de admin = true
export class UserFromCloud extends BaseModel {
  admin?: boolean;
  aud?: string;
  authTime?: number;
  email: string;
  emailVerified?: boolean;
  exp?: number;
  iat?: number;
  iss?: string;
  name: string;
  picture?: string;
  sub?: string;
  uid?: string;
  userId?: string;
}

// Changer le nom de class et mettre un role pour l'admin, modo, premium, dev, user, guest (peut etre)
// La futur vrai class User
export class UserViodizRegister extends BaseModel {
  uid?: string;
  displayName?: string;
  email?: string;
  emailVerified?: boolean;
  password?: string;
  photoUrl?: string;
  fullname?: string;
  occupation?: string;
  companyName?: string;
  address?: Address;
  socialNetworks?: SocialNetworks;
  metadata?: Metadata;

  clear?(): void {
    this.uid = undefined;
    this.displayName = '';
    this.password = '';
    this.email = '';
    this.photoUrl = '';
    this.fullname = '';
    this.occupation = '';
    this.companyName = '';
    this.metadata = new Metadata();
    this.address = new Address();
    this.socialNetworks = new SocialNetworks();
  }
}

export class Users implements UserViodizRegister {
  constructor(
    public uid: string,
    public displayName: string,
    public email: string,
    public emailVerified?: boolean,
    public password?: string,
    public photoURL?: string,
    public firstname?: string,
    public lastname?: string,
    public occupation?: string,
    public companyName?: string,
    public phone?: string,
    public website?: string,
    public address?: Address,
    public socialNetworks?: SocialNetworks,
    public metadata?: Metadata,
    public studentInfos?: ViodizStudent,
    public prof?: ViodizProf,
    public settingCurrentUser?: SettingCurrentUser,
  ) {}
}

// user: Users;
// socialNetWork: SocialNetworks;
// address: Address;
// prof: ViodizProf;
// qcmResponses: QCMResponses[] = [
//   // Essayer de mettre un tableau vide
//   {
//     id: 0,
//     text: 'bleu',
//     correct: false,
//   },
//   {
//     id: 1,
//     text: 'rouge',
//     correct: false,
//   },
//   {
//     id: 2,
//     text: 'blanc',
//     correct: true,
//   },
//   {
//     id: 3,
//     text: 'vert',
//     correct: false,
//   },
// ];
// qcmQuestions: QCMQuestions[] = [
//   {
//     id: 0,
//     title: 'Culture générale',
//     text: 'Quel est le cheval blanc dHenry IV?',
//     idCorrectResponse: 2,
//     qcmResponses: this.qcmResponses,
//   },
// ];
// coursesFollowed: CoursesFollowed = {
//   idCourse: 0,
//   idStudentSubscriber: [0, 1, 5],
//   chaptersTotal: 12,
//   chapterComplete: [0, 1],
//   qcmQuestion: this.qcmQuestions,
// };
//
// qcmState: QCMState = {
//   id: 11,
//   status: false,
//   score: 0,
// };
//
// certificat: Certificat = {
//   status: false,
//   documentUrl: '',
//   expireAt: '',
// };
// viodizStudent: ViodizStudent = {
//   uid: 0,
//   isStudent: false,
//   coursesFollowed: [this.coursesFollowed],
//   idGroupe: 0,
//   qcmState: this.qcmState,
//   certificat: this.certificat, // Rajouter les settings pour le language
// };
