// The individual search terms
export interface UITerm {
  term: string;
  status: 'and' | 'not';
}

// The status of the labels
export interface UIField {
  field: string;
  status: 'default' | 'included' | 'excluded';
  options: boolean;
  disabled: boolean;
}

// The UI query object
export interface UIQuery {
  terms: UITerm[];
  fields: {
    subject: UIField[];
    content: UIField[];
  };
  disabled: boolean;
  options: boolean;
  selected: boolean;
}

// The ES 'exists' schema
interface Exists {
  exists: {
    field: string;
  };
}

interface ExistsBool {
  bool: { must: [Exists] };
}

// The ES query object
export interface QueryObject {
  query: {
    bool: {
      must: [
        { query_string: { query: string } },
        { bool: { should: [ExistsBool] } }
      ];
    };
  };
  size: number;
}

interface Results {
  data: any[];
  queryObj: any[];
}

interface Selection {
  type: string;
  value: any[];
}

interface Selections {
  [x: string]: Selection;
}

// An individual tab
export interface Tab {
  index: string;
  name: string;
  results: Results;
  route: string;
  selected: any[];
  selections: Selections;
  uiQuery: UIQuery[];
  logic: 'AND' | 'OR';
}

// The whole shebang
export interface Store {
  [x: string]: Tab;
}
