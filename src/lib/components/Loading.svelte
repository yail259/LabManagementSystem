<script lang="ts">
  export let size = 40;
  export let color = "#4285f4";
</script>

<div class="loading-spinner" style="width: {size}px; height: {size}px;">
  <div
    class="spinner"
    style="border-color: {color} transparent transparent transparent;"
  ></div>
</div>

<style>
  .loading-spinner {
    display: inline-block;
    position: relative;
  }
  .spinner {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    border: 4px solid;
    border-radius: 50%;
    animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
