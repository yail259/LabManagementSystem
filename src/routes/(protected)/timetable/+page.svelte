<script lang="ts">
  import { onMount } from "svelte";
  import { db } from "$lib/firebase";
  import {
    collection,
    query,
    where,
    getDocs,
    Timestamp,
  } from "firebase/firestore";
  import Loading from "$lib/components/Loading.svelte";

  interface Booking {
    id: string;
    date: Timestamp;
    startTime: string;
    endTime: string;
    location: string;
    userName: string;
    equipment: string[];
    comments: string;
  }

  interface TimeSlot {
    time: string;
    bookings: Booking[][];
  }

  let timetable: TimeSlot[] = [];
  let locations: string[] = [];
  let selectedDate: string;
  let loading = false;
  let errorMessage = "";

  onMount(async () => {
    loading = true;
    try {
      await fetchLocations();
      selectedDate = new Date().toISOString().split('T')[0];
      await fetchBookings();
    } catch (error) {
      console.error("Error fetching data:", error);
      errorMessage = "Failed to load timetable. Please try again.";
    } finally {
      loading = false;
    }
  });

  async function fetchLocations() {
    const locationsSnapshot = await getDocs(collection(db, "locations"));
    locations = locationsSnapshot.docs.map((doc) => doc.data().name as string);
  }

  async function fetchBookings() {
    const startDate = new Date(selectedDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const bookingsQuery = query(
      collection(db, "bookings"),
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<", Timestamp.fromDate(endDate))
    );

    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookings = bookingsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Booking
    );

    generateTimetable(bookings);
  }

  function generateTimetable(bookings: Booking[]) {
    timetable = [];
    for (let hour = 0; hour < 24; hour++) {
      const timeSlot: TimeSlot = {
        time: `${hour.toString().padStart(2, "0")}:00`,
        bookings: locations.map(() => []),
      };

      bookings.forEach((booking) => {
        const bookingStartHour = parseInt(booking.startTime.split(":")[0]);
        const bookingEndHour = parseInt(booking.endTime.split(":")[0]);

        if (hour >= bookingStartHour && hour < bookingEndHour) {
          const locationIndex = locations.indexOf(booking.location);
          if (locationIndex !== -1) {
            timeSlot.bookings[locationIndex].push(booking);
          }
        }
      });

      timetable.push(timeSlot);
    }
  }

  async function handleDateChange() {
    loading = true;
    try {
      await fetchBookings();
    } catch (error) {
      console.error("Error fetching bookings:", error);
      errorMessage = "Failed to load timetable. Please try again.";
    } finally {
      loading = false;
    }
  }
</script>

<div class="timetable">
  <h1>Timetable</h1>
  <div class="date-selector">
    <label for="date-input">Select Date:</label>
    <input
      type="date"
      id="date-input"
      bind:value={selectedDate}
      on:change={handleDateChange}
    />
  </div>
  {#if loading}
    <Loading />
  {:else if errorMessage}
    <p class="error">{errorMessage}</p>
  {:else}
    <table>
      <thead>
        <tr>
          <th>Time</th>
          {#each locations as location}
            <th>{location}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each timetable as slot}
          <tr>
            <td>{slot.time}</td>
            {#each slot.bookings as locationBookings}
              <td>
                {#each locationBookings as booking}
                  <div class="booking">
                    <strong>{booking.userName}</strong>
                    <br />
                    Equipment: {booking.equipment.join(", ")}
                    <br />
                    {booking.comments}
                  </div>
                {/each}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .timetable {
    max-width: 100%;
    overflow-x: auto;
  }

  .date-selector {
    margin-bottom: 1rem;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  th,
  td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
  }

  .booking {
    background-color: #e6f2ff;
    border-radius: 4px;
    padding: 4px;
    margin-bottom: 4px;
  }

  .error {
    color: red;
  }
</style>
