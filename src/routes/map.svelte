<script>
  import { Mapbox, Editor, Controls, Layer, Source} from '../components/Map';
  import { MAPBOXGL_STYLEURL, MAPBOXGL_ACCESSTOKEN, testLayer, testSource } from '../config.js';

  import { memoMachineConfig, memoMachineOptions } from '../machines/memo.ts';
  import { createBoundsStore, createMemoStore } from '../stores'
  import { createMachina } from '../util/xstateHelper.ts';
  import { onMount, tick } from 'svelte';

  let editState;

  $: {
    if ($memoMachine.matches('idle') || $memoMachine.matches('transforming')) {
      editState = 'unselected';
    }

    if ($memoMachine.matches('pinned')) {
      editState = 'selected';
    }

    if ($memoMachine.matches('editing')) {
      editState = 'editing';
    }
  }

  const initialBounds = [
    [-122.64854939024758, 37.47760138694859],
    [-121.8608088493005, 38.104949573347426]
  ];

  const { machine: memoMachine, contextStores: { bounds, memo } } = createMachina(
    memoMachineConfig, memoMachineOptions, {
      bounds: createBoundsStore(initialBounds),
      memo: createMemoStore()
    }
  );

  let currentNoteValue = {title:'', description: ''};

  function syncLocalNoteValue() {
    if ($memo.currentPin === false) return;

    currentNoteValue.title = $memo.pins[$memo.currentPin].title
    currentNoteValue.description = $memo.pins[$memo.currentPin].description
  }

  function savePin() {
    memoMachine.send({type: 'UPDATEPIN', updates: {...currentNoteValue} });
  }

  function deletePin({detail}) {
    memoMachine.send({type: 'DELETEPIN'})
  }

  function editPin() {
    memoMachine.send({type: 'EDITPIN'});
  }

  async function addPin() {
    currentNoteValue = {title:'', description: ''};
    memoMachine.send({type: 'PIN' });

    await tick();
  }

  function selectPin({detail: {id }}) {
    memoMachine.send({type: 'SELECTPIN', id});
    syncLocalNoteValue();
  }

  function discardEdit() {
    syncLocalNoteValue();
    memoMachine.send({type: 'DISCARDEDIT'});
  }

  const txstart = () => memoMachine.send('TXSTART');
  const txend = ({detail}) => memoMachine.send({type:'TXEND', bounds:detail});

  onMount(() => {
    syncLocalNoteValue();
  })
</script>

<div class="container">
  <Mapbox
    bounds="{$bounds}"
    apiKey="{MAPBOXGL_ACCESSTOKEN}"
    styleURL="{MAPBOXGL_STYLEURL}"
    on:txstart="{txstart}"
    on:txend="{txend}"
  >
    <Source source="{testSource}" sourceId="test">
      <Layer layer="{testLayer}"/>
    </Source>

  </Mapbox>

  {#if $memoMachine.matches('editing') || $memoMachine.matches('pinned')}
    <Editor
      editing="{$memoMachine.matches('editing')}"
      on:change="{({detail}) => currentNoteValue = detail }"
      title="{currentNoteValue.title}"
      description="{currentNoteValue.description}"
    />
  {/if}

  <Controls
    on:add="{addPin}"
    on:select="{selectPin}"
    on:save="{savePin}"
    on:discard="{discardEdit}"
    on:delete="{deletePin}"
    on:edit="{editPin}"
    state="{editState}"
    pins="{$memo.pins}"
    currentPin="{$memo.currentPin}"
  />


</div>

<style>
  .container {
    height: 100vh;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
</style>
