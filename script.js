document.addEventListener("DOMContentLoaded", () => {
    const bookList = document.getElementById("book-list");

    // fetch and display books - Pavan 21/07/2024
    function fetchBooks() {
        fetch('/books')
            .then(response => response.json())
            .then(books => {
                bookList.innerHTML = '';
                books.forEach(book => {
                    const bookDiv = document.createElement("div");
                    bookDiv.classList.add("book");

                    bookDiv.innerHTML = `
                        <img src="${book.image}" alt="${book.title}">
                        <h3>${book.title}</h3>
                        <p>Price: ${book.price}€</p>
                        <p>About: ${book.about}</p>
                        <button onclick="editBook(${book.id})">Edit</button>
                        <button onclick="deleteBook(${book.id})">Delete</button>
                    `;

                    bookList.appendChild(bookDiv);
                });
            });
    }

    // Fetching books on home page - Pavan 21/07/2024
    if (bookList) {
        fetchBooks();
    }

    // Adding - Pavan 21/07/2024 [CRUD operations]
    const addBookForm = document.getElementById('add-book-form');
    if (addBookForm) {
        addBookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);

            fetch('/books', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.id) {
                    window.location.href = 'home.html';
                }
            });
        });
    }

    
    // deleting  - Pavan 21/07/2024 [CRUD operations]
    window.deleteBook = function(id) {
        fetch(`/books/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.changes) {
                fetchBooks();
            }
        });
    }

    // edit - Pavan 21/07/2024 [CRUD operations]
    window.editBook = function(id) {
        const title = prompt('Enter new title');
        const price = prompt('Enter new price');
        const about = prompt('Enter new about');
        const image = document.createElement('input');
        image.type = 'file';
        image.accept = 'image/*';

        image.addEventListener('change', () => {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('price', price);
            formData.append('about', about);
            formData.append('image', image.files[0]);

            fetch(`/books/${id}`, {
                method: 'PUT',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.changes) {
                    fetchBooks();
                }
            });
        });

        image.click();
    }
});
