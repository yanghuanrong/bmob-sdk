export interface coreDTO {
  secretKey: string;
  securityCode: string;
  masterKey: undefined | string;
}

export interface ServeDTO {
  baseURL: string;
  headers: object;
}

export interface pointDTO {
  latitude: number;
  longitude: number;
}

export interface reqDTO {
  route: string;
  method: string;
  param?: any;
  data?: any;
}
