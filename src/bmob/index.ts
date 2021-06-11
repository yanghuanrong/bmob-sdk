import core from './core';
import Query from './query';

const Bmob = {
  initialize(secretKey: string, securityCode: string, masterKey?: string) {
    core.secretKey = secretKey;
    core.securityCode = securityCode;
    core.masterKey = masterKey;
  },
  Query(tableName: string) {
    return new Query(tableName);
  },
};

export default Bmob;
