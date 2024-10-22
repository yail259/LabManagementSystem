<script lang="ts">
  import { auth } from "$lib/firebase";
  import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let loading = false;
  let error = "";

  onMount(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        goto("/dashboard");
      }
    });

    return unsubscribe;
  });

  async function signInWithGoogle() {
    loading = true;
    error = "";
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Redirect will be handled by onAuthStateChanged
    } catch (err) {
      console.error("Error signing in with Google", err);
      error = "Failed to sign in. Please try again.";
    } finally {
      loading = false;
    }
  }
</script>

<div class="signin-container">
  <h1>Sign In</h1>
  {#if loading}
    <p>Loading...</p>
  {:else}
    <button on:click={signInWithGoogle} disabled={loading}
      >Sign in with Google</button
    >
  {/if}
  {#if error}
    <p class="error">{error}</p>
  {/if}
</div>

<style>
  .signin-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }

  button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  button:hover:not(:disabled) {
    background-color: #357ae8;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error {
    color: red;
    margin-top: 10px;
  }
</style>
