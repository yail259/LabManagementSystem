<script lang="ts">
  import { auth } from "$lib/firebase";
  import { onMount } from "svelte";

  let user: any = null;

  onMount(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      user = currentUser;
    });

    return unsubscribe;
  });
</script>

<div class="dashboard">
  <h1>Welcome to your Dashboard</h1>
  {#if user}
    <p>Hello, {user.displayName || user.email}!</p>
    <nav>
      <ul>
        <li><a href="/create-booking">Create Booking</a></li>
        <li><a href="/my-bookings">My Bookings</a></li>
        <li><a href="/timetable">View Timetable</a></li>
        <li><a href="/manage-resources">Manage Locations & Equipment</a></li>
      </ul>
    </nav>
  {:else}
    <p>Loading user information...</p>
  {/if}
</div>

<style>
  .dashboard {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  h1 {
    color: #333;
  }

  nav ul {
    list-style-type: none;
    padding: 0;
  }

  nav ul li {
    margin-bottom: 10px;
  }

  nav ul li a {
    text-decoration: none;
    color: #4285f4;
    font-weight: bold;
    font-size: 18px;
    padding: 10px 15px;
    border-radius: 5px;
    background-color: #f0f0f0;
    display: inline-block;
    transition: background-color 0.3s ease;
  }

  nav ul li a:hover {
    background-color: #e0e0e0;
  }
</style>
