<script lang="ts">
  import { onMount } from "svelte";
  import { auth, db, storage } from "$lib/firebase";
  // import type { User } from "firebase/auth";
  import {
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    Timestamp,
    orderBy,
    limit,
    startAfter,
  } from "firebase/firestore";
  import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
  import Loading from "$lib/components/Loading.svelte";

  interface Booking {
    id: string;
    date: Timestamp;
    startTime: string;
    endTime: string;
    location: string;
    equipment: string[];
    comments: string;
    picture?: string;
  }

  let bookings: Booking[] = [];
  let selectedFile: File | null = null;
  let loading = false;
  let errorMessage = "";
  let successMessage = "";
  let lastVisible: any = null;
  let noMoreBookings = false;

  onMount(() => {
    fetchBookings();
  });

  async function fetchBookings(loadMore = false) {
    loading = true;
    errorMessage = "";
    const user = auth.currentUser;
    if (!user) {
      errorMessage = "User not authenticated";
      loading = false;
      return;
    }

    try {
      let bookingsQuery = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid),
        orderBy("date", "desc"),
        limit(10)
      );

      if (loadMore && lastVisible) {
        bookingsQuery = query(
          collection(db, "bookings"),
          where("userId", "==", user.uid),
          orderBy("date", "desc"),
          startAfter(lastVisible),
          limit(10)
        );
      }

      const bookingsSnapshot = await getDocs(bookingsQuery);

      if (bookingsSnapshot.empty) {
        noMoreBookings = true;
      } else {
        const newBookings = bookingsSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Booking
        );

        if (loadMore) {
          bookings = [...bookings, ...newBookings];
        } else {
          bookings = newBookings;
        }

        lastVisible = bookingsSnapshot.docs[bookingsSnapshot.docs.length - 1];
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      errorMessage = "Failed to load bookings. Please try again.";
    } finally {
      loading = false;
    }
  }

  async function cancelBooking(bookingId: string) {
    loading = true;
    errorMessage = "";
    successMessage = "";
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const now = new Date();
    const bookingStart = new Date(
      booking.date.seconds * 1000 + parseTime(booking.startTime)
    );

    if (now >= bookingStart) {
      errorMessage =
        "Cannot cancel a booking that has already started or ended.";
      loading = false;
      return;
    }

    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      bookings = bookings.filter((b) => b.id !== bookingId);
      successMessage = "Booking cancelled successfully.";
    } catch (error) {
      console.error("Error cancelling booking:", error);
      errorMessage = "Failed to cancel booking. Please try again.";
    } finally {
      loading = false;
    }
  }

  function parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 3600000 + minutes * 60000;
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      selectedFile = target.files[0];
    }
  }

  async function uploadPicture(bookingId: string) {
    loading = true;
    errorMessage = "";
    successMessage = "";
    if (!selectedFile) {
      errorMessage = "Please select a file to upload.";
      loading = false;
      return;
    }

    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    try {
      const storageRef = ref(storage, `booking-pictures/${bookingId}`);
      await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "bookings", bookingId), {
        picture: downloadURL,
      });

      booking.picture = downloadURL;
      bookings = [...bookings];
      successMessage = "Picture uploaded successfully.";
      selectedFile = null;
    } catch (error) {
      console.error("Error uploading picture:", error);
      errorMessage = "Failed to upload picture. Please try again.";
    } finally {
      loading = false;
    }
  }
</script>

<div class="my-bookings">
  <h1>My Bookings</h1>
  {#if loading && bookings.length === 0}
    <Loading />
  {:else if errorMessage}
    <p class="error">{errorMessage}</p>
  {:else if bookings.length === 0}
    <p>You have no bookings.</p>
  {:else}
    {#each bookings as booking}
      <div class="booking">
        <h2>{booking.location}</h2>
        <p>
          Date: {new Date(booking.date.seconds * 1000).toLocaleDateString()}
        </p>
        <p>Time: {booking.startTime} - {booking.endTime}</p>
        <p>Equipment: {booking.equipment.join(", ")}</p>
        <p>Comments: {booking.comments}</p>
        {#if !booking.picture}
          <button on:click={() => cancelBooking(booking.id)}
            >Cancel Booking</button
          >
          <input type="file" accept="image/*" on:change={handleFileSelect} />
          <button on:click={() => uploadPicture(booking.id)}
            >Upload Picture</button
          >
        {:else}
          <img
            src={booking.picture}
            alt="Booking picture"
            class="booking-picture"
          />
        {/if}
      </div>
    {/each}
    {#if !noMoreBookings}
      <button on:click={() => fetchBookings(true)} disabled={loading}>
        {loading ? "Loading..." : "Load More"}
      </button>
    {/if}
  {/if}
  {#if successMessage}
    <p class="success">{successMessage}</p>
  {/if}
</div>

<style>
  .my-bookings {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .booking {
    background-color: #f0f0f0;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }

  h1 {
    color: #333;
  }

  h2 {
    color: #4285f4;
  }

  button {
    background-color: #4285f4;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 8px;
  }

  button:hover:not(:disabled) {
    background-color: #357ae8;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  input[type="file"] {
    margin-bottom: 8px;
  }

  .booking-picture {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin-top: 8px;
  }

  .error {
    color: red;
  }

  .success {
    color: green;
  }
</style>
