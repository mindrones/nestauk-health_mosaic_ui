<script>
  import { onMount, tick, getContext } from 'svelte';
  import { schemeSet3 } from 'd3-scale-chromatic';
  import * as _ from 'lamb';
  import { stores } from '@sapper/app';

  import { countries } from '../../../../data/geo/iso_a2_to_name_by_type.json';
  import BarchartV from '../../../components/BarchartV.svelte';
  import Fallback from '../../../components/Fallback.svelte';
  import { WorldMapWithHistogramScaleHTML } from '../../../components/WorldMapWithHistogramScale';

  import { screenStore, currentTab } from '../../../stores/search.ts';
  import { countByCountryIdAsKeyValue } from '../../../util/domain';
  import { getKey, getValue } from '../../../util/object.any';
  import { SEARCH } from '../_layout.svelte';

  const { select } = getContext(SEARCH);

  export let isDirty;

  $: store = $screenStore[$currentTab];
  $: items = store.results.data;
  $: itemsByCountryId = countByCountryIdAsKeyValue(items); // {key: country_id, value: number}[]
  $: selections = store.selections;
  $: selectedCountries = (selections.country_id && selections.country_id.value) || [];
  $: selectedItems = store.selected;
  $: selectedItemsByCountryId = countByCountryIdAsKeyValue(selectedItems); // {key: country_id, value: number}[]
  $: bounds = selections.location && selections.location.value;

  // TODO utils?
  const updateSelections = ({ detail: selection }) =>
    select( selection, $currentTab );

  const deselectCountries = () => select(
    { key: 'country_id', value: undefined },
    $currentTab
  );
</script>

<div
  class="VolumeGeo"
  class:dirty="{isDirty}"
>
  <div class="col col1">
    <WorldMapWithHistogramScaleHTML
      colors={schemeSet3}
      items={itemsByCountryId}
      keyAccessor="{getKey}"
      geoMask="{bounds}"
      on:selected="{updateSelections}"
      on:deselectAll="{deselectCountries}"
      selectedKeys="{selectedCountries}"
      title="Amount by country"
      valueAccessor="{getValue}"
    />
  </div>
  <div class="col col2">
    <BarchartV
      title="Amount by country"
      items={selectedItemsByCountryId}
      labels={countries}
    />
    {#if !selectedItemsByCountryId.length}
    <div class="col overlay">
      <Fallback message="No results" />
    </div>
    {/if}
  </div>
</div>

<style lang="less">
  .VolumeGeo {
    height: 100%;
    width: 100%;
    padding: var(--size-global-padding);

    flex: 1;
    height: 100%;
    max-height: 100%;

    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: 100%;

    .col {
      height: 100%;
      max-height: 100%;

      &.col1 {
        grid-column: 1 / span 10;
      }
      &.col2 {
        grid-column: 11 / span 2;
        position: relative;

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          pointer-events: none;
        }
      }
    }

    &.dirty {
      /* use to disable events or so */
    }
  }
</style>
