export default {
  systemBar: {
    start: {
      button: {
        label: 'Start',
      },
    },
    applicationList: {
      empty: 'There are no applications'
    }
  },
  fs: {
    contextMenu: {
      'open': 'Open',
      'rename': 'Rename',
      'delete': 'Delete',
      'print': 'Print',
      'sendTo': 'Send To',
      'cut': 'Cut',
      'copy': 'Copy',
      'properties': 'Properties',
      'createShortcut': 'Create Shortcut',
    }
  },
  apps: {
    calculator: {
      title: 'Calculator',
      display: 'Calculator display',
      error: 'Error',
      key: {
        memoryClear: 'Memory clear',
        memoryRecall: 'Memory recall',
        memoryStore: 'Memory store',
        memoryAdd: 'Memory add',
        memorySubtract: 'Memory subtract',
        backspace: 'Backspace',
        clearEntry: 'Clear entry',
        clear: 'Clear all',
        negate: 'Negate',
        sqrt: 'Square root',
        percent: 'Percent',
        divide: 'Divide',
        multiply: 'Multiply',
        subtract: 'Subtract',
        add: 'Add',
        decimal: 'Decimal separator',
        equals: 'Equals',
      },
    },
    explorer: {
      titleExploring: 'Exploring - {path}',
      address: 'Address',
      menu: {
        file: 'File',
        edit: 'Edit',
        view: 'View',
        help: 'Help',
      },
      action: {
        yes: 'Yes',
        no: 'No',
        back: 'Back',
        forward: 'Forward',
        up: 'Up',
        undo: 'Undo',
        delete: 'Delete',
        properties: 'Properties',
        newFolder: 'New Folder',
        ok: 'OK',
        cancel: 'Cancel',
        close: 'Close',
        cut: 'Cut',
        copy: 'Copy',
        rename: 'Rename',
        paste: 'Paste',
        pasteShortcut: 'Paste shortcut',
        selectAll: 'Select All',
        invertSelection: 'Invert selection',
        refresh: 'Refresh',
        sortBy: 'Sort by',
        about: 'About Explorer'
      },
      layout: {
        largeIcons: 'Large Icons',
        smallIcons: 'Small Icons',
        list: 'List',
        details: 'Details',
      },
      view: {
        showHiddenFiles: 'Show hidden files',
      },
      sortBy: {
        name: 'Name',
        size: 'Size',
        date: 'Date Modified',
      },
      dialog: {
        deleteFile: {
          confirm: {
            title: 'Confirm File Delete',
            message: {
              toVoid: "Are you sure you want to delete '{fileName}'?",
              toTrash: "Are you sure you want to send '{fileName}' to the Recycle Bin?"
            }
          }
        },
        deleteFiles: {
          confirm: {
            title: 'Confirm Files Delete',
            message: {
              toVoid: "Are you sure you want to delete {count} files?",
              toTrash: "Are you sure you want to send {count} files to the Recycle Bin?"
            }
          }
        },
        deleteFolder: {
          confirm: {
            title: 'Confirm Folder Delete',
            message: "Are you sure you want to remove the folder {name} and all its content?"
          }
        },
        fileOverride: {
          confirm: {
            title: 'Confirm File Replace',
            message: "The folder already contains a file named {name}."
          }
        },
        shortcutOverride: {
          confirm: {
            title: 'Confirm File Replace',
            message: "The folder already contains a file named {name}."
          }
        }
      }
    }
  },
}
