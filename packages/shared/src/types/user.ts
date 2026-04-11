export interface User {
  id: string;
  cognitoSub: string;
  phone: string;
  displayName: string;
  profilePhotoKey?: string;
  dateOfBirth?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
}

export interface UserProfile {
  displayName: string;
  profilePhotoKey?: string;
  dateOfBirth?: string;
}
