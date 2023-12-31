export interface JwtAuthPayload {
  login: string;
  sub: string;
  iss: string;
  iat?: number;
  exp?: number;
}

export interface OtpPayload {
  sub: string;
  iss: string;
  iat?: number;
  exp?: number;
}
