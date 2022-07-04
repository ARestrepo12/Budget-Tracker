let db;

const request = indexedDB.open("tracker", 1);


request.onupgradeneeded = function (event) {
    const db = event.target.results;

    db.createObjectStore("new_transaction", {autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.results;

    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["new_transaction"], "readwrite");

    const transactObjectStore = transaction.objectStore("new_transaction");

    transactObjectStore.add(record);
}

function uploadTransaction() {
    const transaction = db.transaction(["new_transaction"], "readwrite");

    const transactObjectStore = transaction.objectStore("new_transaction");

    const getAll = transactObjectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            })
            .then((response) => {
                response.json();
            })
            .then((serverResponse) => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }

                const transaction = db.transaction(["new_transaction"], "readwrite");

                const transactObjectStore = 
                transaction.objectStore("new_transaction");

                transactObjectStore.clear();

                alert("All saved pizza has been submitted");
            })
            .catch((err) => {
                console.log(err);
            });
        }
    };
}

window.addEventListener('online', uploadTransaction);