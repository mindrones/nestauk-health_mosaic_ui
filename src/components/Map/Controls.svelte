<script>
  import { createEventDispatcher } from 'svelte';
  import { Pin, Edit, Delete, Save, Undo } from '../Icons';

  export let pins;
  export let currentPin;
  export let state;

  const dispatch = createEventDispatcher();

  function addPin() {
    dispatch('add');
  }

  function selectPin(id) {
    dispatch('select', { id });
  }

  function editCurrentPin() {
    dispatch('edit');
  }

  function deleteCurrentPin() {
    dispatch('delete');
  }

  function savePin() {
    dispatch('save');
  }

  function discardPin() {
    dispatch('discard');
  }
</script>

<div class="controls">
  {#if pins.length}
  <ul>
    {#each pins as {id, title}, index}
    <li
      on:click="{() => selectPin(index)}"
      class:selected="{currentPin === index}"
    >
      {title.length ? title : index}
    </li>
    {/each}
  </ul>
  {/if}
  <!--  -->
  {#if state === 'unselected'}
  <button class="memo-button" on:click="{addPin}">
    <Pin color="#eee"/>
  </button>
  {/if}
  <!--  -->
  {#if state === 'selected'}
  <button class="memo-button modify" on:click="{editCurrentPin}">
      <Edit color="#eee"/>
  </button>
  <button class="memo-button modify" on:click="{deleteCurrentPin}">
      <Delete color="#eee"/>
  </button>
  {/if}
  <!--  -->
  {#if state === 'editing'}
  <button class="memo-button modify" on:click="{savePin}">
      <Save color="#eee"/>
  </button>
  <button class="memo-button modify" on:click="{discardPin}">
      <Undo color="#eee"/>
  </button>
  <button class="memo-button modify" on:click="{deleteCurrentPin}">
      <Delete color="#eee"/>
  </button>
  {/if}
</div>

<style lang="less">
  .controls {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .memo-button {
    font-size: 30px;
    color: #eee;
    text-align: center;
    height: 50px;
    width: 50px;
    border-radius: 50%;
    border: 1px solid #ccc;
    background: #333;
    box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
    /* padding: 5px; */
    padding: 12px;
  }


  .modify {
    margin-left: 10px;
    margin-right: 0px;
  }

  ul {
    margin: 0;
    padding: 0;
    display: flex;
  }

  li {
    font-size: 20px;
    color: #eee;
    text-align: center;
    height: 50px;
    min-width: 50px;
    border-radius: 25px;
    border: 1px solid #ccc;
    background: #333;
    box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 10px;
    margin: 0 10px;
  }

  .selected {
    color: limegreen;
  }
</style>
