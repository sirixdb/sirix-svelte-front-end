<script lang="ts">
  export let resourceName: string;
  export let dbName: string;
  export let dbType: string;

  import { selected, refreshHistory } from "../../store";
  const selectResource = () => {
    let refresh = true;
    selected.update((old) => {
      if (old.dbName === dbName && old.resourceName === resourceName) {
        refresh = false;
      }
      return { dbName, dbType, resourceName, revision: 0, diff: null };
    });
    if (refresh) {
      refreshHistory.refresh();
    }
  };

  import DeleteDialog from "./DeleteDialog.svelte";
  import { openModal } from "renderless-svelte";

  import Trash from "../icons/Trash.svelte";

  let height: number;
</script>

<div
  class="cursor-pointer text-gray-100 opacity-100 hover:bg-gray-700 p-2 m-1 mr-2
    ml-8 overflow-hidden rounded-full"
  on:click|stopPropagation={selectResource}>
  <span class="inline-block" bind:clientHeight={height}>{resourceName}</span>
  <span
    on:click|stopPropagation={() => openModal({
        component: DeleteDialog,
        props: {
          dbName,
          dbType,
          resourceName,
        },
      })}
    style="height: {height}px; width: {height}px;"
    class="float-right cursor-pointer bg-red-600 rounded-full text-center ml-2">
    <Trash color="#FFF" size={height > 0 ? height - 10 : height} />
  </span>
</div>
