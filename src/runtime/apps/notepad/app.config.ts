import type { IApplicationController } from '@owdproject/core'

export default {
  id: 'org.owdproject.notepad',
  title: 'Notepad',
  category: 'accessories',
  singleton: false,
  icon: 'mdi:file-document-outline',
  provides: {
    name: 'text-editor',
    entry: 'notepad',
  },
  windows: {
    main: {
      component: () => import('./components/Window/WindowNotepad.vue'),
      resizable: true,
      size: {
        width: 560,
        height: 400,
        minWidth: 280,
        minHeight: 200,
      },
      position: {
        x: 180,
        y: 120,
        z: 0,
      },
    },
  },
  entries: {
    notepad: {
      command: 'notepad',
    },
  },
  commands: {
    notepad: (app: IApplicationController, args: unknown) => {
      const a = args as { _?: string[] } | undefined
      // Extract file path if launched with one (e.g. `notepad file.txt`)
      const pathArg = a?._?.[1]
      return app.openWindow('main', undefined, { path: pathArg })
    },
  },
}
