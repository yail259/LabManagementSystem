<script lang="ts">
  import { page } from "$app/stores";
  import { auth } from "$lib/firebase";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let isMobileMenuOpen = false;

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }

  async function signOut() {
    try {
      await auth.signOut();
      goto("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  onMount(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        isMobileMenuOpen = false;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<nav>
  <div class="burger" on:click={toggleMobileMenu}>
    <span></span>
    <span></span>
    <span></span>
  </div>
  <ul class:open={isMobileMenuOpen}>
    <li class:active={$page.url.pathname === "/dashboard"}>
      <a href="/dashboard" on:click={toggleMobileMenu}>Dashboard</a>
    </li>
    <li class:active={$page.url.pathname === "/create-booking"}>
      <a href="/create-booking" on:click={toggleMobileMenu}>Create Booking</a>
    </li>
    <li class:active={$page.url.pathname === "/my-bookings"}>
      <a href="/my-bookings" on:click={toggleMobileMenu}>My Bookings</a>
    </li>
    <li class:active={$page.url.pathname === "/timetable"}>
      <a href="/timetable" on:click={toggleMobileMenu}>Timetable</a>
    </li>
    <li class:active={$page.url.pathname === "/manage-resources"}>
      <a href="/manage-resources" on:click={toggleMobileMenu}>Manage Resources</a>
    </li>
    <li>
      <button on:click={() => { signOut(); toggleMobileMenu(); }}>Sign Out</button>
    </li>
  </ul>
</nav>

<style>
  nav {
    background-color: #4285f4;
    padding: 10px;
    position: relative;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }

  li {
    margin: 5px;
  }

  a,
  button {
    color: white;
    text-decoration: none;
    padding: 10px 15px;
    border-radius: 5px;
    transition: background-color 0.3s ease;
    font-weight: bold;
  }

  a:hover,
  button:hover {
    background-color: #357ae8;
  }

  .active a {
    background-color: #357ae8;
  }

  button {
    background: none;
    border: none;
    font: inherit;
    cursor: pointer;
  }

  .burger {
    display: none;
    flex-direction: column;
    cursor: pointer;
  }

  .burger span {
    height: 3px;
    width: 25px;
    background-color: white;
    margin: 3px 0;
    transition: 0.4s;
  }

  @media (max-width: 768px) {
    .burger {
      display: flex;
    }

    ul {
      display: none;
      flex-direction: column;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background-color: #4285f4;
      z-index: 1;
    }

    ul.open {
      display: flex;
    }

    li {
      margin: 5px 0;
    }

    a,
    button {
      display: block;
      text-align: center;
    }
  }
</style>
