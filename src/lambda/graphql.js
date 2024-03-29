/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-prototype-builtins */

const { ApolloServer, gql } = require('apollo-server-lambda');
const { RESTDataSource } = require('apollo-datasource-rest');

import {
  BASE_URL,
  NIH_index,
  CB_index,
  MU_index,
  HS_index,
} from '../../src/config';
import { mappedQueryBuilder } from '../util/graphql-fields';

// queryObject -> queryMapper -> mappedQueryBuilder
const sources = [
  // body
  'textBody_abstract_project',
  'textBody_descriptive_organisation',
  'textBody_descriptive_project',

  // city
  'placeName_city_group',
  'placeName_city_organisation',

  // continent_id
  'id_continent_group',
  'id_continent_organisation',
  'id_of_continent',

  // cost_ref
  'cost_of_funding',
  'cost_total_project',

  // countries_ids
  'terms_of_countryTags',

  // country_id
  'id_iso2_country',

  // end
  'date_death_organisation',
  'date_end_project',

  // funders
  'terms_of_funders',

  // funding
  'json_funding_project',

  // is_health_related
  'booleanFlag_health_organisation',

  // location
  'coordinate_of_city',
  'coordinate_of_group',
  'coordinate_of_organisation',

  // name
  'name_of_group',
  'name_of_organisation',
  'title_of_organisation',

  // novelty
  'rank_rhodonite_abstract',
  'rank_rhodonite_group',
  'rank_rhodonite_organisation',

  // region
  'placeName_region_organisation',

  // sdg_labels
  '_terms_sdg_summary',
  '_terms_sdg_description',
  'terms_sdg_abstract',

  // start
  'date_birth_organisation',
  'date_start_group',
  'date_start_project',

  // state_id
  'id_state_organisation',

  // summary
  'textBody_abstract_project',
  'textBody_summary_organisation',

  // terms
  'terms_mesh_abstract',
  'terms_mesh_description',
  'terms_mesh_group',

  // title
  'title_of_project',

  // type
  'type_of_entity',

  // url
  'url_crunchBase_organisation',
  'url_of_group',
  'url_of_organisation',
];

// eslint-disable-next-line no-undef
const existsQuery = REPLACE_ES_EXISTS_QUERY;
// eslint-disable-next-line no-undef
const itemResolvers = REPLACE_ES_GQL_FIELDS;
// eslint-disable-next-line no-undef
const size = REPLACE_ES_QUERY_SIZE;

class HealthScanner extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = BASE_URL;
  }

  async getCB(queryObject, logic) {
    const queryString = mappedQueryBuilder(queryObject, logic);

    return this.post(`/${CB_index}/_search`, {
      query: {
        bool: {
          must: [{ query_string: { query: queryString } }, existsQuery],
        },
      },
      size,
      // _source: sources,
    });
  }

  async getMU(queryObject, logic) {
    const queryString = mappedQueryBuilder(queryObject, logic);

    return this.post(`/${MU_index}/_search`, {
      query: {
        bool: {
          must: [{ query_string: { query: queryString } }, existsQuery],
        },
      },
      size,
      // _source: sources,
    });
  }

  async getNIH(queryObject, logic) {
    const queryString = mappedQueryBuilder(queryObject, logic);

    return this.post(`/${NIH_index}/_search`, {
      query: {
        bool: {
          must: [{ query_string: { query: queryString } }, existsQuery],
        },
      },
      size,
      // _source: sources,
    });
  }

  async getAll(queryObject, logic) {
    const queryString = mappedQueryBuilder(queryObject, logic);

    return this.post(`/${HS_index}/_search`, {
      query: {
        bool: {
          must: [{ query_string: { query: queryString } }, existsQuery],
        },
      },
      size,
      // _source: sources,
    });
  }
}

const typeDefs = gql`
  type Geopoint {
    lat: Float
    lon: Float
  }
  type FundingRound {
    cost_ref: Float
    end_date: String
    start_date: String
    year: String
  }
  type Item {
    body: String
    city: String
    continent: String
    continent_id: String
    cost_ref: Float
    countries_ids: [String]
    country: String
    country_id: String
    end: String
    funders: [String]
    funding: [FundingRound]
    id: String
    id_source: String
    is_health_related: Boolean
    location: Geopoint
    name: String
    novelty: Float
    region: String
    score: Float
    sdg_labels: [String]
    start: String
    state: String
    state_id: String
    summary: String
    terms: [String]
    title: String
    type: String
    url: String
    url_source: String
  }
  input ESQuery {
    title: String
    status: String
  }
  input ESValue {
    query: String
    status: String
  }
  input QueryObject {
    fields: [ESQuery]
    values: [ESValue]
  }
  type Query {
    CB(query: [QueryObject], logic: String): [Item]
    MU(query: [QueryObject], logic: String): [Item]
    NIH(query: [QueryObject], logic: String): [Item]
    All(query: [QueryObject], logic: String): [Item]
  }
`;

const compare = (a, b) =>
  a
    .trim()
    .toLowerCase()
    .localeCompare(b.trim().toLowerCase());

const resolvers = {
  Query: {
    CB: async (_source, { query, logic }, { dataSources }) => {
      const data = await dataSources.HealthScanner.getCB(query, logic);

      return data.hits.hits;
    },
    MU: async (_source, { query, logic }, { dataSources }) => {
      const data = await dataSources.HealthScanner.getMU(query, logic);
      return data.hits.hits;
    },
    NIH: async (_source, { query, logic }, { dataSources }) => {
      const data = await dataSources.HealthScanner.getNIH(query, logic);
      return data.hits.hits;
    },
    All: async (_source, { query, logic }, { dataSources }) => {
      const data = await dataSources.HealthScanner.getAll(query, logic);
      return data.hits.hits;
    },
  },
  Item: {
    ...itemResolvers,
    countries_ids: parent => {
      if (parent._source.hasOwnProperty('terms_of_countryTags'))
        return (
          parent._source.terms_of_countryTags &&
          parent._source.terms_of_countryTags.sort(compare)
        );
    },
    funders: parent => {
      if (parent._source.hasOwnProperty('terms_of_funders'))
        return (
          parent._source.terms_of_funders &&
          parent._source.terms_of_funders.sort(compare)
        );
    },
    sdg_labels: parent => {
      if (parent._source.hasOwnProperty('_terms_sdg_summary'))
        return (
          parent._source._terms_sdg_summary &&
          parent._source._terms_sdg_summary.sort(compare)
        );
      if (parent._source.hasOwnProperty('_terms_sdg_description'))
        return (
          parent._source._terms_sdg_description &&
          parent._source._terms_sdg_description.sort(compare)
        );
      if (parent._source.hasOwnProperty('terms_sdg_abstract'))
        return (
          parent._source.terms_sdg_abstract &&
          parent._source.terms_sdg_abstract.sort(compare)
        );
    },
    terms: parent => {
      if (parent._source.hasOwnProperty('terms_mesh_description'))
        return (
          parent._source.terms_mesh_description &&
          parent._source.terms_mesh_description.sort(compare)
        );
      if (parent._source.hasOwnProperty('terms_mesh_group'))
        return (
          parent._source.terms_mesh_group &&
          parent._source.terms_mesh_group.sort(compare)
        );
      if (parent._source.hasOwnProperty('terms_mesh_abstract'))
        return (
          parent._source.terms_mesh_abstract &&
          parent._source.terms_mesh_abstract.sort(compare)
        );
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      HealthScanner: new HealthScanner(),
    };
  },
});

exports.handler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
    allowedHeaders: ['Content-Type,Origin,Accept'],
  },
});
