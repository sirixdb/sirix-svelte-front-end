<script>
  let show = false;
  let height;
  import Trash from "../icons/Trash.svelte";

  import { selected } from "../../store";
  import { onDestroy } from "svelte";
  let dbName, dbType, resourceName;
  const unsubscribe = selected.subscribe((sel) => {
    ({ dbName, dbType, resourceName } = sel);
  });
  onDestroy(unsubscribe);

  export let nodeId;

  import { sirix } from "../../sirix";
  import { DBType } from "sirixdb";
  const del = () => {
    const resource = sirix
      .database(dbName, dbType === "json" ? DBType.JSON : DBType.XML)
      .resource(resourceName);
    resource.delete(nodeId, null).then((resp) => {
      //TODO
      console.log(resp);
    });
  };
</script>

<style>

</style>

<!-- dropdown menu button -->
<span
  on:click|stopPropagation={() => (show = !show)}
  class="inline-block cursor-pointer px-1 text-center text-sm hover:shadow-inner
  rounded-full">
  &#10247;
</span>

<!-- dropdown menu -->
{#if show}
  <div
    class="shadow-sm bg-gray-100 absolute z-10 pointer-events-auto rounded-lg">
    <ul class="list-none p-1 m-0">
      <li
        on:click|stopPropagation={del}
        style="width: {height}px; height: {height}px"
        class="cursor-pointer bg-red-600 rounded-full text-center p-0">
        <Trash color="#FFF" size={height * 0.7} />
      </li>
      <li
        style="width: {height}px"
        bind:clientHeight={height}
        class="cursor-pointer bg-blue-300 rounded-full text-blue-900 text-center
        text-sm p-0">
        &plus;
      </li>
    </ul>
  </div>
{/if}
