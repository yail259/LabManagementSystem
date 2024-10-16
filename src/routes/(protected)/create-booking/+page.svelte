<script lang="ts">
  import { auth, db } from "$lib/firebase";
  import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    Timestamp,
  } from "firebase/firestore";
  // import { User } from "firebase/auth";
  import { onMount } from "svelte";
  import Loading from "$lib/components/Loading.svelte";

  let date = "";
  let startTime = "";
  let endTime = "";
  let location = "";
  let selectedEquipment: string[] = [];
  let comments = "";

  let locations: string[] = [];
  let equipment: string[] = [];

  let errorMessage = "";
  let successMessage = "";
  let loading = false;

  // Generate hour options
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return `${hour}:00`;
  });

  onMount(async () => {
    loading = true;
    try {
      await fetchLocationsAndEquipment();
    } catch (error) {
      console.error("Error fetching data:", error);
      errorMessage =
        "Failed to load locations and equipment. Please try again.";
    } finally {
      loading = false;
    }
  });

  async function fetchLocationsAndEquipment() {
    const locationsSnapshot = await getDocs(collection(db, "locations"));
    locations = locationsSnapshot.docs.map((doc) => doc.data().name);

    const equipmentSnapshot = await getDocs(collection(db, "equipment"));
    equipment = equipmentSnapshot.docs.map((doc) => doc.data().name);
  }

  async function fetchExistingBookings(date: string, location: string) {
    const bookingsRef = collection(db, "bookings");
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      bookingsRef,
      where("date", ">=", Timestamp.fromDate(startOfDay)),
      where("date", "<=", Timestamp.fromDate(endOfDay)),
      where("location", "==", location)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data());
  }

  function checkTimeOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    return start1 < end2 && start2 < end1;
  }

  async function checkForClashes(
    date: string,
    startTime: string,
    endTime: string,
    location: string
  ): Promise<boolean> {
    const existingBookings = await fetchExistingBookings(date, location);
    return existingBookings.some((booking) =>
      checkTimeOverlap(startTime, endTime, booking.startTime, booking.endTime)
    );
  }

  async function createBooking(user: User) {
    const dateTimestamp = Timestamp.fromDate(new Date(date));

    await addDoc(collection(db, "bookings"), {
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName,
      date: dateTimestamp,
      startTime,
      endTime,
      location,
      equipment: selectedEquipment,
      comments,
      createdAt: Timestamp.now(),
    });

    successMessage = "Booking created successfully!";
    // Reset form
    date = "";
    startTime = "";
    endTime = "";
    location = "";
    selectedEquipment = [];
    comments = "";
  }

  async function handleSubmit() {
    loading = true;
    errorMessage = "";
    successMessage = "";

    if (!date || !startTime || !endTime || !location) {
      errorMessage = "Please fill in all required fields.";
      loading = false;
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      errorMessage = "You must be logged in to create a booking.";
      loading = false;
      return;
    }

    try {
      // Check for clashes
      const hasClash = await checkForClashes(
        date,
        startTime,
        endTime,
        location
      );
      if (hasClash) {
        const confirmBooking = confirm(
          "There is a booking clash. Do you want to proceed with the booking anyway?"
        );
        if (!confirmBooking) {
          loading = false;
          return;
        }
      }

      await createBooking(user);
    } catch (error) {
      console.error("Error creating booking:", error);
      errorMessage =
        "An error occurred while creating the booking. Please try again.";
    } finally {
      loading = false;
    }
  }
</script>

<div class="create-booking">
  <h1>Create a New Booking</h1>

  {#if loading}
    <Loading />
  {:else}
    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        <label for="date">Date:</label>
        <input type="date" id="date" bind:value={date} required />
      </div>

      <div class="form-group">
        <label for="startTime">Start Time:</label>
        <select id="startTime" bind:value={startTime} required>
          <option value="">Select start time</option>
          {#each hourOptions as hour}
            <option value={hour}>{hour}</option>
          {/each}
        </select>
      </div>

      <div class="form-group">
        <label for="endTime">End Time:</label>
        <select id="endTime" bind:value={endTime} required>
          <option value="">Select end time</option>
          {#each hourOptions as hour}
            <option value={hour}>{hour}</option>
          {/each}
        </select>
      </div>

      <div class="form-group">
        <label for="location">Location:</label>
        <select id="location" bind:value={location} required>
          <option value="">Select a location</option>
          {#each locations as loc}
            <option value={loc}>{loc}</option>
          {/each}
        </select>
      </div>

      <div class="form-group">
        <label>Equipment:</label>
        {#each equipment as equip}
          <label>
            <input
              type="checkbox"
              bind:group={selectedEquipment}
              value={equip}
            />
            {equip}
          </label>
        {/each}
      </div>

      <div class="form-group">
        <label for="comments">Comments:</label>
        <textarea id="comments" bind:value={comments}></textarea>
      </div>

      <button type="submit" disabled={loading}>Create Booking</button>
    </form>
  {/if}

  {#if errorMessage}
    <p class="error">{errorMessage}</p>
  {/if}

  {#if successMessage}
    <p class="success">{successMessage}</p>
  {/if}
</div>

<style>
  .create-booking {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  label {
    display: block;
    margin-bottom: 5px;
  }

  input[type="date"],
  select,
  textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  button {
    background-color: #4285f4;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
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
  }

  .success {
    color: green;
  }
</style>
