<script>
import { createEventDispatcher } from 'svelte';
import { capitalise } from '../util/string'

export let options;
export let index;
const dispatch = createEventDispatcher();
</script>

<div >
  <select
    bind:value={index}
    on:change={() =>
    dispatch('change', index.toLowerCase())}
  >
    {#each options as item}
      <option value="{item}">{capitalise(item)}</option>
    {/each}
  </select>
</div>

<style lang="less">
  div {
    margin: 0px 15px 0 0;
    position: relative;

    &::after {
      content: ' ';
      width: 34px;
      height: 90%;
      right: 1px;
      top: 1px;
      background: #fff url('../arrow.svg') no-repeat center/60%;
      position: absolute;
      z-index: 2;
      pointer-events: none;
    }
  }

  select {
    height: 100%;
    padding: 0 35px 0 5px;
    border-radius: 2px;
    border: 1px solid #ddd;
    font-size: 16px;
    color: #333;
    position: relative;
    -webkit-appearance: none;
    appearance: none;
    background: #fff;
    outline: none;

    &:focus {
      border-color: #555;
    }

    &:-moz-focusring {
      color: transparent;
      text-shadow: 0 0 0 #333;
    }

    option:not(:checked) {
      color: #333;
    }
  }
</style>
