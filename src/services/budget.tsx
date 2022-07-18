import { useState } from "react";
import { Observable, share, Subscriber } from "rxjs";


export enum BudgetOperationType {
    MONTH, TRIMESTER, SEMESTER, YEAR
}

export interface BudgetOperation {
    name: string;
    value: number;
    type: BudgetOperationType;
}

export interface BudgetCategory {
    name: string;
    operations: Array<any>;
    reserve: number;
}

export interface Budget {
    categories : Array<BudgetCategory>
}

export function budgetOperationTypeToString(operationType : BudgetOperationType) {
    switch(operationType) {
        case BudgetOperationType.MONTH: return "month";
        case BudgetOperationType.TRIMESTER: return "trimester";
        case BudgetOperationType.SEMESTER: return "semester";
        case BudgetOperationType.YEAR: return "year";
        default: return "";
    }
}

export function budgetOperationTypeFromString(operationTypeStr : string) {
    switch(operationTypeStr) {
        case 'month': return BudgetOperationType.MONTH;
        case 'trimester': return BudgetOperationType.TRIMESTER;
        case 'semester': return BudgetOperationType.SEMESTER;
        case 'year': return BudgetOperationType.YEAR;
        default: return BudgetOperationType.MONTH;
    }
}

const bank_budget : Array<BudgetOperation> = [
    {
        "name": "PEL",
        "value": 50,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Livret A",
        "value": 50,
        "type": BudgetOperationType.MONTH
    }
];

const home_budget : Array<BudgetOperation> = [
    {
        "name": "Loyer",
        "value": 645.05,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Charges",
        "value": 350,
        "type": BudgetOperationType.TRIMESTER
    }, {
        "name": "Taxe habitation",
        "value": 735,
        "type": BudgetOperationType.YEAR
    }, {
        "name": "Taxe foncière",
        "value": 752,
        "type": BudgetOperationType.YEAR
    }, {
        "name": "Assurance hab.",
        "value": 29,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Electricite",
        "value": 62.99,
        "type": BudgetOperationType.MONTH
    }
];

const food_budget : Array<BudgetOperation> = [
    {
        "name": "Restaurants",
        "value": 50,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Supermarché",
        "value": 200,
        "type": BudgetOperationType.MONTH
    }
    , {
        "name": "Chat",
        "value": 100,
        "type": BudgetOperationType.TRIMESTER
    }
];

const loisir_budget : Array<BudgetOperation> = [
    {
        "name": "Sorties",
        "value": 50,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Voyages",
        "value": 600,
        "type": BudgetOperationType.YEAR
    }, {
        "name": "Cadeaux",
        "value": 25 * 12,
        "type": BudgetOperationType.YEAR
    }, {
        "name": "Cinema",
        "value": 15,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Jeux Vidéos",
        "value": 30,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Décoration",
        "value": 20,
        "type": BudgetOperationType.MONTH
    }
];

const shopping_budget : Array<BudgetOperation> = [
    {
        "name": "Vêtement",
        "value": 30,
        "type": BudgetOperationType.TRIMESTER
    }, {
        "name": "Livres",
        "value": 5 * 12,
        "type": BudgetOperationType.YEAR
    }, {
        "name": "Produits entretiens",
        "value": 20,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Imprévus",
        "value": 30,
        "type": BudgetOperationType.MONTH
    }
];

const transport_budget : Array<BudgetOperation> = [
    {
        "name": "Essence",
        "value": 80,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Assurance",
        "value": 894.28,
        "type": BudgetOperationType.YEAR
    }, {
        "name": "Autoroute",
        "value": 15,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Transports",
        "value": 5,
        "type": BudgetOperationType.MONTH
    }
];

const health_budget : Array<BudgetOperation> = [
    {
        "name": "Divers",
        "value": 100,
        "type": BudgetOperationType.YEAR
    }
];

const communication_budget : Array<BudgetOperation> = [
    {
        "name": "Internet",
        "value": 38.99,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Licences",
        "value": 15,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Dons",
        "value": 15,
        "type": BudgetOperationType.MONTH
    }
];

let internal_budget : Budget = {
    categories: [
        {
            name: "Banque",
            operations: bank_budget,
            reserve: 0
        }, {
            name: "Logement",
            operations: home_budget,
            reserve: 300
        }, {
            name: "Alimentation",
            operations: food_budget,
            reserve: 0
        }, {
            name: "Loisirs",
            operations: loisir_budget,
            reserve: 0
        }, {
            name: "Achat & Shopping",
            operations: shopping_budget,
            reserve: 30
        }, {
            name: "Transport",
            operations: transport_budget,
            reserve: 0
        }, {
            name: "Santé",
            operations: health_budget,
            reserve: 0
        }, {
            name: "Téléphonie & Abonnements",
            operations: communication_budget,
            reserve: 0
        }
    ]
};

export function loadBudget() : Budget {
    // console.log('loadBudget');
    return internal_budget;
}

export function saveBudget(budget : Budget ) {
    console.log('saveBudget : ', budget.categories[0]);
    internal_budget = budget
}


let bugetChangeObserver : Subscriber<Budget>;

let bugetChangeObservable : Observable<Budget>;

function createObservableBudget() {

    bugetChangeObservable = new Observable<Budget>(observer => {
        bugetChangeObserver = observer;

        observer.next( loadBudget() );

    }).pipe(
        share()
    );
    return bugetChangeObservable;
}

export function subscribeBudget() {
    return bugetChangeObservable ? bugetChangeObservable : createObservableBudget();
}

export function saveBudgetCategory(bugetCategory : BudgetCategory) {



}





export function useBudget() {

    const [budget, setBudget] = useState( loadBudget() );

    const saveBudgetList = (newBudget : Budget ) => {
        setBudget(newBudget);
        saveBudgetList(newBudget);
        console.log('new newBudgetList : ', newBudget);
    };


    return [budget, saveBudgetList];
}

export function budgetPerYear(operations: Array<BudgetOperation> ) {

    if( !operations ) {
      return 0;
    }
  
    let result = 0;
  
    operations.forEach(item => {
      switch(item.type) {
        case BudgetOperationType.MONTH: {
          result += item.value * 12;
          break;
        }
        case BudgetOperationType.TRIMESTER: {
          result += item.value * 4;
          break;
        }
        case BudgetOperationType.SEMESTER: {
          result += item.value * 2;
          break;
        }
        case BudgetOperationType.YEAR: {
          result += item.value;
          break;
        }
      }
    });
  
    return result;
}