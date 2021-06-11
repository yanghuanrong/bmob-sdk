import requst from './request';
import { QUERY } from './api';

class Query {
  public tableName: string;
  constructor(tableName: string) {
    this.tableName = `${QUERY}${tableName}`;
  }
  get(id: string) {
    const route = `${this.tableName}/${id}`;
    return requst(route, 'GET');
  }
}
export default Query;
