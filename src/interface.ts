export interface coreDTO {
  secretKey: string;
  securityCode: string;
  masterKey: undefined | string;
}

export interface ServeDTO {
  baseURL: string;
  headers: object;
}
