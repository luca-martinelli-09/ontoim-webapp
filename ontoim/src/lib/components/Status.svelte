<script>
  import Message from "./Message.svelte";
  import Loading from "./Loading.svelte";
  import { ERROR, LOADING } from "../utils";

  export let status;
</script>

{#if status == ERROR}
  <Message message="Impossibile caricare gli elementi" type="error" />
{:else if status == LOADING}
  <div class="flex justify-center">
    <Loading />
  </div>
{/if}
