document.addEventListener("DOMContentLoaded", function () {
  const itemList = document.getElementById("item-list");
  const newItemInput = document.getElementById("new-item");
  const addButton = document.getElementById("add-button");
  const syncCheckbox = document.getElementById("sync-checkbox");
  const syncButton = document.getElementById("sync-button");

  // Load syncCheckbox value from local storage
  browser.storage.local.get("syncEnabled", function (result) {
    if (result.syncEnabled !== undefined) {
      syncCheckbox.checked = result.syncEnabled;
    }
  });

  // Load items from storage and populate the list
  function loadItems() {
    browser.storage.local.get("items", function (localResult) {
      if (localResult.items) {
        localResult.items.forEach((item) => {
          addItemToList(item);
        });
      } else {
        // If no local items, check for synced items
        browser.storage.sync.get("items", function (syncResult) {
          if (syncResult.items) {
            // Save synced items to local storage
            saveItems(syncResult.items);
            // Populate itemList with synced items
            syncResult.items.forEach((item) => {
              addItemToList(item);
            });
          }
        });
      }
    });
  }

  // Save items to storage
  function saveItems(items) {
    browser.storage.local.set({ items: items });
  }

  // Add item to the list
  function addItemToList(itemText) {
    const li = document.createElement("li");
    li.textContent = itemText;

    // Create delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
      deleteItem(itemText);
      li.remove();
    });

    li.appendChild(deleteButton);
    itemList.appendChild(li);
  }

  // Delete item from the list and storage
  function deleteItem(itemText) {
    browser.storage.local.get("items", function (result) {
      if (result.items) {
        const updatedItems = result.items.filter((item) => item !== itemText);
        saveItems(updatedItems);
      }
    });
  }

  // Button click event to add new item
  addButton.addEventListener("click", function () {
    const newItemText = newItemInput.value.trim();
    if (newItemText !== "") {
      addItemToList(newItemText);

      // Load existing items from storage
      browser.storage.local.get("items", function (result) {
        let items = [];
        if (result.items) {
          items = result.items;
        }
        items.push(newItemText);

        // Save items to storage
        saveItems(items);

        // Save syncCheckbox value to local storage
        browser.storage.local.set({ syncEnabled: syncCheckbox.checked });

        // Sync with account if checkbox is checked
        if (syncCheckbox.checked) {
          browser.storage.sync.set({ items: items });
        }
      });

      newItemInput.value = "";
    }
  });

  // Sync button click event
  syncButton.addEventListener("click", function () {
    browser.storage.sync.get("items", function (result) {
      if (result.items) {
        // Save synced items to local storage
        saveItems(result.items);
        // Clear current list
        itemList.innerHTML = "";
        // Populate itemList with synced items
        result.items.forEach((item) => {
          addItemToList(item);
        });
      }
    });
  });

  // Load items when popup is opened
  loadItems();
});
