<script lang="ts">
  import { db } from "$lib/firebase";
  import { collection, addDoc, getDocs } from "firebase/firestore";
  import { onMount } from "svelte";

  let newLocation = "";
  let newEquipment = "";
  let locations: string[] = [];
  let equipment: string[] = [];

  onMount(async () => {
    await fetchLocations();
    await fetchEquipment();
  });

  async function fetchLocations() {
    const locationsSnapshot = await getDocs(collection(db, "locations"));
    locations = locationsSnapshot.docs.map((doc) => doc.data().name);
  }

  async function fetchEquipment() {
    const equipmentSnapshot = await getDocs(collection(db, "equipment"));
    equipment = equipmentSnapshot.docs.map((doc) => doc.data().name);
  }

  async function addLocation() {
    if (newLocation.trim() === "") return;
    await addDoc(collection(db, "locations"), { name: newLocation.trim() });
    newLocation = "";
    await fetchLocations();
  }

  async function addEquipment() {
    if (newEquipment.trim() === "") return;
    await addDoc(collection(db, "equipment"), { name: newEquipment.trim() });
    newEquipment = "";
    await fetchEquipment();
  }
</script>

<div class="manage-resources">
  <h1>Manage Locations and Equipment</h1>

  <div class="section">
    <h2>Add New Location</h2>
    <form on:submit|preventDefault={addLocation}>
      <input
        type="text"
        bind:value={newLocation}
        placeholder="Enter new location name"
      />
      <button type="submit">Add Location</button>
    </form>
    <h3>Existing Locations:</h3>
    <ul>
      {#each locations as location}
        <li>{location}</li>
      {/each}
    </ul>
  </div>

  <div class="section">
    <h2>Add New Equipment</h2>
    <form on:submit|preventDefault={addEquipment}>
      <input
        type="text"
        bind:value={newEquipment}
        placeholder="Enter new equipment name"
      />
      <button type="submit">Add Equipment</button>
    </form>
    <h3>Existing Equipment:</h3>
    <ul>
      {#each equipment as item}
        <li>{item}</li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .manage-resources {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .section {
    margin-bottom: 30px;
  }

  h1,
  h2,
  h3 {
    color: #333;
  }

  form {
    display: flex;
    margin-bottom: 15px;
  }

  input[type="text"] {
    flex-grow: 1;
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 4px 0 0 4px;
  }

  button {
    padding: 8px 16px;
    font-size: 16px;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
  }

  button:hover {
    background-color: #357ae8;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    background-color: #f0f0f0;
    margin-bottom: 5px;
    padding: 8px;
    border-radius: 4px;
  }
</style>
