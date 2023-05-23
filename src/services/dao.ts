
export enum DaoType {
    BANK_ACCOUNT = "BankAccountDao",
    REVENUE = "RevenueDao",
    SETTINGS = "SettingsDao",
    CATEGORY = "CategoryDao",
    ENVELOPE = "EnvelopeDao",
    TRANSACTION = "TransactionDao",
    TRANSACTION_MOVEMENT = "TransactionMovementDao",
    TRANSACTION_ACCOUNT = "TransactionAccountDao",

    /** @deprecated */
    ENVELOPE_TRANSACTION = "EnvelopeTransactionDao",
    /** @deprecated */
    ACCOUNT_TRANSACTION = "AccountTransactionDao"
  }

export abstract class DAO<T> {

    abstract load() : Promise<T[]>;

    abstract find(selector:any) : Promise<T|null>;
  
    abstract add(entry : T) : Promise<string|number|undefined>;
  
    abstract addAll(entry : T[]) : Promise<(string|number|undefined)[]>;
  
    abstract update(entry : T) : Promise<void>;
  
    abstract remove(entry : T) : Promise<void>;
  
}

export class InvalidDao<T> extends DAO<T> {

    private name: string;

    constructor(name: string) {
      super();
      this.name = name;
    }

    private errorResult<U>() : Promise<U> {
      return new Promise((resolve, reject) => {
        reject('Error result. Cause : Invalid DAO ' + this.name);
      });
    }

    public load() : Promise<T[]> {
      return this.errorResult();
    }

    public find(selector:any) : Promise<T|null> {
      return this.errorResult();
    }
  
    public add(entry : T) : Promise<string|number|undefined> {
      return this.errorResult();
    }
  
    public addAll(entry : T[]) : Promise<(string|number|undefined)[]> {
      return this.errorResult();
    }
  
    public update(entry : T) : Promise<void> {
      return this.errorResult();
    }
  
    public remove(entry : T) : Promise<void> {
      return this.errorResult();
    }

}
