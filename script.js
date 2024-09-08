document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form");
    const bookingTableBody = document.getElementById("booking-table").getElementsByTagName('tbody')[0];
    const filters = document.getElementById("filters");

    const apiUrl = 'https://crudcrud.com/api/33d3aed843df484db009372a3d76a27c/bookings';
    let isEditing = false;
    let currentEditId = null;

    // Fetch and display existing bookings from the API
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            data.forEach(booking => {
                addBookingToTable(booking);  // Add fetched booking to the table
            });
        })
        .catch(error => console.error('Error fetching bookings:', error));

    // Handle form submission (Create or Update operation)
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const phonenumber = document.getElementById("phonenumber").value;
        const busselector = document.getElementById("buses").value;

        const bookingData = {
            title: username,
            body: email,
            userId: phonenumber,
            bus: busselector
        };

        if (isEditing) {
            // Update booking if editing
            updateBooking(currentEditId, bookingData);
        } else {
            // Create new booking
            createBooking(bookingData);
        }
    });

    // Create new booking (POST request)
    function createBooking(bookingData) {
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
        })
            .then(response => response.json())
            .then(data => {
                addBookingToTable(data);  // Add newly created booking to the table
                form.reset();
            })
            .catch(error => console.error('Error creating booking:', error));
    }

    // Update existing booking (PUT request)
    function updateBooking(id, updatedBooking) {
        fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedBooking),
        })
            .then(() => {
                addBookingToTable(updatedBooking);  // Re-add the updated booking to the table
                form.reset();
                isEditing = false;
                currentEditId = null;
            })
            .catch(error => console.error('Error updating booking:', error));
    }

    // Function to add a booking to the table
    function addBookingToTable(data) {
        const row = bookingTableBody.insertRow();
        row.setAttribute('data-id', data._id);  // Store the unique ID for future updates and deletes
        row.setAttribute('data-bus', data.bus); // Set a data attribute for filtering

        row.innerHTML = `
            <td>${data.title}</td>
            <td>${data.body}</td>
            <td>${data.userId}</td>
            <td>${data.bus}</td>
            <td>
                <button class="edit-btn btn">Edit</button>
                <button class="delete-btn btn">Delete</button>
            </td>
        `;

        // Add event listeners for edit and delete buttons
        row.querySelector(".edit-btn").addEventListener("click", () => {
            isEditing = true;
            currentEditId = data._id;
            editBooking(data);
        });
        row.querySelector(".delete-btn").addEventListener("click", () => deleteBooking(row, data._id));
    }

    // Handle editing a booking
    function editBooking(data) {
        document.getElementById("username").value = data.title;
        document.getElementById("email").value = data.body;
        document.getElementById("phonenumber").value = data.userId;
        document.getElementById("buses").value = data.bus;
    }

    // Handle deleting a booking (Delete operation)
    function deleteBooking(row, id) {
        fetch(`${apiUrl}/${id}`, {
            method: 'DELETE',
        })
            .then(() => {
                row.remove();  // Remove the row from the table
            })
            .catch(error => console.error('Error deleting booking:', error));
    }

    // Handle filtering
    filters.addEventListener("change", function () {
        const filterValue = filters.value;
        const rows = bookingTableBody.getElementsByTagName('tr');

        Array.from(rows).forEach(row => {
            if (filterValue === 'all' || row.getAttribute('data-bus') === filterValue) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
});
