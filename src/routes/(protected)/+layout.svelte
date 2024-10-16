<script lang="ts">
  import { onMount } from "svelte";
  import { auth } from "$lib/firebase";
  import { goto } from "$app/navigation";
  import Navigation from "$lib/components/Navigation.svelte";

  onMount(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        goto("/signin");
      }
    });

    return unsubscribe;
  });
</script>

<Navigation />

<main>
  <slot />
</main>

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  @media (max-width: 768px) {
    main {
      padding: 10px;
    }
  }
</style>
