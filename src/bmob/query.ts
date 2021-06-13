import request from './request';
import { QUERY } from './api';

class Query {
  public tableName: string;
  public addData: any = {};
  constructor(tableName: string) {
    this.tableName = `${QUERY}${tableName}`;
  }
  get(id: string) {
    const route = `${this.tableName}/${id}`;
    return request(route, 'GET');
  }
  set(key: string, value: string) {
    this.addData[key] = value;
    return this;
  }
  save() {
    const saveData = this.addData;
    const method = 'POST';
    request(`${this.tableName}`, method, saveData);
  }
}
export default Query;
