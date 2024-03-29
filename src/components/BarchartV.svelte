<script>
  import { createEventDispatcher } from 'svelte';
  import { scaleLinear } from 'd3-scale';
  import * as _ from 'lamb';
  import { arrayMaxBy } from '@svizzle/utils';
  import { makeStyle } from '@svizzle/dom';

  const dispatch = createEventDispatcher();
  const maxByValue = arrayMaxBy('value');

  export let focusedKey;
  export let interactive = false;
  export let items;
  export let keyToColor;
  export let keyToLabel;
  export let labels;
  export let title;

  let width;

  $: max = maxByValue(items);
  $: scale = scaleLinear().domain([0, max]).range([0, 100]);
  $: bars = items.map(item => ({
    ...item,
    label: labels
      ? labels[item.key]
      : (keyToLabel ? keyToLabel(item.key) : item.key),
    barStyle: makeStyle({
      'background-color': keyToColor ? keyToColor[item.key] : undefined,
      width: `${scale(item.value)}%`
    }),
  }));
</script>

<div class="container">
  {#if title}
  <header>
    <h3>{title}</h3>
  </header>
  {/if}
  <main>
    {#each bars as {barStyle, key, label, value} (key)}
    <div
      class="item"
      class:clickable="{interactive}"
      class:focused="{key === focusedKey}"
      on:click="{ () => { interactive && dispatch('clicked', {id: key}) } }"
      on:mouseenter="{ () => interactive && dispatch('entered', {id: key}) }"
      on:mouseleave="{ () => interactive && dispatch('exited', {id: key}) }"
    >
      <div class="labels">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div class="bar" style="{barStyle}"></div>
    </div>
    {/each}
  </main>
</div>

<style lang="less">
  .container {
    @header-height: 2em;

    width: 100%;
    height: 100%;
    padding: 10px; /* FIXME use a variable to align with other content */

    header {
      width: 100%;
      height: @header-height;

      display: flex;
      align-items: center;
    }

    main {
      width: 100%;
      height: calc(100% - @header-height);
      max-height: calc(100% - @header-height);
      overflow-y: auto;
      padding-right: 5px;

      .item {
        padding: 0.5em 0;

        &:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }
        &.focused {
          background-color: rgba(0, 0, 0, 0.05);
        }
        &.clickable {
          cursor: pointer;
        }

        .labels {
          line-height: 1em;
          padding: 0;
          margin: 0;
          color: grey;
          font-size: 0.9em;
          padding-bottom: 0.15em;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .bar {
          height: 4px;
          background-color: black;
        }
      }
    }
  }
</style>
