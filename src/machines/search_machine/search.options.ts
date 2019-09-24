import { get } from 'svelte/store';
//@ts-ignore
import { goto } from '@sapper/app';
import * as _ from 'lamb';
import { sendParent, Machine } from 'xstate';
import { mergeObj } from '@svizzle/utils';

import { version } from '../../../package.json';
import { query } from '../../actions/queryApi';
import { removeEmpty } from '../../util/object-object';
import { makeSelectionFilter } from '../../util/object';
import { makeRouteUrl } from '../../util/url/utils';
import {
  uiQueryToUrlString,
  selectionToUrlString,
} from '../../util/url/builder';

export const search_options: any = {
  actions: {
    sharePending: sendParent('PENDING'),
    shareSuccess: sendParent('SUCCESS'),
    shareError: sendParent('ERROR'),
    shareMatching: sendParent('MATCHING'),
    shareDirty: sendParent('DIRTY'),
    updateData: (
      { screenStore, queryObj, currentTab, routeStore, restore },
      { data: { id, results } }
    ) => {
      const screen = get(screenStore);

      if (!screen.hasOwnProperty(id)) {
        return;
      }

      const responseTab = screen[id];
      const responseTabQueryObject = get(queryObj)[id];
      const tabId: number = get(currentTab);

      if (tabId === id && !restore) {
        const currentQuery = screen[tabId];
        const urlQuery = {
          v: version,
          q: uiQueryToUrlString(currentQuery.uiQuery),
          s: selectionToUrlString(removeEmpty(currentQuery.selections)),
          i: currentQuery.index.toLowerCase(),
          o: currentQuery.logic,
        };
        goto(makeRouteUrl(get(routeStore), urlQuery));
      }

      const newData = Object.values(results.data)[0];
      const filter = makeSelectionFilter(responseTab.selections);
      const selected = filter(newData);

      screenStore.update(
        _.updatePath(
          id,
          mergeObj({
            results: {
              data: newData,
              queryObj: responseTabQueryObject,
              prevQuery: responseTab.uiQuery,
              lastIndex: responseTab.index,
              lastLogic: responseTab.logic,
            },
            selected,
          })
        )
      );
    },
  },
  services: {
    apiRequest: (ctx, { tabId, restore, fromUrl }) => {
      const currentQuery = get(ctx.queryObj)[tabId];
      ctx.restore = restore;

      return query(
        currentQuery.query,
        currentQuery.index,
        currentQuery.logic,
        tabId,
      );
    },
  },
};
