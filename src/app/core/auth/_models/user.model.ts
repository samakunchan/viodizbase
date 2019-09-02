import { BaseModel } from '../../_base/crud';
import { Address } from './address.model';
import { SocialNetworks } from './social-networks.model';

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
    this.address.clear();
    this.socialNetworks = new SocialNetworks();
    this.socialNetworks.clear();
  }
}

// A effacer, puisque je vais me contenter de juste savoir si la connexion est réussi.
export class UserViodiz extends BaseModel {
  admin?: boolean;
  aud?: string;
  auth_time?: number;
  email: string;
  email_verified?: boolean;
  exp?: number;
  iat?: number;
  iss?: string;
  name: string;
  picture?: string;
  sub?: string;
  uid?: string;
  user_id?: string;
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
  metadata?: {
    a: string;
    b: string;
    creationTime: string;
    lastSignInTime: string;
  };

  clear?(): void {
    this.uid = undefined;
    this.displayName = '';
    this.password = '';
    this.email = '';
    this.photoUrl = '';
    this.fullname = '';
    this.occupation = '';
    this.companyName = '';
    this.metadata = {
      a: '',
      b: '',
      creationTime: '',
      lastSignInTime: '',
    };
    this.address = new Address();
    this.address.clear();
    this.socialNetworks = new SocialNetworks();
    this.socialNetworks.clear();
  }
}

export class Users implements UserViodizRegister {
  constructor(
    public uid: string,
    public displayName?: string,
    public email?: string,
    public emailVerified?: boolean,
    public password?: string,
    public photoURL?: string,
    public fullname?: string,
    public occupation?: string,
    public companyName?: string,
    public address?: Address,
    public socialNetworks?: SocialNetworks,
    public metadata?: {
      a: string;
      b: string;
      creationTime: string;
      lastSignInTime: string;
    },
  ) {}
}
