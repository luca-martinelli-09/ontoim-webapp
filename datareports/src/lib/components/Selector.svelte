<script>
  export let name;
  export let options;
  export let defaultSelection;
  export let onSelect;
</script>

<ul class="flex flex-wrap gap-2 p-0 m-0 mb-8">
  {#each options as option}
    <li class="p-0">
      <input type="radio" checked={option == defaultSelection} on:change={(e) => onSelect(e.target.value)} name={name} id="{name}-{option}" value={option} class="hidden peer" required />
      <label
        for="{name}-{option}"
        class="font-sans rounded-sm justify-between items-center py-2 px-4 cursor-pointer border-2 border-black bg-[#FFF3E1] peer-checked:bg-[#105652] peer-checked:text-white peer-checked:border-[#105652]"
      >
        {option}
      </label>
    </li>
  {/each}
</ul>
